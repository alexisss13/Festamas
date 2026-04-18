'use server';

import prisma from '@/lib/prisma';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { OrderStatus } from '@prisma/client';
import { auth } from '@/auth';

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

  // Obtener el usuario actual si está logueado
  const session = await auth();
  const userId = session?.user?.id;

  const order = await prisma.order.create({
    data: {
      userId: userId || null, // Vincular al usuario si está logueado
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
    },
  });

  revalidatePath('/profile/orders');
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
    include: { orderItems: true },
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

export async function updateOrderStatus(id: string, newStatus: OrderStatus, isPaid: boolean) {
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
    data: { status: newStatus, isPaid },
  });

  // Si el pedido se marca como pagado y tiene usuario con Customer vinculado
  if (isPaid && !order.isPaid && order.user?.customerId) {
    const totalAmount = Number(order.totalAmount);
    
    // Calcular puntos ganados (ejemplo: 1 punto por cada 10 soles)
    const pointsEarned = Math.floor(totalAmount / 10);

    // Actualizar el Customer
    await prisma.customer.update({
      where: { id: order.user.customerId },
      data: {
        pointsBalance: { increment: pointsEarned },
        totalSpent: { increment: totalAmount },
        visits: { increment: 1 },
        lastPurchase: new Date(),
      }
    });

    // Registrar la transacción de puntos
    if (pointsEarned > 0 && order.user.businessId) {
      await prisma.pointTransaction.create({
        data: {
          businessId: order.user.businessId,
          customerId: order.user.customerId,
          orderId: order.id,
          points: pointsEarned,
          type: 'EARN',
          description: `Puntos ganados por compra #${order.id.split('-')[0].toUpperCase()}`
        }
      });
    }

    // Actualizar el pedido con los puntos ganados
    await prisma.order.update({
      where: { id },
      data: { pointsEarned }
    });
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
