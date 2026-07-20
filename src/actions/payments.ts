'use server';

import prisma from '@/lib/prisma';
import { auth } from '@/auth';
import { getEcommerceContextFromCookie } from '@/lib/ecommerce-context';
import { reserveCartItems, releaseUserReservations, ReservationItem } from '@/actions/reservations';
import { canBusinessUseEcommerce } from '@/lib/ecommerce-entitlements';

interface CheckoutItem extends ReservationItem {
  title?: string;
}

interface CheckoutData {
  items: CheckoutItem[];
  deliveryMethod: string;
  shippingAddress?: string;
  shippingCost: number;
  contactName: string;
  contactPhone: string;
  notes?: string;
  couponCode?: string;
  idempotencyKey?: string;
}

interface CulqiChargeResponse {
  id?: string;
  object?: string;
  outcome?: { type?: string };
  user_message?: string;
  merchant_message?: string;
}

function money(value: unknown) {
  return Math.round(Number(value) * 100) / 100;
}

async function calculateCanonicalCheckout(data: CheckoutData) {
  const { business, activeBranch, contractContext } = await getEcommerceContextFromCookie();
  if (!(await canBusinessUseEcommerce(business.id))) {
    throw new Error('El ecommerce no está habilitado para el plan de este negocio.');
  }
  const productIds = [...new Set(data.items.map(item => item.productId))];
  const products = await prisma.product.findMany({
    where: {
      id: { in: productIds },
      businessId: business.id,
      active: true,
      isAvailable: true,
      availableChannels: { in: ['ECOMMERCE', 'BOTH'] },
    },
    include: {
      variants: { where: { active: true }, orderBy: { createdAt: 'asc' } },
    },
  });

  if (products.length !== productIds.length) {
    throw new Error('Uno de los productos ya no está disponible.');
  }

  const canonicalItems = data.items.map(item => {
    const product = products.find(candidate => candidate.id === item.productId)!;
    const variant = item.variantId
      ? product.variants.find(candidate => candidate.id === item.variantId)
      : product.variants[0];

    if (!variant) throw new Error(`El producto ${product.title} no tiene una variante disponible.`);
    if (!Number.isInteger(item.quantity) || item.quantity < 1) throw new Error('Cantidad inválida.');

    const basePrice = Number(product.basePrice);
    const wholesalePrice = Number(product.wholesalePrice ?? 0);
    const unitPrice = wholesalePrice > 0 && product.wholesaleMinCount && item.quantity >= product.wholesaleMinCount
      ? wholesalePrice
      : product.discountPercentage > 0
        ? basePrice * (1 - product.discountPercentage / 100)
        : basePrice;

    return {
      productId: product.id,
      variantId: variant.id,
      productName: product.ecommerceDescription ? product.title : product.title,
      variantName: variant.name,
      quantity: item.quantity,
      price: money(unitPrice),
    };
  });

  const subtotal = money(canonicalItems.reduce((sum, item) => sum + item.price * item.quantity, 0));
  const storeConfig = await prisma.storeConfig.findFirst({ select: { localDeliveryPrice: true } });
  const shippingCost = data.deliveryMethod === 'DELIVERY' ? Number(storeConfig?.localDeliveryPrice ?? 0) : 0;

  let discount = 0;
  let couponCode: string | null = null;
  if (data.couponCode?.trim()) {
    const coupon = await prisma.coupon.findUnique({ where: { code: data.couponCode.trim().toUpperCase() } });
    const valid = coupon && coupon.isActive && (!coupon.branchId || coupon.branchId === activeBranch.id)
      && (!coupon.expirationDate || coupon.expirationDate >= new Date())
      && (coupon.maxUses === null || coupon.currentUses < coupon.maxUses);
    if (!valid) throw new Error('El cupón ya no es válido.');
    discount = coupon!.type === 'FIXED'
      ? Math.min(Number(coupon!.discount), subtotal)
      : subtotal * (Number(coupon!.discount) / 100);
    couponCode = coupon!.code;
  }

  const total = money(Math.max(0, subtotal - discount + shippingCost));

  return { business, canonicalItems, subtotal, discount: money(discount), shippingCost: money(shippingCost), total, couponCode, contractContext };
}

async function createCulqiCharge(args: {
  tokenId: string;
  amount: number;
  email: string;
  description: string;
  orderId: string;
}) {
  const secretKey = process.env.CULQI_SECRET_KEY;
  if (!secretKey) throw new Error('CULQI_SECRET_KEY no está configurada.');

  const response = await fetch('https://api.culqi.com/v2/charges', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${secretKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount: args.amount,
      currency_code: 'PEN',
      email: args.email,
      source_id: args.tokenId,
      description: args.description,
      metadata: { order_id: args.orderId },
    }),
    cache: 'no-store',
  });

  const payload = await response.json().catch(() => ({})) as CulqiChargeResponse;
  if (!response.ok || !payload.id) {
    throw new Error(payload.user_message || payload.merchant_message || 'Culqi rechazó el pago.');
  }
  return payload;
}

async function finalizePaidOrder(orderId: string, paymentId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { orderItems: true },
  });
  if (!order) throw new Error('Pedido no encontrado.');
  if (order.isPaid) return;
  if (!order.branchId) throw new Error('El pedido no tiene sucursal de preparación.');

  await prisma.$transaction(async tx => {
    for (const item of order.orderItems) {
      if (!item.variantId) throw new Error('El pedido contiene una variante inválida.');
      const stock = await tx.stock.findUnique({
        where: { branchId_variantId: { branchId: order.branchId!, variantId: item.variantId } },
      });
      if (!stock || stock.quantity < item.quantity) {
        throw new Error(`Stock insuficiente para ${item.productName}.`);
      }

      await tx.stock.update({
        where: { id: stock.id },
        data: { quantity: { decrement: item.quantity } },
      });
      await tx.stockMovement.create({
        data: {
          variantId: item.variantId,
          branchId: order.branchId,
          type: 'SALE_ECOMMERCE',
          quantity: -item.quantity,
          previousStock: stock.quantity,
          currentStock: stock.quantity - item.quantity,
          reason: `Venta online #${order.id.slice(0, 8).toUpperCase()}`,
        },
      });
    }

    await tx.order.update({
      where: { id: orderId },
      data: {
        isPaid: true,
        paymentStatus: 'PAID',
        paymentError: null,
        amountPaid: order.totalAmount,
        status: 'PAID',
        culqiPaymentId: paymentId,
        paymentProvider: 'CULQI',
      },
    });

    if (order.couponCode) {
      const coupon = await tx.coupon.findUnique({ where: { code: order.couponCode } });
      if (!coupon || !coupon.isActive || (coupon.maxUses !== null && coupon.currentUses >= coupon.maxUses)) {
        throw new Error('El cupón ya no está disponible.');
      }
      await tx.coupon.update({
        where: { id: coupon.id },
        data: { currentUses: { increment: 1 } },
      });
    }

    await tx.orderTracking.create({
      data: { orderId, status: 'PAID', description: 'Pago confirmado por Culqi' },
    });

    await tx.stockReservation.deleteMany({
      where: {
        branchId: order.branchId,
        variantId: { in: order.orderItems.map(item => item.variantId!).filter(Boolean) },
        OR: [{ userId: order.userId }, { userId: null }],
      },
    });
  });
}

export async function createCulqiChargeForCheckout(data: CheckoutData, tokenId: string) {
  const session = await auth();
  if (!session?.user?.id || !session.user.email) {
    return { success: false, message: 'Debes iniciar sesión para comprar.' };
  }
  if (!tokenId || !tokenId.startsWith('tkn_')) {
    return { success: false, message: 'Token de pago inválido.' };
  }

  let orderId: string | null = null;
  try {
    const calculated = await calculateCanonicalCheckout(data);
    if (data.idempotencyKey) {
      const previousOrder = await prisma.order.findFirst({ where: { idempotencyKey: data.idempotencyKey, businessId: calculated.business.id, userId: session.user.id, source: 'ONLINE' } });
      if (previousOrder) {
        if (previousOrder.isPaid && previousOrder.culqiPaymentId) return { success: true, orderId: previousOrder.id, paymentId: previousOrder.culqiPaymentId };
        if (previousOrder.paymentStatus === 'PROCESSING') return { success: false, message: 'Este pedido ya está siendo procesado.' };
        if (previousOrder.paymentStatus === 'FAILED' || previousOrder.status === 'CANCELLED') return { success: false, message: 'Esta operación ya falló. Genera una nueva solicitud de pago.' };
      }
    }
    const reservation = await reserveCartItems(data.items);
    if (!reservation.success || !reservation.branchId) {
      return { success: false, message: reservation.message ?? 'Stock insuficiente.' };
    }

    const customer = await prisma.user.findUnique({ where: { id: session.user.id }, select: { customerId: true } });
    const order = await prisma.order.create({
      data: {
        userId: session.user.id,
        customerId: customer?.customerId ?? null,
        businessId: calculated.business.id,
        branchId: reservation.branchId,
        source: 'ONLINE',
        totalAmount: calculated.total,
        totalItems: calculated.canonicalItems.reduce((sum, item) => sum + item.quantity, 0),
        status: 'PENDING',
        paymentStatus: 'PROCESSING',
        idempotencyKey: data.idempotencyKey || null,
        clientName: data.contactName,
        clientPhone: data.contactPhone,
        deliveryMethod: data.deliveryMethod,
        shippingAddress: data.shippingAddress || '',
        shippingCost: calculated.shippingCost,
        notes: data.notes || '',
        couponCode: calculated.couponCode,
        orderItems: {
          create: calculated.canonicalItems.map(item => ({
            variantId: item.variantId,
            productName: item.productName,
            variantName: item.variantName,
            quantity: item.quantity,
            price: item.price,
          })),
        },
        trackingEvents: { create: { status: 'PENDING', description: 'Pedido recibido, esperando pago' } },
      },
    });
    orderId = order.id;

    const charge = await createCulqiCharge({
      tokenId,
      amount: Math.round(calculated.total * 100),
      email: session.user.email,
      description: `Pedido online ${order.id.slice(0, 8).toUpperCase()}`,
      orderId: order.id,
    });

    await finalizePaidOrder(order.id, charge.id!);
    return { success: true, orderId: order.id, paymentId: charge.id, requestId: calculated.contractContext.requestId, contractVersion: calculated.contractContext.contractVersion };
  } catch (error) {
    if (orderId) {
      await prisma.order.update({
        where: { id: orderId },
        data: { status: 'CANCELLED', paymentStatus: 'FAILED', paymentError: error instanceof Error ? error.message : 'Pago rechazado', cancelReason: error instanceof Error ? error.message : 'Pago rechazado' },
      }).catch(() => undefined);
    }
    await releaseUserReservations().catch(() => undefined);
    return { success: false, message: error instanceof Error ? error.message : 'No se pudo procesar el pago.' };
  }
}

export { finalizePaidOrder };
