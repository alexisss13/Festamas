'use server';

import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

// Campos que se pueden editar desde el admin (solo ecommerce)
interface UpdateProductEcommerceData {
  description?: string;
  tags?: string[];
  groupTag?: string | null;
  isAvailable?: boolean;
  discountPercentage?: number;
}

export async function getProductsForAdmin() {
  try {
    const session = await auth();
    const allowedRoles = ['ADMIN', 'OWNER', 'SUPER_ADMIN', 'MANAGER'];
    if (!session?.user || !allowedRoles.includes(session.user.role)) {
      return { success: false, error: 'No autorizado' };
    }

    const products = await prisma.product.findMany({
      where: {
        active: true,
      },
      include: {
        category: {
          select: {
            name: true,
          },
        },
        supplier: {
          select: {
            name: true,
          },
        },
        variants: {
          where: {
            active: true,
          },
          select: {
            id: true,
            name: true,
            sku: true,
            barcode: true,
            price: true,
            cost: true,
            minStock: true,
            stock: {
              select: {
                quantity: true,
                branch: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Serializar Decimals a números
    const serializedProducts = products.map(product => ({
      ...product,
      basePrice: Number(product.basePrice),
      wholesalePrice: product.wholesalePrice ? Number(product.wholesalePrice) : null,
      averageRating: Number(product.averageRating),
      variants: product.variants.map(variant => ({
        ...variant,
        price: variant.price ? Number(variant.price) : null,
        cost: Number(variant.cost),
      })),
    }));

    return { success: true, products: serializedProducts };
  } catch (error) {
    console.error('Error al obtener productos:', error);
    return { success: false, error: 'Error al obtener productos' };
  }
}

export async function getProductForEdit(id: string) {
  try {
    const session = await auth();
    const allowedRoles = ['ADMIN', 'OWNER', 'SUPER_ADMIN', 'MANAGER'];
    if (!session?.user || !allowedRoles.includes(session.user.role)) {
      return { success: false, error: 'No autorizado' };
    }

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        supplier: {
          select: {
            id: true,
            name: true,
          },
        },
        variants: {
          where: {
            active: true,
          },
          select: {
            id: true,
            name: true,
            sku: true,
            barcode: true,
            price: true,
            cost: true,
            minStock: true,
            attributes: true,
            images: true,
            stock: {
              include: {
                branch: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!product) {
      return { success: false, error: 'Producto no encontrado' };
    }

    // Serializar Decimals a números
    const serializedProduct = {
      ...product,
      basePrice: Number(product.basePrice),
      wholesalePrice: product.wholesalePrice ? Number(product.wholesalePrice) : null,
      averageRating: Number(product.averageRating),
      variants: product.variants.map(variant => ({
        id: variant.id,
        name: variant.name,
        sku: variant.sku,
        barcode: variant.barcode,
        price: variant.price ? Number(variant.price) : null,
        cost: Number(variant.cost),
        minStock: variant.minStock,
        attributes: variant.attributes,
        images: variant.images,
        stock: variant.stock,
      })),
    };

    return { success: true, product: serializedProduct };
  } catch (error) {
    console.error('Error al obtener producto:', error);
    return { success: false, error: 'Error al obtener producto' };
  }
}

export async function updateProductEcommerce(id: string, data: UpdateProductEcommerceData) {
  try {
    const session = await auth();
    const allowedRoles = ['ADMIN', 'OWNER', 'SUPER_ADMIN', 'MANAGER'];
    if (!session?.user || !allowedRoles.includes(session.user.role)) {
      return { success: false, error: 'No autorizado' };
    }

    const updateData: any = {};

    if (data.description !== undefined) {
      updateData.description = data.description;
    }

    if (data.tags !== undefined) {
      updateData.tags = data.tags;
    }

    if (data.groupTag !== undefined) {
      updateData.groupTag = data.groupTag;
    }

    if (data.isAvailable !== undefined) {
      updateData.isAvailable = data.isAvailable;
    }

    if (data.discountPercentage !== undefined) {
      updateData.discountPercentage = Math.max(0, Math.min(100, data.discountPercentage));
    }

    const product = await prisma.product.update({
      where: { id },
      data: updateData,
    });

    revalidatePath('/admin/products');
    revalidatePath(`/product/${product.slug}`);

    // Serializar el producto antes de devolverlo
    const serializedProduct = {
      ...product,
      basePrice: Number(product.basePrice),
      wholesalePrice: product.wholesalePrice ? Number(product.wholesalePrice) : null,
      averageRating: Number(product.averageRating),
    };

    return { success: true, product: serializedProduct };
  } catch (error) {
    console.error('Error al actualizar producto:', error);
    return { success: false, error: 'Error al actualizar producto' };
  }
}
