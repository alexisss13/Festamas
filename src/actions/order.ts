'use server';

import prisma from '@/lib/prisma';
import { z } from 'zod';

// 1. Esquema de Validación (Reglas estrictas)
const orderSchema = z.object({
  name: z.string()
    .min(3, "El nombre debe tener al menos 3 letras.")
    .regex(/^[a-zA-Z\s\u00C0-\u00FF]+$/, "El nombre solo puede contener letras."), // Acepta tildes y ñ
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

    // 🛡️ NUEVA VALIDACIÓN DE SEGURIDAD 🛡️
    // 1. Obtenemos los IDs de los productos que el cliente quiere comprar
    const productIds = data.items.map((item) => item.productId);

    // 2. Buscamos esos productos en la Base de Datos
    const dbProducts = await prisma.product.findMany({
      where: {
        id: { in: productIds },
        isAvailable: true,
      },
    });

    // 3. Verificamos: ¿Encontramos la misma cantidad de productos que los solicitados?
    // Si el cliente pide 3 productos, y en la BD solo encuentro 2, significa que uno fue borrado.
    if (dbProducts.length !== productIds.length) {
      return { 
        success: false, 
        message: 'Uno o más productos de tu carrito ya no están disponibles. Por favor actualiza la página.' 
      };
    }

    // 3. Si todo está bien, procedemos a guardar
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
export async function getOrders() {
  try {
    const orders = await prisma.order.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        orderItems: {
          include: {
            product: true, // Traemos info del producto para mostrar nombres si queremos
          }
        }
      }
    });

    return { success: true, data: orders };
  } catch (error) {
    console.error(error);
    return { success: false, message: 'Error al obtener ordenes' };
  }
}