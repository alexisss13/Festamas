'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

// Schema de validación
const createCouponSchema = z.object({
  code: z.string().min(3, "El código debe tener al menos 3 letras").toUpperCase(),
  discount: z.coerce.number().min(1, "El descuento debe ser mayor a 0"),
  type: z.enum(["FIXED", "PERCENTAGE"]),
});

// --- VALIDAR (Para el carrito) ---
export async function validateCoupon(code: string) {
  try {
    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase(), isActive: true }
    });

    if (!coupon) return { success: false, message: 'Cupón inválido o expirado' };

    return { 
      success: true, 
      coupon: {
        code: coupon.code,
        discount: Number(coupon.discount),
        type: coupon.type
      } 
    };
  } catch (error) {
    console.error(error);
    return { success: false, message: 'Error al validar' };
  }
}

// --- LISTAR (Para el admin) ---
export async function getCoupons() {
  try {
    const coupons = await prisma.coupon.findMany({
      orderBy: { createdAt: 'desc' }
    });
    
    // Serializamos Decimal -> Number
    return coupons.map(c => ({
      ...c,
      discount: Number(c.discount)
    }));
  } catch (error) {
    console.error(error);
    return [];
  }
}

// --- CREAR ---
export async function createCoupon(data: z.infer<typeof createCouponSchema>) {
  try {
    const valid = createCouponSchema.safeParse(data);
    if (!valid.success) return { success: false, message: 'Datos inválidos' };

    const { code, discount, type } = valid.data;

    // Verificar duplicados
    const existing = await prisma.coupon.findUnique({ where: { code } });
    if (existing) return { success: false, message: 'Este código ya existe' };

    await prisma.coupon.create({
      data: {
        code,
        discount,
        type,
        isActive: true
      }
    });

    revalidatePath('/admin/coupons');
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, message: 'Error al crear cupón' };
  }
}

// --- ELIMINAR ---
export async function deleteCoupon(id: string) {
  try {
    await prisma.coupon.delete({ where: { id } });
    revalidatePath('/admin/coupons');
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, message: 'Error al eliminar' };
  }
}