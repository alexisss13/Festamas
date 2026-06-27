'use server';

import prisma from '@/lib/prisma';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { OrderStatus } from '@prisma/client';
import { auth } from '@/auth';
import { getEcommerceContextFromCookie } from '@/lib/ecommerce-context';
import { sendNewOrderEmail, sendStatusEmail } from '@/lib/email';

const orderSchema = z.object({
  name: z.string().min(3),
  phone: z.string().min(9),
  total: z.number().min(0),
  items: z.array(z.object({
    productId: z.string(),
    quantity: z.number().min(1),
    price: z.number(),
    title: z.string().optional(),
    variantName: z.string().optional(),
  })),
  deliveryMethod: z.string().optional(),
  shippingAddress: z.string().optional(),
  shippingCost: z.number().optional(),
  notes: z.string().optional(),
});

interface CreateOrderInput {
  name: string;
  phone: string;
  total: number;
  items: { productId: string; quantity: number; price: number; title?: string; variantName?: string }[];
  deliveryMethod?: string;
  shippingAddress?: string;
  shippingCost?: number;
  notes?: string;
}

export async function createOrder(data: CreateOrderInput) {
  const validation = orderSchema.safeParse(data);
  if (!validation.success) {
    return { success: false, message: 'Datos inválidos', errors: validation.error.flatten().fieldErrors };
  }

  const session = await auth();
  const userId = session?.user?.id;

  const { business, activeBranch } = await getEcommerceContextFromCookie();

  const order = await prisma.order.create({
    data: {
      userId: userId || null,
      businessId: business.id,
      branchId: activeBranch.id,
      clientName: data.name,
      clientPhone: data.phone,
      totalAmount: data.total,
      totalItems: data.items.reduce((acc, item) => acc + item.quantity, 0),
      status: 'PENDING',
      isPaid: false,
      deliveryMethod: data.deliveryMethod || 'PICKUP',
      shippingAddress: data.shippingAddress || '',
      shippingCost: data.shippingCost || 0,
      notes: data.notes || '',
      orderItems: {
        create: data.items.map((item) => ({
          productName: item.title || 'Producto',
          variantName: item.variantName || null,
          quantity: item.quantity,
          price: item.price,
        })),
      },
      trackingEvents: {
        create: { status: 'PENDING', description: 'Pedido recibido y pendiente de pago' },
      },
    },
  });

  revalidatePath('/profile/orders');

  void sendNewOrderEmail({
    orderId: order.id,
    customerName: data.name,
    customerPhone: data.phone,
    totalAmount: data.total,
    items: data.items.map(i => ({ title: i.title ?? 'Producto', quantity: i.quantity })),
    deliveryMethod: data.deliveryMethod ?? 'PICKUP',
    shippingAddress: data.shippingAddress,
    shippingCost: data.shippingCost ?? 0,
    notes: data.notes,
  });

  return { success: true, orderId: order.id };
}

export async function getOrders() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
    include: { orderItems: true },
  });

  return {
    success: true,
    data: orders.map((order) => ({
      ...order,
      totalAmount: Number(order.totalAmount),
      shippingCost: Number(order.shippingCost),
      orderItems: order.orderItems.map((item) => ({ ...item, price: Number(item.price) })),
    })),
  };
}

export async function getOrderById(id: string) {
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      orderItems: true,
      trackingEvents: { orderBy: { createdAt: 'asc' } },
    },
  });
  if (!order) return null;
  return {
    success: true,
    order: {
      ...order,
      totalAmount: Number(order.totalAmount),
      shippingCost: Number(order.shippingCost),
      orderItems: order.orderItems.map((item) => ({ ...item, price: Number(item.price) })),
    },
  };
}

const STATUS_TRACKING_DESC: Record<string, string> = {
  PENDING:          'Pedido recibido y pendiente de pago',
  PAID:             'Pago confirmado',
  PROCESSING:       'Pedido en preparación',
  SHIPPED:          'Pedido enviado al transportista',
  READY_FOR_PICKUP: 'Listo para recoger en tienda',
  DELIVERED:        'Pedido entregado al cliente',
  CANCELLED:        'Pedido cancelado',
};

export async function updateOrderStatus(
  id: string,
  newStatus: OrderStatus,
  isPaid: boolean,
  extra?: { trackingNumber?: string | null; carrier?: string | null; cancelReason?: string | null }
) {
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          customerId: true,
          email: true,
          businessId: true
        }
      }
    }
  });

  if (!order) {
    return { success: false, message: 'Pedido no encontrado' };
  }

  // Actualizar el pedido
  await prisma.order.update({
    where: { id },
    data: {
      status: newStatus,
      isPaid,
      ...(extra?.trackingNumber !== undefined && { trackingNumber: extra.trackingNumber }),
      ...(extra?.carrier !== undefined && { carrier: extra.carrier }),
      ...(extra?.cancelReason !== undefined && { cancelReason: extra.cancelReason }),
      ...(newStatus === 'SHIPPED' && !order.shippedAt && { shippedAt: new Date() }),
      ...(newStatus === 'DELIVERED' && !order.deliveredAt && { deliveredAt: new Date() }),
      ...(newStatus === 'CANCELLED' && !order.cancelledAt && { cancelledAt: new Date() }),
    },
  });

  // Registrar evento en el historial si el estado cambió
  if (newStatus !== order.status) {
    const desc = newStatus === 'SHIPPED' && extra?.carrier
      ? `Enviado con ${extra.carrier}${extra.trackingNumber ? ` · Tracking: ${extra.trackingNumber}` : ''}`
      : newStatus === 'CANCELLED' && extra?.cancelReason
        ? `Cancelado: ${extra.cancelReason}`
        : STATUS_TRACKING_DESC[newStatus] ?? newStatus;

    await prisma.orderTracking.create({
      data: { orderId: id, status: newStatus, description: desc },
    });
  }

  // Enviar email al cliente en cambios de estado clave
  const EMAIL_STATUSES = ['PAID', 'SHIPPED', 'READY_FOR_PICKUP', 'DELIVERED', 'CANCELLED'];
  if (newStatus !== order.status && EMAIL_STATUSES.includes(newStatus) && order.user?.email) {
    void sendStatusEmail({
      orderId: id,
      customerName: order.clientName,
      customerEmail: order.user.email,
      status: newStatus,
      trackingNumber: extra?.trackingNumber,
      carrier: extra?.carrier,
      cancelReason: extra?.cancelReason,
    });
  }

  // Si el pedido se marca como pagado y tiene usuario con Customer vinculado
  if (isPaid && !order.isPaid && order.user?.customerId) {
    const totalAmount = Number(order.totalAmount);
    const businessId = order.user?.businessId || order.businessId;

    let loyaltyEnabled = false;
    let rate = 10;

    if (businessId) {
      const business = await prisma.business.findUnique({
        where: { id: businessId },
        select: {
          loyaltyEnabled: true,
          loyaltyEarnRate: true,
        }
      });
      loyaltyEnabled = business?.loyaltyEnabled ?? false;
      rate = Number(business?.loyaltyEarnRate) || 10;
    }
    
    // Calcular puntos ganados
    const pointsEarned = loyaltyEnabled && rate > 0 ? Math.floor(totalAmount / rate) : 0;

    // Actualizar el Customer
    await prisma.customer.update({
      where: { id: order.user.customerId },
      data: {
        ...(pointsEarned > 0 ? { pointsBalance: { increment: pointsEarned } } : {}),
        totalSpent: { increment: totalAmount },
        visits: { increment: 1 },
        lastPurchase: new Date(),
      }
    });

    // Registrar la transacción de puntos
    if (pointsEarned > 0 && businessId) {
      await prisma.pointTransaction.create({
        data: {
          businessId,
          customerId: order.user.customerId,
          orderId: order.id,
          points: pointsEarned,
          type: 'EARN',
          description: `Puntos ganados por compra #${order.id.split('-')[0].toUpperCase()}`
        }
      });
    }

    // Actualizar el pedido con los puntos ganados
    if (pointsEarned > 0) {
      await prisma.order.update({
        where: { id },
        data: { pointsEarned }
      });
    }
  }

  revalidatePath('/admin/orders');
  revalidatePath('/profile/orders');
  revalidatePath('/profile');
  return { success: true };
}

export const getUserOrders = async () => {
  const session = await auth();
  if (!session?.user?.id) return [];

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    include: { orderItems: true },
    orderBy: { createdAt: 'desc' },
  });

  return orders.map((order) => ({
    ...order,
    totalAmount: Number(order.totalAmount),
    shippingCost: Number(order.shippingCost),
    orderItems: order.orderItems.map((item) => ({ ...item, price: Number(item.price) })),
  }));
};
