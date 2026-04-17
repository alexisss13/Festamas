'use server';

import prisma from '@/lib/prisma';
import { getHomeSections } from './home-sections';
import { inferLegacyDivision } from '@/lib/ecommerce-helpers';

const mapProductForBranch = (product: any, branchId: string, ecommerceCode?: string | null) => {
  const firstVariant = product.variants[0];
  const variantStock = firstVariant?.stock?.find((item: any) => item.branchId === branchId);
  const stock = variantStock?.quantity ?? 0;
  const price = Number(firstVariant?.price ?? product.basePrice ?? 0);
  return {
    id: product.id,
    title: product.title,
    slug: product.slug,
    description: product.description,
    price,
    stock,
    images: firstVariant?.images?.length ? firstVariant.images : product.images,
    isAvailable: product.isAvailable,
    wholesalePrice: product.wholesalePrice ? Number(product.wholesalePrice) : 0,
    wholesaleMinCount: product.wholesaleMinCount,
    discountPercentage: product.discountPercentage,
    tags: product.tags,
    groupTag: product.groupTag,
    averageRating: product.averageRating ? Number(product.averageRating) : 0,
    reviewCount: product.reviewCount || 0,
    division: inferLegacyDivision(ecommerceCode),
    categoryId: product.categoryId,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
    category: { name: product.category.name, slug: product.category.slug },
  };
};

export const getHomeData = async (businessId: string, branchId: string, ecommerceCode?: string | null) => {
  try {
    const newArrivals = await prisma.product.findMany({
      take: 8,
      where: {
        businessId,
        branchOwnerId: branchId,
        isAvailable: true,
        active: true,
      },
      orderBy: { createdAt: 'desc' },
      include: {
        category: true,
        variants: {
          where: { active: true },
          include: {
            stock: { where: { branchId } },
          },
          orderBy: { createdAt: 'asc' },
          take: 1,
        },
      },
    });

    const categories = await prisma.category.findMany({
      take: 6, 
      where: {
        businessId,
        ecommerceCode: ecommerceCode ?? undefined,
        products: {
          some: {
            businessId,
            branchOwnerId: branchId,
            isAvailable: true,
            active: true,
          },
        },
      },
      orderBy: {
        products: { _count: 'desc' } 
      },
      include: {
        _count: { select: { products: true } }
      }
    });

    const { sections } = await getHomeSections(branchId, true);

    return {
      newArrivals: newArrivals.map((product) => mapProductForBranch(product, branchId, ecommerceCode)),
      categories,
      sections: sections.map((section: any) => ({
        ...section,
        division: inferLegacyDivision(ecommerceCode),
      })),
    };
  } catch (error) {
    console.error(error);
    return {
      newArrivals: [],
      categories: [],
      sections: []
    };
  }
};
