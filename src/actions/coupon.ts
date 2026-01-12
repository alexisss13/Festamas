'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { Division } from '@prisma/client';

// Schema Backend (Aquí si validamos tipos estrictos para la BD)
const createCouponSchema = z.object({
  code: z.string().min(3, "Mínimo 3 caracteres").toUpperCase().trim(),
  discount: z.coerce.number().min(0.01, "Debe ser mayor a 0"),
  type: z.enum(["FIXED", "PERCENTAGE"]),
  division: z.nativeEnum(Division),
  expirationDate: z.coerce.date().optional().nullable(),
  // Aquí maxUses ya llega como número o undefined desde el frontend
  maxUses: z.number().int().min(1).optional().nullable(),
});

// --- VALIDAR (Usado en Cart y POS) ---
export async function validateCoupon(code: string, currentDivision: Division) {
  try {
    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() }
    });

    if (!coupon) return { success: false, message: 'Cupón no encontrado' };
    
    if (!coupon.isActive) return { success: false, message: 'Este cupón está desactivado' };

    if (coupon.division !== currentDivision) {
      return { success: false, message: `Este cupón no es válido para ${currentDivision === 'JUGUETERIA' ? 'Festamas' : 'FiestasYa'}` };
    }

    if (coupon.expirationDate) {
      const now = new Date();
      if (now.getTime() > coupon.expirationDate.getTime()) {
        return { success: false, message: 'El cupón ha expirado' };
      }
    }

    if (coupon.maxUses !== null && coupon.currentUses >= coupon.maxUses) {
      return { success: false, message: 'El cupón ha alcanzado su límite de usos' };
    }

    return { 
      success: true, 
      coupon: {
        id: coupon.id,
        code: coupon.code,
        discount: Number(coupon.discount),
        type: coupon.type,
        division: coupon.division
      } 
    };
  } catch (error) {
    console.error(error);
    return { success: false, message: 'Error al validar cupón' };
  }
}

// --- LISTAR (Para Admin) ---
export async function getCoupons() {
  try {
    const coupons = await prisma.coupon.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return coupons.map(c => ({ ...c, discount: Number(c.discount) }));
  } catch (error) {
    return [];
  }
}

// --- CREAR ---
export async function createCoupon(data: unknown) { // Recibimos unknown para validar con Zod nosotros mismos
  try {
    const valid = createCouponSchema.safeParse(data);
    
    if (!valid.success) {
      console.error("Error de validación:", valid.error);
      return { success: false, message: 'Datos inválidos. Revisa el formulario.' };
    }

    const { code, discount, type, division, expirationDate, maxUses } = valid.data;

    // Verificar duplicados
    const existing = await prisma.coupon.findUnique({ where: { code } });
    if (existing) return { success: false, message: 'El código de cupón ya existe.' };

    // Ajuste de Hora: Si hay fecha, forzar final del día (23:59:59)
    let finalExpiration = expirationDate;
    if (finalExpiration) {
      finalExpiration = new Date(finalExpiration);
      finalExpiration.setHours(23, 59, 59, 999);
    }

    await prisma.coupon.create({
      data: {
        code,
        discount,
        type,
        division,
        maxUses: maxUses ?? null, // Convertimos undefined a null para Prisma
        expirationDate: finalExpiration ?? null,
        isActive: true
      }
    });

    revalidatePath('/admin/coupons');
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, message: 'Error de servidor al crear el cupón.' };
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

// --- INCREMENTAR USO (Llamar al completar orden) ---
export async function incrementCouponUsage(code: string) {
  try {
    await prisma.coupon.update({
      where: { code },
      data: { currentUses: { increment: 1 } }
    });
  } catch (error) {
    console.error("Error incrementando uso de cupón:", error);
  }
}