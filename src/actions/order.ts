'use server';

import prisma from '@/lib/prisma';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { OrderStatus } from '@prisma/client';

// 1. Esquema de Validación (Reglas estrictas)
const orderSchema = z.object({
  name: z.string()
    .min(3, "El nombre debe tener al menos 3 letras.")
    .regex(/^[a-zA-Z\s\u00C0-\u00FF]+$/, "El nombre solo puede contener letras."), 
  phone: z.string()
    .min(9, "El celular debe tener 9 dígitos.")
    .max(9, "El celular debe tener 9 dígitos.")
    .regex(/^\d+$/, "El celular solo debe contener números."),
  total: z.number().min(0),
  items: z.array(z.object({
    productId: z.string(),
    quantity: z.number().min(1),
    price: z.number(),
  })),
});

interface CreateOrderInput {
  name: string;
  phone: string;
  total: number;
  items: {
    productId: string;
    quantity: number;
    price: number;
  }[];
}

export async function createOrder(data: CreateOrderInput) {
  try {
    const validation = orderSchema.safeParse(data);
    if (!validation.success) {
      return { success: false, message: 'Datos inválidos', errors: validation.error.flatten().fieldErrors };
    }

    const productIds = data.items.map((item) => item.productId);

    // 1. Validar existencia y STOCK disponible
    const dbProducts = await prisma.product.findMany({
      where: { id: { in: productIds }, isAvailable: true },
    });

    if (dbProducts.length !== productIds.length) {
      return { success: false, message: 'Algunos productos ya no están disponibles' };
    }

    // Verificar que haya suficiente stock para cada item
    for (const item of data.items) {
      const product = dbProducts.find((p) => p.id === item.productId);
      if (!product || product.stock < item.quantity) {
        return { 
          success: false, 
          message: `Stock insuficiente para ${product?.title}. Solo quedan ${product?.stock}.` 
        };
      }
    }

    // 2. TRANSACCIÓN ATÓMICA (Crear Orden + Restar Stock)
    const order = await prisma.$transaction(async (tx) => {
      // A. Crear la orden
      const newOrder = await tx.order.create({
        data: {
          clientName: data.name,
          clientPhone: data.phone,
          totalAmount: data.total,
          totalItems: data.items.reduce((acc, item) => acc + item.quantity, 0),
          status: 'PENDING',
          isPaid: false,
          orderItems: {
            create: data.items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
            })),
          },
        },
      });

      // B. Restar Stock de cada producto
      for (const item of data.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity, // 👈 La magia de Prisma: resta automático
            },
          },
        });
      }

      return newOrder;
    });

    return { success: true, orderId: order.id };
    
  } catch (error) {
    console.error('Error al crear la orden:', error);
    return { success: false, message: 'Error interno del servidor' };
  }
}

// OBTENER ÓRDENES (SERIALIZADO)
export async function getOrders() {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        orderItems: { include: { product: true } }
      }
    });

    const safeOrders = orders.map((order) => ({
      ...order,
      totalAmount: Number(order.totalAmount),
      orderItems: order.orderItems.map((item) => ({
        ...item,
        price: Number(item.price),
        product: {
          ...item.product,
          price: Number(item.product.price),
        }
      }))
    }));

    return { success: true, data: safeOrders };
  } catch (error) {
    console.error(error);
    return { success: false, message: 'Error al obtener ordenes' };
  }
}


// Obtener un pedido por ID (Detalle Admin)
export async function getOrderById(id: string) {
  try {
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) return null;

    return { success: true, order };
  } catch (error) {
    console.error(error);
    return null;
  }
}

// Actualizar Estado y Pago (Admin)
export async function updateOrderStatus(id: string, status: OrderStatus, isPaid: boolean) {
  try {
    await prisma.order.update({
      where: { id },
      data: {
        status,
        isPaid,
      },
    });

    revalidatePath(`/admin/orders/${id}`);
    revalidatePath('/admin/orders');
    revalidatePath('/admin/dashboard');

    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, message: 'Error al actualizar la orden' };
  }
}