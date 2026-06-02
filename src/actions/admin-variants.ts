'use server';

import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { canAccessEcommerceAdmin } from '@/lib/permissions';

interface CreateVariantData {
  productId: string;
  name: string;
  attributes?: Record<string, string>;
  sku?: string;
  barcode?: string;
  images?: string[];
}

interface UpdateVariantData {
  name?: string;
  attributes?: Record<string, string>;
  sku?: string;
  barcode?: string;
  images?: string[];
  active?: boolean;
}

export async function createVariant(data: CreateVariantData) {
  try {
    const session = await auth();
    if (!session?.user || !canAccessEcommerceAdmin(session.user)) {
      return { success: false, error: 'No autorizado' };
    }

    const product = await prisma.product.findUnique({
      where: { id: data.productId },
    });

    if (!product) {
      return { success: false, error: 'Producto no encontrado' };
    }

    const variant = await prisma.productVariant.create({
      data: {
        productId: data.productId,
        name: data.name,
        attributes: data.attributes || {},
        sku: data.sku,
        barcode: data.barcode,
        images: data.images || [],
        active: true,
      },
    });

    revalidatePath('/admin/products');
    revalidatePath(`/admin/products/${data.productId}`);
    revalidatePath(`/product/${product.slug}`);

    return { success: true, variant };
  } catch (error: any) {
    console.error('Error al crear variante:', error);

    if (error.code === 'P2002') {
      return { success: false, error: 'Ya existe una variante con ese nombre para este producto' };
    }

    return { success: false, error: 'Error al crear variante' };
  }
}

export async function updateVariant(variantId: string, data: UpdateVariantData) {
  try {
    const session = await auth();
    if (!session?.user || !canAccessEcommerceAdmin(session.user)) {
      return { success: false, error: 'No autorizado' };
    }

    const updateData: any = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.attributes !== undefined) updateData.attributes = data.attributes;
    if (data.sku !== undefined) updateData.sku = data.sku;
    if (data.barcode !== undefined) updateData.barcode = data.barcode;
    if (data.images !== undefined) updateData.images = data.images;
    if (data.active !== undefined) updateData.active = data.active;

    const variant = await prisma.productVariant.update({
      where: { id: variantId },
      data: updateData,
      include: {
        product: {
          select: {
            id: true,
            slug: true,
          },
        },
      },
    });

    revalidatePath('/admin/products');
    revalidatePath(`/admin/products/${variant.product.id}`);
    revalidatePath(`/product/${variant.product.slug}`);

    return { success: true, variant };
  } catch (error: any) {
    console.error('Error al actualizar variante:', error);

    if (error.code === 'P2002') {
      return { success: false, error: 'Ya existe una variante con ese nombre para este producto' };
    }

    return { success: false, error: 'Error al actualizar variante' };
  }
}

export async function deleteVariant(variantId: string) {
  try {
    const session = await auth();
    if (!session?.user || !canAccessEcommerceAdmin(session.user)) {
      return { success: false, error: 'No autorizado' };
    }

    const variant = await prisma.productVariant.findUnique({
      where: { id: variantId },
      include: {
        product: {
          select: {
            id: true,
            slug: true,
          },
        },
      },
    });

    if (!variant) {
      return { success: false, error: 'Variante no encontrada' };
    }

    await prisma.productVariant.update({
      where: { id: variantId },
      data: { active: false },
    });

    revalidatePath('/admin/products');
    revalidatePath(`/admin/products/${variant.product.id}`);
    revalidatePath(`/product/${variant.product.slug}`);

    return { success: true };
  } catch (error) {
    console.error('Error al eliminar variante:', error);
    return { success: false, error: 'Error al eliminar variante' };
  }
}

export async function getVariantAttributeSuggestions() {
  return {
    success: true,
    suggestions: {
      color: ['Rojo', 'Azul', 'Verde', 'Amarillo', 'Rosa', 'Negro', 'Blanco', 'Morado', 'Naranja', 'Celeste'],
      talla: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
      tamaño: ['Pequeño', 'Mediano', 'Grande', 'Extra Grande'],
      edad: ['0-3 meses', '3-6 meses', '6-12 meses', '1-2 años', '3-5 años', '6-8 años', '9-12 años'],
      material: ['Plástico', 'Tela', 'Madera', 'Metal', 'Goma', 'Peluche'],
      personaje: ['Mickey Mouse', 'Minnie', 'Frozen', 'Spider-Man', 'Princesas', 'Paw Patrol', 'Peppa Pig'],
    },
  };
}
