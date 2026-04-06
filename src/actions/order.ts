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

  const order = await prisma.order.create({
    data: {
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
  await prisma.order.update({
    where: { id },
    data: { status: newStatus, isPaid },
  });
  revalidatePath('/admin/orders');
  revalidatePath('/profile/orders');
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
