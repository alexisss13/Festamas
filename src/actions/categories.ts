'use server';

import { z } from 'zod';
import prisma from '@/lib/prisma';
import { categorySchema } from '@/lib/zod';
import { revalidatePath } from 'next/cache';

// --- LEER ---
export async function getCategories() {
  try {
    // Traemos también el conteo de productos para mostrarlo en la tabla
    const categories = await prisma.category.findMany({
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

    const { name, slug } = valid.data;

    // Verificar slug único (excepto si es el mismo ID que editamos)
    const existing = await prisma.category.findUnique({ where: { slug } });
    if (existing && existing.id !== id) {
      return { success: false, message: 'El slug ya existe.' };
    }

    if (id) {
      await prisma.category.update({
        where: { id },
        data: { name, slug },
      });
    } else {
      await prisma.category.create({
        data: { name, slug },
      });
    }

    revalidatePath('/admin/categories');
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, message: 'Error de servidor' };
  }
}

// --- ELIMINAR (Con Seguridad) ---
export async function deleteCategory(id: string) {
  try {
    // 1. Verificar si tiene productos
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

    // 2. Si está vacía, borrar
    await prisma.category.delete({ where: { id } });
    
    revalidatePath('/admin/categories');
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, message: 'Error al eliminar' };
  }
}