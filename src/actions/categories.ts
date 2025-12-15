'use server';

import { z } from 'zod';
import prisma from '@/lib/prisma';
import { categorySchema } from '@/lib/zod';
import { revalidatePath } from 'next/cache';
import { Division } from '@prisma/client';

// --- LEER ---
// Aceptamos un parámetro opcional 'division'. Si no viene, devuelve todas (útil para admin).
export async function getCategories(division?: Division) {
  try {
    const whereClause = division ? { division } : {};

    const categories = await prisma.category.findMany({
      where: whereClause,
      include: {
        _count: {
          select: { products: true }
        }
      },
      orderBy: { name: 'asc' }
    });
    return { success: true, data: categories };
  } catch (error) {
    console.error(error);
    return { success: false, data: [] };
  }
}

// --- CREAR / EDITAR ---
export async function createOrUpdateCategory(data: z.infer<typeof categorySchema>, id: string | null) {
  try {
    const valid = categorySchema.safeParse(data);
    if (!valid.success) return { success: false, message: 'Datos inválidos' };

    const { name, slug, division } = valid.data; // 👈 Ahora extraemos division

    // Verificar slug único
    const existing = await prisma.category.findUnique({ where: { slug } });
    if (existing && existing.id !== id) {
      return { success: false, message: 'El slug ya existe.' };
    }

    if (id) {
      await prisma.category.update({
        where: { id },
        data: { name, slug, division },
      });
    } else {
      await prisma.category.create({
        data: { name, slug, division },
      });
    }

    revalidatePath('/admin/categories');
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, message: 'Error de servidor' };
  }
}

// --- ELIMINAR ---
export async function deleteCategory(id: string) {
  try {
    const category = await prisma.category.findUnique({
      where: { id },
      include: { _count: { select: { products: true } } }
    });

    if (category && category._count.products > 0) {
      return { 
        success: false, 
        message: `No se puede eliminar: Esta categoría tiene ${category._count.products} productos asociados.` 
      };
    }

    await prisma.category.delete({ where: { id } });
    
    revalidatePath('/admin/categories');
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, message: 'Error al eliminar' };
  }
}