'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

// Esquema de validación para los datos que vienen del POS
const posOrderSchema = z.object({
  items: z.array(z.object({
    productId: z.string(),
    quantity: z.number().min(1),
    price: z.number().min(0), // Precio final (unitario) calculado por el POS
  })),
  total: z.number().min(0),
  paymentMethod: z.enum(['YAPE', 'PLIN', 'EFECTIVO', 'TARJETA']),
  customer: z.object({
    name: z.string().optional(),
    dni: z.string().optional(),
    address: z.string().optional(),
  }),
});

export async function processPOSSale(data: z.infer<typeof posOrderSchema>) {
  try {
    const validation = posOrderSchema.safeParse(data);
    if (!validation.success) {
      return { success: false, message: 'Datos de venta inválidos' };
    }

    const { items, total, paymentMethod, customer } = data;

    // 1. Validar Stock (Backend Authority)
    // No confiamos ciegamente en el frontend, verificamos la BD.
    const productIds = items.map(i => i.productId);
    const dbProducts = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    for (const item of items) {
      const dbProduct = dbProducts.find(p => p.id === item.productId);
      if (!dbProduct) {
        return { success: false, message: `Producto no encontrado: ID ${item.productId}` };
      }
      if (dbProduct.stock < item.quantity) {
        return { 
          success: false, 
          message: `Stock insuficiente para "${dbProduct.title}". Quedan: ${dbProduct.stock}` 
        };
      }
    }

    // 2. Transacción Atómica (Crear Orden + Restar Stock)
    const order = await prisma.$transaction(async (tx) => {
      // Calculamos el total de items
      const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);

      // Preparamos la nota con info del POS
      // "POS - [YAPE] - DNI: 12345678"
      const notes = `Venta POS - Pago: ${paymentMethod} | DNI: ${customer.dni || 'S/D'} | Dirección: ${customer.address || '-'}`;

      // Crear la orden
      const newOrder = await tx.order.create({
        data: {
          clientName: customer.name || 'Cliente Mostrador',
          clientPhone: '999999999', // Default para POS, ya que es presencial
          totalAmount: total,
          totalItems: totalItems,
          status: 'DELIVERED', // En POS la entrega es inmediata
          isPaid: true,        // En POS el pago es inmediato
          deliveryMethod: 'PICKUP',
          shippingAddress: customer.address || '',
          shippingCost: 0,
          notes: notes,
          orderItems: {
            create: items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
            })),
          },
        },
      });

      // Restar el stock
      for (const item of items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      return newOrder;
    });

    // 3. Revalidar rutas para actualizar inventario en otras ventanas
    revalidatePath('/admin/products');
    revalidatePath('/admin/dashboard');
    
    return { success: true, orderId: order.id, message: '¡Venta registrada con éxito!' };

  } catch (error) {
    console.error('Error procesando venta POS:', error);
    return { success: false, message: 'Error interno al procesar la venta.' };
  }
}