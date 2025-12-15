'use server';

import prisma from '@/lib/prisma';
import { categorySchema } from '@/lib/zod';
import { revalidatePath } from 'next/cache';
import { Division } from '@prisma/client';

// --- LEER ---
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
    return { success: false, error: 'Error al cargar categorías' };
  }
}

export async function getCategoryById(id: string) {
    try {
        const category = await prisma.category.findUnique({ where: { id } });
        return { success: true, data: category };
    } catch (error) {
        return { success: false, error: 'Error al cargar categoría' };
    }
}

// --- CREAR ---
export async function createCategory(formData: FormData) {
  const data = {
    name: formData.get('name'),
    slug: formData.get('slug'),
    division: formData.get('division'),
    image: formData.get('image'), // Recibimos imagen
  };

  const parsed = categorySchema.safeParse(data);

  if (!parsed.success) {
    // 🛡️ FIX: Usamos .issues en lugar de .errors para evitar el error de TS
    return { success: false, error: parsed.error.issues[0].message };
  }

  try {
    await prisma.category.create({
      data: {
        name: parsed.data.name,
        slug: parsed.data.slug,
        division: parsed.data.division,
        image: parsed.data.image || null,
      },
    });

    revalidatePath('/admin/categories');
    revalidatePath('/'); // Actualizar Home
    return { success: true };
  } catch (error) {
    console.log(error);
    return { success: false, error: 'Error al crear la categoría' };
  }
}

// --- EDITAR ---
export async function updateCategory(id: string, formData: FormData) {
  const data = {
    name: formData.get('name'),
    slug: formData.get('slug'),
    division: formData.get('division'),
    image: formData.get('image'),
  };

  const parsed = categorySchema.safeParse(data);

  if (!parsed.success) {
    // 🛡️ FIX: Usamos .issues
    return { success: false, error: parsed.error.issues[0].message };
  }

  try {
    await prisma.category.update({
      where: { id },
      data: {
        name: parsed.data.name,
        slug: parsed.data.slug,
        division: parsed.data.division,
        image: parsed.data.image || null,
      },
    });

    revalidatePath('/admin/categories');
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.log(error);
    return { success: false, error: 'Error al actualizar la categoría' };
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
        error: `No se puede eliminar: Tiene ${category._count.products} productos asociados.` 
      };
    }

    await prisma.category.delete({ where: { id } });
    
    revalidatePath('/admin/categories');
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: 'Error al eliminar la categoría' };
  }
}