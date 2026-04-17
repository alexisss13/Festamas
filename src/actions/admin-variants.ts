'use server';

import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

interface CreateVariantData {
  productId: string;
  name: string;
  attributes?: Record<string, string>; // { color: "Rojo", talla: "M" }
  sku?: string;
  barcode?: string;
  price?: number;
  cost: number;
  minStock: number;
  images?: string[];
}

interface UpdateVariantData {
  name?: string;
  attributes?: Record<string, string>;
  sku?: string;
  barcode?: string;
  price?: number;
  cost?: number;
  minStock?: number;
  images?: string[];
  active?: boolean;
}

export async function createVariant(data: CreateVariantData) {
  try {
    const session = await auth();
    const allowedRoles = ['ADMIN', 'OWNER', 'SUPER_ADMIN', 'MANAGER'];
    if (!session?.user || !allowedRoles.includes(session.user.role)) {
      return { success: false, error: 'No autorizado' };
    }

    // Verificar que el producto existe
    const product = await prisma.product.findUnique({
      where: { id: data.productId },
    });

    if (!product) {
      return { success: false, error: 'Producto no encontrado' };
    }

    // Crear la variante
    const variant = await prisma.productVariant.create({
      data: {
        productId: data.productId,
        name: data.name,
        attributes: data.attributes || {},
        sku: data.sku,
        barcode: data.barcode,
        price: data.price,
        cost: data.cost,
        minStock: data.minStock,
        images: data.images || [],
        active: true,
      },
    });

    revalidatePath('/admin/products');
    revalidatePath(`/admin/products/${data.productId}`);
    revalidatePath(`/product/${product.slug}`);

    // Serializar
    const serializedVariant = {
      ...variant,
      price: variant.price ? Number(variant.price) : null,
      cost: Number(variant.cost),
    };

    return { success: true, variant: serializedVariant };
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
    const allowedRoles = ['ADMIN', 'OWNER', 'SUPER_ADMIN', 'MANAGER'];
    if (!session?.user || !allowedRoles.includes(session.user.role)) {
      return { success: false, error: 'No autorizado' };
    }

    const updateData: any = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.attributes !== undefined) updateData.attributes = data.attributes;
    if (data.sku !== undefined) updateData.sku = data.sku;
    if (data.barcode !== undefined) updateData.barcode = data.barcode;
    if (data.price !== undefined) updateData.price = data.price;
    if (data.cost !== undefined) updateData.cost = data.cost;
    if (data.minStock !== undefined) updateData.minStock = data.minStock;
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

    // Serializar
    const serializedVariant = {
      ...variant,
      price: variant.price ? Number(variant.price) : null,
      cost: Number(variant.cost),
    };

    return { success: true, variant: serializedVariant };
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
    const allowedRoles = ['ADMIN', 'OWNER', 'SUPER_ADMIN', 'MANAGER'];
    if (!session?.user || !allowedRoles.includes(session.user.role)) {
      return { success: false, error: 'No autorizado' };
    }

    // Obtener la variante con el producto
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

    // Soft delete: marcar como inactiva en lugar de eliminar
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

// Obtener atributos comunes para variantes (sugerencias)
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
