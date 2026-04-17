'use server';

import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { unstable_cache } from 'next/cache';
import { getEcommerceContextFromCookie } from '@/lib/ecommerce-context';
import { inferLegacyDivision } from '@/lib/ecommerce-helpers';

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

  createdAt: Date;
  barcode: string | null;
  category: {
    name: string;
    slug: string;
  };
};

const mapProduct = (product: any, branchId: string, ecommerceCode?: string | null): ProductWithCategory => {
  const firstVariant = product.variants[0];
  const stock = firstVariant?.stock?.find((item: any) => item.branchId === branchId)?.quantity ?? 0;
  const price = Number(firstVariant?.price ?? product.basePrice ?? 0);

  return {
    id: product.id,
    title: product.title,
    slug: product.slug,
    price,
    stock,
    images: firstVariant?.images?.length ? firstVariant.images : product.images,
    isAvailable: product.isAvailable,
    wholesalePrice: product.wholesalePrice ? Number(product.wholesalePrice) : 0,
    wholesaleMinCount: product.wholesaleMinCount,
    discountPercentage: product.discountPercentage,
    tags: product.tags,
    averageRating: product.averageRating ? Number(product.averageRating) : 0,
    reviewCount: product.reviewCount || 0,
    createdAt: product.createdAt,
    barcode: firstVariant?.barcode ?? null,
    category: {
      name: product.category.name,
      slug: product.category.slug,
    },
  };
};

const getOrderBy = (sort: string): Prisma.ProductOrderByWithRelationInput[] => {
  if (sort === 'oldest') return [{ createdAt: 'asc' }];
  if (sort === 'newest') return [{ createdAt: 'desc' }];
  if (sort === 'price_asc') return [{ basePrice: 'asc' }];
  if (sort === 'price_desc') return [{ basePrice: 'desc' }];
  if (sort === 'popular') return [{ salesCount: 'desc' }, { viewCount: 'desc' }];
  return [{ createdAt: 'desc' }];
};

interface GetProductsOptions {
  includeInactive?: boolean;
  query?: string;
  sort?: string;
  division?: string;
  categoryId?: string;
  page?: number;
  take?: number;
  minPrice?: number;
  maxPrice?: number;
  tag?: string;
  discount?: boolean;
  stock?: boolean;
}

export async function getProducts({
  includeInactive = false,
  query = '',
  sort = 'newest',
  categoryId,
  page = 1,
  take = 12,
  minPrice,
  maxPrice,
  tag,
  discount,
  stock
}: GetProductsOptions = {}) {
  try {
    const { business, activeBranch } = await getEcommerceContextFromCookie();
    const skip = (page - 1) * take;

    const where: Prisma.ProductWhereInput = {
      businessId: business.id,
      branchOwnerId: activeBranch.id,
      active: includeInactive ? undefined : true,
      isAvailable: includeInactive ? undefined : true,
      categoryId: categoryId && categoryId !== 'all' ? categoryId : undefined,
      tags: tag ? { has: tag } : undefined,
      discountPercentage: discount ? { gt: 0 } : undefined,
      basePrice: minPrice || maxPrice ? {
        gte: minPrice ? minPrice : undefined,
        lte: maxPrice ? maxPrice : undefined,
      } : undefined,
      OR: query
        ? [
            { title: { contains: query, mode: 'insensitive' } },
            { tags: { has: query.toLowerCase() } },
            { slug: { contains: query, mode: 'insensitive' } },
          ]
        : undefined,
    };

    // Filtro de stock
    const stockFilter = stock ? {
      variants: {
        some: {
          active: true,
          stock: {
            some: {
              branchId: activeBranch.id,
              quantity: { gt: 0 }
            }
          }
        }
      }
    } : {};

    const finalWhere = { ...where, ...stockFilter };

    const [products, totalCount] = await prisma.$transaction([
      prisma.product.findMany({
        where: finalWhere,
        take,
        skip,
        orderBy: getOrderBy(sort),
        include: {
          category: true,
          variants: {
            where: { active: true },
            include: { stock: { where: { branchId: activeBranch.id } } },
            orderBy: { createdAt: 'asc' },
            take: 1,
          },
        },
      }),
      prisma.product.count({ where: finalWhere }),
    ]);

    const data = products.map((product) => mapProduct(product, activeBranch.id, activeBranch.ecommerceCode));
    
    // Obtener tags disponibles de los productos encontrados
    const availableTags = Array.from(new Set(products.flatMap((product) => product.tags))).sort();
    
    const totalPages = Math.max(1, Math.ceil(totalCount / take));
    
    return { 
      success: true, 
      data, 
      availableTags,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        totalItems: totalCount,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      },
      meta: { page, totalPages, totalCount, hasNextPage: page < totalPages, hasPrevPage: page > 1 } 
    };
  } catch (error) {
    console.error('Error obteniendo productos:', error);
    return { 
      success: false, 
      message: 'No se pudieron cargar los productos.', 
      data: [], 
      availableTags: [],
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalCount: 0,
        totalItems: 0,
        hasNextPage: false,
        hasPrevPage: false
      },
      meta: { page: 1, totalPages: 1, totalCount: 0, hasNextPage: false, hasPrevPage: false } 
    };
  }
}

export const getProduct = unstable_cache(async (slug: string) => {
  const { business, activeBranch } = await getEcommerceContextFromCookie();
  const product = await prisma.product.findFirst({
    where: { slug, businessId: business.id, branchOwnerId: activeBranch.id, active: true, isAvailable: true },
    include: {
      category: true,
      variants: { where: { active: true }, include: { stock: { where: { branchId: activeBranch.id } } }, take: 1 },
    },
  });
  if (!product) return null;
  return mapProduct(product, activeBranch.id, activeBranch.ecommerceCode);
}, ['get-single-product'], { tags: ['products'] });

interface CategoryOptions {
  page?: number;
  take?: number;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
  tag?: string;
  discount?: boolean;
  stock?: boolean;
}

export const getProductsByCategory = async (
  categorySlug: string,
  { page = 1, take = 12, sort = 'newest', tag, minPrice, maxPrice, discount, stock }: CategoryOptions = {}
) => {
  try {
    const { business, activeBranch } = await getEcommerceContextFromCookie();
    const category = await prisma.category.findFirst({ where: { slug: categorySlug, businessId: business.id } });
    if (!category) return null;

    const whereClause: Prisma.ProductWhereInput = {
      categoryId: category.id,
      businessId: business.id,
      branchOwnerId: activeBranch.id,
      active: true,
      isAvailable: true,
      tags: tag ? { has: tag } : undefined,
      // Filtro de descuento
      discountPercentage: discount ? { gt: 0 } : undefined,
      // Filtro de precio
      basePrice: minPrice || maxPrice ? {
        gte: minPrice ? minPrice : undefined,
        lte: maxPrice ? maxPrice : undefined,
      } : undefined,
    };

    // Si se filtra por stock, necesitamos hacer una consulta más compleja
    const stockFilter = stock ? {
      variants: {
        some: {
          active: true,
          stock: {
            some: {
              branchId: activeBranch.id,
              quantity: { gt: 0 }
            }
          }
        }
      }
    } : {};

    const finalWhereClause = { ...whereClause, ...stockFilter };

    const [products, totalCount] = await prisma.$transaction([
      prisma.product.findMany({
        where: finalWhereClause,
        include: {
          category: true,
          variants: { where: { active: true }, include: { stock: { where: { branchId: activeBranch.id } } }, take: 1 },
        },
        orderBy: getOrderBy(sort),
        take,
        skip: (page - 1) * take,
      }),
      prisma.product.count({ where: finalWhereClause }),
    ]);

    const availableTags = Array.from(new Set(products.flatMap((product) => product.tags))).sort();
    const mappedProducts = products.map((product) => mapProduct(product, activeBranch.id, activeBranch.ecommerceCode));

    return {
      categoryName: category.name,
      division: inferLegacyDivision(activeBranch.ecommerceCode),
      products: mappedProducts,
      availableTags,
      pagination: { 
        currentPage: page, 
        totalPages: Math.max(1, Math.ceil(totalCount / take)), 
        totalCount,
        totalItems: totalCount 
      },
    };
  } catch (error) {
    console.log(error);
    return null;
  }
};

export const getProductsByTag = async (tag: string, take: number = 8) => {
  try {
    const { business, activeBranch } = await getEcommerceContextFromCookie();
    const products = await prisma.product.findMany({
      take,
      where: {
        businessId: business.id,
        branchOwnerId: activeBranch.id,
        tags: { has: tag },
        isAvailable: true,
        active: true,
      },
      include: {
        category: { select: { name: true, slug: true } },
        variants: { where: { active: true }, include: { stock: { where: { branchId: activeBranch.id } } }, take: 1 },
      },
      orderBy: { createdAt: 'desc' },
    });
    return { products: products.map((product) => mapProduct(product, activeBranch.id, activeBranch.ecommerceCode)) };
  } catch (error) {
    console.log(error);
    return { products: [] };
  }
};

export const getSimilarProducts = async (categoryId: string, currentProductId: string, take = 8) => {
  try {
    const { business, activeBranch } = await getEcommerceContextFromCookie();
    const products = await prisma.product.findMany({
      take,
      where: {
        categoryId,
        businessId: business.id,
        branchOwnerId: activeBranch.id,
        isAvailable: true,
        active: true,
        NOT: { id: currentProductId },
      },
      include: {
        category: { select: { name: true, slug: true } },
        variants: { where: { active: true }, include: { stock: { where: { branchId: activeBranch.id } } }, take: 1 },
      },
      orderBy: { createdAt: 'desc' }
    });
    return products.map((product) => mapProduct(product, activeBranch.id, activeBranch.ecommerceCode));
  } catch (error) {
    console.error(error);
    return [];
  }
};

interface NewArrivalsOptions {
  page?: number;
  take?: number;
  sort?: string;
  tag?: string;
  division?: string;
  minPrice?: number;
  maxPrice?: number;
}

export const getNewArrivalsProducts = async ({
  page = 1,
  take = 12,
  sort = 'newest',
  tag,
}: NewArrivalsOptions) => {
  const { business, activeBranch } = await getEcommerceContextFromCookie();
  const whereClause: Prisma.ProductWhereInput = {
    businessId: business.id,
    branchOwnerId: activeBranch.id,
    active: true,
    isAvailable: true,
    tags: tag ? { has: tag } : undefined,
  };

  const [products, totalCount] = await prisma.$transaction([
    prisma.product.findMany({
      where: whereClause,
      include: {
        category: true,
        variants: { where: { active: true }, include: { stock: { where: { branchId: activeBranch.id } } }, take: 1 },
      },
      orderBy: getOrderBy(sort),
      take,
      skip: (page - 1) * take,
    }),
    prisma.product.count({ where: whereClause }),
  ]);

  const availableTags = Array.from(new Set(products.flatMap((product) => product.tags))).sort();
  return {
    products: products.map((product) => mapProduct(product, activeBranch.id, activeBranch.ecommerceCode)),
    availableTags,
    pagination: { currentPage: page, totalPages: Math.max(1, Math.ceil(totalCount / take)), totalCount }
  };
};
