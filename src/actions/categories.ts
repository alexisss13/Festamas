'use server';

import prisma from '@/lib/prisma';
import { categorySchema } from '@/lib/zod';
import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';
import { canAccessEcommerceAdmin } from '@/lib/permissions';
import { getEcommerceContextFromCookie } from '@/lib/ecommerce-context';

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
        const { business } = await getEcommerceContextFromCookie();
        const category = await prisma.category.findFirst({ where: { id, businessId: business.id } });
        return { success: true, data: category };
    } catch (error) {
        return { success: false, error: 'Error al cargar categoría' };
    }
}

// --- CREAR ---
export async function createCategory(formData: FormData) {
  const session = await auth();
  if (!session?.user || !canAccessEcommerceAdmin(session.user)) return { success: false, error: 'No autorizado' };
  const { business } = await getEcommerceContextFromCookie();
  const data = {
    name: formData.get('name'),
    slug: formData.get('slug'),
    ecommerceCode: formData.get('ecommerceCode'),
    businessId: business.id,
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
  const session = await auth();
  if (!session?.user || !canAccessEcommerceAdmin(session.user)) return { success: false, error: 'No autorizado' };
  const { business } = await getEcommerceContextFromCookie();
  const data = {
    name: formData.get('name'),
    slug: formData.get('slug'),
    ecommerceCode: formData.get('ecommerceCode'),
    businessId: business.id,
    image: formData.get('image'),
  };

  const parsed = categorySchema.safeParse(data);

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  try {
    const category = await prisma.category.findFirst({ where: { id, businessId: business.id }, select: { id: true } });
    if (!category) return { success: false, error: 'Categoría no encontrada' };
    await prisma.category.update({
      where: { id: category.id },
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
  const session = await auth();
  if (!session?.user || !canAccessEcommerceAdmin(session.user)) return { success: false, error: 'No autorizado' };
  try {
    const { business } = await getEcommerceContextFromCookie();
    const category = await prisma.category.findFirst({
      where: { id, businessId: business.id },
      include: { _count: { select: { products: true } } }
    });

    if (category && category._count.products > 0) {
      return {
        success: false,
        error: `No se puede eliminar: Tiene ${category._count.products} productos asociados.`
      };
    }

    if (!category) return { success: false, error: 'Categoría no encontrada' };
    await prisma.category.delete({ where: { id: category.id } });

    revalidatePath('/admin/categories');
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: 'Error al eliminar la categoría' };
  }
}
