'use server';

import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { canAccessEcommerceAdmin } from '@/lib/permissions';
import { getEcommerceContextFromCookie } from '@/lib/ecommerce-context';

// Campos editables desde el admin de ecommerce (NO incluye description ni precio — esos son del ERP)
interface UpdateProductEcommerceData {
  ecommerceDescription?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  tags?: string[];
  groupTag?: string | null;
  isAvailable?: boolean;
}

export async function getProductsForAdmin(options: { page?: number; pageSize?: number; search?: string; channel?: string } = {}) {
  try {
    const session = await auth();
    if (!session?.user || !canAccessEcommerceAdmin(session.user)) {
      return { success: false, error: 'No autorizado' };
    }
    const { business, activeBranch } = await getEcommerceContextFromCookie();

    const page = Math.max(1, options.page ?? 1);
    const pageSize = Math.min(50, Math.max(10, options.pageSize ?? 20));
    const search = options.search?.trim() ?? '';
    const baseWhere: any = {
        businessId: business.id,
        active: true,
        OR: [{ branchOwnerId: activeBranch.id }, { branchOwnerId: null }],
    };
    if (options.channel && options.channel !== 'ALL') baseWhere.availableChannels = options.channel;
    if (search) {
      baseWhere.AND = [{ OR: [
        { title: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
        { category: { name: { contains: search, mode: 'insensitive' } } },
        { tags: { has: search.toLowerCase() } },
        { variants: { some: { OR: [{ sku: { contains: search, mode: 'insensitive' } }, { barcode: { contains: search, mode: 'insensitive' } }] } } },
      ] }];
    }
    const [products, total, online, posOnly, discount, withTags] = await Promise.all([
      prisma.product.findMany({
        where: baseWhere,
        skip: (page - 1) * pageSize,
        take: pageSize,
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
      }),
      prisma.product.count({ where: baseWhere }),
      prisma.product.count({ where: { ...baseWhere, availableChannels: { in: ['ECOMMERCE', 'BOTH'] } } }),
      prisma.product.count({ where: { ...baseWhere, availableChannels: 'POS' } }),
      prisma.product.count({ where: { ...baseWhere, discountPercentage: { gt: 0 } } }),
      prisma.product.count({ where: { ...baseWhere, tags: { isEmpty: false } } }),
    ]);

    // Serializar Decimals a números
    const serializedProducts = products.map(product => ({
      ...product,
      basePrice: Number(product.basePrice),
      wholesalePrice: product.wholesalePrice ? Number(product.wholesalePrice) : null,
      averageRating: Number(product.averageRating),
      cost: Number(product.cost),
    }));

    return { success: true, products: serializedProducts, total, page, pageSize, stats: { total, online, posOnly, discount, withTags } };
  } catch (error) {
    console.error('Error al obtener productos:', error);
    return { success: false, error: 'Error al obtener productos' };
  }
}

export async function getProductForEdit(id: string) {
  try {
    const session = await auth();
    if (!session?.user || !canAccessEcommerceAdmin(session.user)) {
      return { success: false, error: 'No autorizado' };
    }
    const { business, activeBranch } = await getEcommerceContextFromCookie();

    const product = await prisma.product.findFirst({
      where: {
        id,
        businessId: business.id,
        OR: [{ branchOwnerId: activeBranch.id }, { branchOwnerId: null }],
      },
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
      cost: Number(product.cost),
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
    if (!session?.user || !canAccessEcommerceAdmin(session.user)) {
      return { success: false, error: 'No autorizado' };
    }
    const { business, activeBranch } = await getEcommerceContextFromCookie();

    const updateData: any = {};

    if (data.ecommerceDescription !== undefined) {
      updateData.ecommerceDescription = data.ecommerceDescription;
    }

    if (data.metaTitle !== undefined) updateData.metaTitle = data.metaTitle;
    if (data.metaDescription !== undefined) updateData.metaDescription = data.metaDescription;

    if (data.tags !== undefined) {
      updateData.tags = data.tags;
    }

    if (data.groupTag !== undefined) {
      updateData.groupTag = data.groupTag;
    }

    if (data.isAvailable !== undefined) {
      updateData.isAvailable = data.isAvailable;
    }

    const current = await prisma.product.findFirst({
      where: { id, businessId: business.id, OR: [{ branchOwnerId: activeBranch.id }, { branchOwnerId: null }] },
      select: { id: true },
    });
    if (!current) return { success: false, error: 'Producto no encontrado' };
    const product = await prisma.product.update({ where: { id: current.id }, data: updateData });

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
