'use server';

import prisma from '@/lib/prisma';
import { auth } from '@/auth';
import { getEcommerceContextFromCookie } from '@/lib/ecommerce-context';
import { canAccessEcommerceAdmin } from '@/lib/permissions';
import { ReturnRequestStatus, ReturnRequestType } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const requestSchema = z.object({
  orderId: z.string().uuid(),
  type: z.enum(['RETURN', 'EXCHANGE']),
  reason: z.string().trim().min(5).max(500),
  notes: z.string().trim().max(1000).optional(),
  items: z.array(z.object({ orderItemId: z.string().uuid(), quantity: z.number().int().min(1) })).min(1),
});

function serializeRequest(request: any) {
  return {
    ...request,
    refundAmount: request.refundAmount === null ? null : Number(request.refundAmount),
    items: request.items?.map((item: any) => ({
      ...item,
      price: Number(item.price),
    })),
  };
}

export async function createReturnRequest(input: unknown) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, message: 'Debes iniciar sesión.' };

  const parsed = requestSchema.safeParse(input);
  if (!parsed.success) return { success: false, message: 'Datos de devolución inválidos.' };

  const { business } = await getEcommerceContextFromCookie();
  const order = await prisma.order.findFirst({
    where: {
      id: parsed.data.orderId,
      userId: session.user.id,
      businessId: business.id,
      isPaid: true,
      status: { in: ['DELIVERED', 'READY_FOR_PICKUP'] },
    },
    include: { orderItems: true },
  });
  if (!order) return { success: false, message: 'El pedido no está habilitado para devolución.' };

  const existing = await prisma.returnRequest.findMany({
    where: { orderId: order.id, status: { in: ['PENDING', 'APPROVED', 'COMPLETED'] } },
    include: { items: true },
  });

  const requestedByItem = new Map<string, number>();
  for (const item of parsed.data.items) requestedByItem.set(item.orderItemId, item.quantity);
  for (const orderItem of order.orderItems) {
    const requested = requestedByItem.get(orderItem.id) ?? 0;
    const alreadyRequested = existing.flatMap(request => request.items)
      .filter(item => item.variantId === orderItem.variantId && item.productName === orderItem.productName)
      .reduce((sum, item) => sum + item.quantity, 0);
    if (requested + alreadyRequested > orderItem.quantity) {
      return { success: false, message: `La cantidad solicitada excede la del producto ${orderItem.productName}.` };
    }
  }

  const created = await prisma.returnRequest.create({
    data: {
      businessId: business.id,
      orderId: order.id,
      userId: session.user.id,
      type: parsed.data.type as ReturnRequestType,
      reason: parsed.data.reason,
      notes: parsed.data.notes || null,
      items: {
        create: parsed.data.items.map(item => {
          const orderItem = order.orderItems.find(candidate => candidate.id === item.orderItemId)!;
          return {
            variantId: orderItem.variantId,
            productName: orderItem.productName,
            variantName: orderItem.variantName,
            quantity: item.quantity,
            price: orderItem.price,
          };
        }),
      },
    },
    include: { items: true, order: { select: { id: true, receiptNumber: true } } },
  });

  const operators = await prisma.user.findMany({
    where: { businessId: business.id, isActive: true, role: { in: ['OWNER', 'MANAGER', 'ADMIN', 'SUPER_ADMIN'] } },
    select: { id: true },
  });
  if (operators.length) {
    await prisma.notification.createMany({
      data: operators.map(operator => ({
        userId: operator.id,
        businessId: business.id,
        type: 'ALERT' as const,
        title: 'Nueva solicitud de cambio/devolución',
        message: `Pedido ${order.receiptNumber || order.id.slice(0, 8).toUpperCase()} requiere revisión.`,
      })),
    });
  }

  revalidatePath(`/orders/${order.id}`);
  revalidatePath('/profile/orders');
  return { success: true, request: serializeRequest(created) };
}

export async function getUserReturnRequests(orderId?: string) {
  const session = await auth();
  if (!session?.user?.id) return [];
  const { business } = await getEcommerceContextFromCookie();
  const requests = await prisma.returnRequest.findMany({
    where: { userId: session.user.id, businessId: business.id, ...(orderId ? { orderId } : {}) },
    include: { items: true, order: { select: { id: true, receiptNumber: true } } },
    orderBy: { createdAt: 'desc' },
  });
  return requests.map(serializeRequest);
}

export async function getReturnRequestsAdmin(status?: ReturnRequestStatus) {
  const session = await auth();
  if (!session?.user || !canAccessEcommerceAdmin(session.user)) return { success: false, data: [] };
  const { business } = await getEcommerceContextFromCookie();
  const requests = await prisma.returnRequest.findMany({
    where: { businessId: business.id, ...(status ? { status } : {}) },
    include: {
      items: true,
      order: { select: { id: true, receiptNumber: true, clientName: true, totalAmount: true, branchId: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
  return { success: true, data: requests.map(serializeRequest) };
}

export async function updateReturnRequest(input: {
  id: string;
  status: ReturnRequestStatus;
  notes?: string;
  refundAmount?: number;
  refundReference?: string;
}) {
  const session = await auth();
  if (!session?.user || !canAccessEcommerceAdmin(session.user)) return { success: false, message: 'No autorizado.' };
  const { business } = await getEcommerceContextFromCookie();
  const request = await prisma.returnRequest.findFirst({ where: { id: input.id, businessId: business.id } });
  if (!request) return { success: false, message: 'Solicitud no encontrada.' };
  if (request.status === 'COMPLETED' || request.status === 'REJECTED') {
    return { success: false, message: 'La solicitud ya está cerrada.' };
  }
  if (input.status === 'COMPLETED') {
    return { success: false, message: 'Usa el procesamiento de devolución para completar la solicitud.' };
  }

  const updated = await prisma.returnRequest.update({
    where: { id: request.id },
    data: {
      status: input.status,
      notes: input.notes ?? request.notes,
      refundAmount: input.refundAmount ?? request.refundAmount,
      refundReference: input.refundReference ?? request.refundReference,
      processedAt: input.status === 'REJECTED' ? new Date() : null,
    },
    include: { items: true },
  });
  revalidatePath('/admin/returns');
  revalidatePath(`/orders/${request.orderId}`);
  return { success: true, request: serializeRequest(updated) };
}

export async function processReturnRequest(input: { id: string; refundAmount?: number }) {
  const session = await auth();
  if (!session?.user || !canAccessEcommerceAdmin(session.user)) return { success: false, message: 'No autorizado.' };
  const { business } = await getEcommerceContextFromCookie();
  const request = await prisma.returnRequest.findFirst({
    where: { id: input.id, businessId: business.id, status: 'APPROVED' },
    include: { items: true, order: { select: { id: true, branchId: true, culqiPaymentId: true, totalAmount: true } } },
  });
  if (!request) return { success: false, message: 'La solicitud debe estar aprobada antes de procesarse.' };
  if (!request.order.branchId) return { success: false, message: 'El pedido no tiene sucursal asignada.' };

  const itemAmount = request.items.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);
  const refundAmount = Math.round((input.refundAmount ?? itemAmount) * 100) / 100;
  if (refundAmount < 0 || refundAmount > itemAmount) {
    return { success: false, message: 'El monto de reembolso no es válido.' };
  }

  let refundReference: string | null = null;
  if (request.type === 'RETURN' && refundAmount > 0) {
    if (!request.order.culqiPaymentId) return { success: false, message: 'El pedido no tiene un pago Culqi reembolsable.' };
    const secretKey = process.env.CULQI_SECRET_KEY;
    if (!secretKey) return { success: false, message: 'CULQI_SECRET_KEY aún no está configurada.' };
    const response = await fetch('https://api.culqi.com/v2/refunds', {
      method: 'POST',
      headers: { Authorization: `Bearer ${secretKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: Math.round(refundAmount * 100), charge_id: request.order.culqiPaymentId, reason: 'solicitud_comprador' }),
      cache: 'no-store',
    });
    const payload = await response.json().catch(() => ({})) as { id?: string; status?: string; user_message?: string; merchant_message?: string };
    if (!response.ok || !payload.id) return { success: false, message: payload.user_message || payload.merchant_message || 'Culqi no pudo crear el reembolso.' };
    refundReference = payload.id;
  }

  await prisma.$transaction(async tx => {
    for (const item of request.items) {
      if (!item.variantId) continue;
      const existingStock = await tx.stock.findUnique({ where: { branchId_variantId: { branchId: request.order.branchId!, variantId: item.variantId } } });
      const previousStock = existingStock?.quantity ?? 0;
      const currentStock = previousStock + item.quantity;
      await tx.stock.upsert({
        where: { branchId_variantId: { branchId: request.order.branchId!, variantId: item.variantId } },
        create: { branchId: request.order.branchId!, variantId: item.variantId, quantity: item.quantity },
        update: { quantity: { increment: item.quantity } },
      });
      await tx.stockMovement.create({
        data: { variantId: item.variantId, branchId: request.order.branchId, type: 'RETURN_ECOMMERCE', quantity: item.quantity, previousStock, currentStock, reason: `Devolución ecommerce ${request.id.slice(0, 8).toUpperCase()}` },
      });
    }
    await tx.returnRequest.update({ where: { id: request.id }, data: { status: 'COMPLETED', refundAmount, refundReference, processedAt: new Date() } });
  });

  revalidatePath('/admin/returns');
  revalidatePath(`/orders/${request.order.id}`);
  return { success: true, refundReference };
}
