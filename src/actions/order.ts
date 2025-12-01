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

    // 🛡️ VALIDACIÓN DE SEGURIDAD E INTEGRIDAD 🛡️
    const productIds = data.items.map((item) => item.productId);

    // Buscamos productos ACTIVOS en la BD
    const dbProducts = await prisma.product.findMany({
      where: {
        id: { in: productIds },
        isAvailable: true, // Importante para Soft Delete
      },
    });

    // Verificamos si encontramos todos los productos
    if (dbProducts.length !== productIds.length) {
      return { 
        success: false, 
        message: 'Uno o más productos de tu carrito ya no están disponibles. Por favor actualiza la página.' 
      };
    }

    // Transacción de creación
    const order = await prisma.$transaction(async (tx) => {
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
      return newOrder;
    });

    return { success: true, orderId: order.id };
    
  } catch (error) {
    console.error('Error al crear la orden:', error);
    return { success: false, message: 'Error interno del servidor' };
  }
}

// Obtener todas las órdenes (Para el Admin)
export async function getOrders() {
  try {
    const orders = await prisma.order.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        orderItems: {
          include: {
            product: true, 
          }
        }
      }
    });

    // TRANSFORMACIÓN DE DATOS (SERIALIZACIÓN)
    // Convertimos los Decimal de Prisma a Number de JS para que el frontend no explote
    const safeOrders = orders.map((order) => ({
      ...order,
      totalAmount: Number(order.totalAmount), // 👈 Vital
      orderItems: order.orderItems.map((item) => ({
        ...item,
        price: Number(item.price), // 👈 Vital
        product: {
          ...item.product,
          price: Number(item.product.price), // 👈 Vital
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