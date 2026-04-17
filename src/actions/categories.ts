'use server';

import prisma from '@/lib/prisma';
import { categorySchema } from '@/lib/zod';
import { revalidatePath } from 'next/cache';

interface CategoriesFilters {
  businessId: string;
  ecommerceCode?: string | null;
}

export async function getCategories({ businessId, ecommerceCode }: CategoriesFilters) {
  try {
    const categories = await prisma.category.findMany({
      where: {
        businessId,
        ecommerceCode: ecommerceCode ?? undefined,
        products: {
          some: {
            businessId,
            isAvailable: true,
            active: true,
          },
        },
      },
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
    ecommerceCode: formData.get('ecommerceCode'),
    businessId: formData.get('businessId'),
    image: formData.get('image'),
  };

  const parsed = categorySchema.safeParse(data);

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  try {
    await prisma.category.create({
      data: {
        name: parsed.data.name,
        slug: parsed.data.slug,
        ecommerceCode: parsed.data.ecommerceCode || null,
        businessId: parsed.data.businessId,
        image: parsed.data.image || null,
      },
    });

    revalidatePath('/admin/categories');
    revalidatePath('/');
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
    ecommerceCode: formData.get('ecommerceCode'),
    businessId: formData.get('businessId'),
    image: formData.get('image'),
  };

  const parsed = categorySchema.safeParse(data);

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  try {
    await prisma.category.update({
      where: { id },
      data: {
        name: parsed.data.name,
        slug: parsed.data.slug,
        ecommerceCode: parsed.data.ecommerceCode || null,
        businessId: parsed.data.businessId,
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
