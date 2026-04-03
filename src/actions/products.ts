'use server';

import prisma from '@/lib/prisma';
import { Prisma, Division } from '@prisma/client';
import { revalidatePath, unstable_cache } from 'next/cache';

// Tipado fuerte para uso en componentes
export type ProductWithCategory = {
  id: string;
  title: string;
  slug: string;
  price: number;
  stock: number;
  images: string[];
  isAvailable: boolean;
  wholesalePrice: number;
  wholesaleMinCount: number | null;
  discountPercentage: number;
  tags: string[];
  division: Division;
  createdAt: Date;
  barcode: string | null;
  category: {
    name: string;
    slug: string;
  };
};

const getOrderBy = (sort: string): Prisma.ProductOrderByWithRelationInput[] => {
    switch (sort) {
        case 'price_asc': return [{ price: 'asc' }];
        case 'price_desc': return [{ price: 'desc' }];
        case 'stock_asc': return [{ stock: 'asc' }];
        case 'stock_desc': return [{ stock: 'desc' }];
        case 'oldest': return [{ createdAt: 'asc' }];
        case 'newest':
        default: return [{ createdAt: 'desc' }];
    }
};

// =====================================================================
// 1. GET PRODUCTS (Catálogo General con Filtros)
// =====================================================================
interface GetProductsOptions {
    includeInactive?: boolean;
    query?: string;
    sort?: string;
    division?: Division;
    categoryId?: string;
    page?: number;
    take?: number;
}

export async function getProducts({
  includeInactive = false,
  query = '',
  sort = 'newest',
  division = 'JUGUETERIA',
  categoryId,
  page = 1,
  take = 12
}: GetProductsOptions = {}) {
  try {
    const skip = (page - 1) * take;

    const where: Prisma.ProductWhereInput = {
      division,
      isAvailable: includeInactive ? undefined : true,
      categoryId: categoryId && categoryId !== 'all' ? categoryId : undefined,
      OR: query ? [
        { title: { contains: query, mode: 'insensitive' } },
        { tags: { has: query.toLowerCase() } },
        { slug: { contains: query, mode: 'insensitive' } },
        { barcode: { contains: query } }
      ] : undefined,
    };

    const orderBy = getOrderBy(sort);

    const [products, totalCount] = await prisma.$transaction([
      prisma.product.findMany({ where, take, skip, orderBy, include: { category: true } }),
      prisma.product.count({ where })
    ]);

    const data = products.map(p => ({
      ...p,
      price: Number(p.price),
      wholesalePrice: p.wholesalePrice ? Number(p.wholesalePrice) : 0,
      category: { name: p.category.name, slug: p.category.slug }
    }));

    const totalPages = Math.ceil(totalCount / take);

    return { success: true, data, meta: { page, totalPages, totalCount, hasNextPage: page < totalPages, hasPrevPage: page > 1 } };
  } catch (error) {
    console.error('Error obteniendo productos:', error);
    return {
      success: false,
      message: 'No se pudieron cargar los productos.',
      data: [],
      meta: { page: 1, totalPages: 1, totalCount: 0, hasNextPage: false, hasPrevPage: false }
    };
  }
}

// =====================================================================
// 2. GET PRODUCT (Detalle Individual)
// =====================================================================
export const getProduct = unstable_cache(
  async (slug: string) => {
    try {
      const product = await prisma.product.findFirst({
        where: { slug: slug, isAvailable: true },
        include: { category: true },
      });

      if (!product) return null;

      return {
        ...product,
        price: Number(product.price),
        wholesalePrice: product.wholesalePrice ? Number(product.wholesalePrice) : 0,
        discountPercentage: product.discountPercentage,
      };
    } catch (error) {
      console.log(error);
      return null;
    }
  },
  ['get-single-product'],
  { tags: ['products'] }
);

// =====================================================================
// 3. GET PRODUCTS BY CATEGORY (Con Filtros y Paginación)
// =====================================================================
interface CategoryOptions {
  page?: number;
  take?: number;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
  tag?: string;
}

export const getProductsByCategory = async (
  categorySlug: string,
  { page = 1, take = 12, minPrice, maxPrice, sort = 'newest', tag }: CategoryOptions = {}
) => {
  try {
    const category = await prisma.category.findUnique({
      where: { slug: categorySlug },
    });

    if (!category) return null;

    const allProductsTags = await prisma.product.findMany({
      where: { categoryId: category.id, isAvailable: true },
      select: { tags: true }
    });

    const uniqueTags = Array.from(new Set(allProductsTags.flatMap(p => p.tags))).sort();

    const whereClause: Prisma.ProductWhereInput = {
      categoryId: category.id,
      isAvailable: true,
      price: {
        gte: minPrice,
        lte: maxPrice,
      },
      tags: tag ? { has: tag } : undefined
    };

    const totalCount = await prisma.product.count({ where: whereClause });
    const totalPages = Math.ceil(totalCount / take);

    const products = await prisma.product.findMany({
      where: whereClause,
      include: { category: true },
      orderBy: getOrderBy(sort),
      take: take,
      skip: (page - 1) * take,
    });

    const cleanProducts = products.map((product) => ({
      id: product.id,
      title: product.title,
      slug: product.slug,
      price: Number(product.price),
      stock: product.stock,
      images: product.images,
      isAvailable: product.isAvailable,
      wholesalePrice: product.wholesalePrice ? Number(product.wholesalePrice) : 0,
      wholesaleMinCount: product.wholesaleMinCount,
      discountPercentage: product.discountPercentage,
      tags: product.tags,
      division: product.division,
      createdAt: product.createdAt,
      barcode: product.barcode,
      category: {
        name: product.category.name,
        slug: product.category.slug,
      },
    }));

    return {
      categoryName: category.name,
      division: category.division,
      products: cleanProducts,
      availableTags: uniqueTags,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount
      }
    };
  } catch (error) {
    console.log(error);
    return null;
  }
};

// =====================================================================
// 4. GET PRODUCTS BY TAG (Para la Home Dinámica)
// =====================================================================
export const getProductsByTag = async (tag: string, take: number = 8, division?: Division) => {
  try {
    const products = await prisma.product.findMany({
      take: take,
      where: {
        tags: { has: tag },
        isAvailable: true,
        division: division ? { equals: division } : undefined,
      },
      include: {
        category: {
            select: {
                name: true,
                slug: true
            }
        }
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const mappedProducts = products.map(p => ({
        ...p,
        price: Number(p.price),
        wholesalePrice: p.wholesalePrice ? Number(p.wholesalePrice) : 0,
        category: {
            name: p.category.name,
            slug: p.category.slug
        }
    }));

    return {
      products: mappedProducts,
    };
  } catch (error) {
    console.log(error);
    return { products: [] };
  }
};

// =====================================================================
// 5. GET SIMILAR PRODUCTS (Misma categoría)
// =====================================================================
export const getSimilarProducts = async (categoryId: string, currentProductId: string, take = 8) => {
  try {
    const products = await prisma.product.findMany({
      take,
      where: {
        categoryId,
        isAvailable: true,
        NOT: { id: currentProductId },
      },
      include: {
        category: {
            select: { name: true, slug: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return products.map(p => ({
        ...p,
        price: Number(p.price),
        wholesalePrice: p.wholesalePrice ? Number(p.wholesalePrice) : 0,
        category: { name: p.category.name, slug: p.category.slug }
    }));
  } catch (error) {
    console.error(error);
    return [];
  }
};

// =====================================================================
// 6. GET NEW ARRIVALS (Catálogo Completo por División)
// =====================================================================
interface NewArrivalsOptions {
  page?: number;
  take?: number;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
  tag?: string;
  division: Division;
}

export const getNewArrivalsProducts = async ({
  page = 1,
  take = 12,
  minPrice,
  maxPrice,
  sort = 'newest',
  tag,
  division
}: NewArrivalsOptions) => {
  try {
    const allProductsTags = await prisma.product.findMany({
      where: {
        division,
        isAvailable: true
      },
      select: { tags: true }
    });

    const uniqueTags = Array.from(new Set(allProductsTags.flatMap(p => p.tags))).sort();

    const whereClause: Prisma.ProductWhereInput = {
      division,
      isAvailable: true,
      price: {
        gte: minPrice,
        lte: maxPrice,
      },
      tags: tag ? { has: tag } : undefined
    };

    const totalCount = await prisma.product.count({ where: whereClause });
    const totalPages = Math.ceil(totalCount / take);

    const products = await prisma.product.findMany({
      where: whereClause,
      include: { category: true },
      orderBy: getOrderBy(sort),
      take: take,
      skip: (page - 1) * take,
    });

    const cleanProducts = products.map((product) => ({
      id: product.id,
      title: product.title,
      slug: product.slug,
      price: Number(product.price),
      stock: product.stock,
      images: product.images,
      isAvailable: product.isAvailable,
      wholesalePrice: product.wholesalePrice ? Number(product.wholesalePrice) : 0,
      wholesaleMinCount: product.wholesaleMinCount,
      discountPercentage: product.discountPercentage,
      tags: product.tags,
      division: product.division,
      createdAt: product.createdAt,
      barcode: product.barcode,
      category: {
        name: product.category.name,
        slug: product.category.slug,
      },
    }));

    return {
      products: cleanProducts,
      availableTags: uniqueTags,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount
      }
    };
  } catch (error) {
    console.log(error);
    return null;
  }
};
