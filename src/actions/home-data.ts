'use server';

import prisma from '@/lib/prisma';
import { Division } from '@prisma/client'; // Importamos el Enum real
import { getHomeSections } from './home-sections';

// 🛡️ FIX: La función ahora exige saber en qué división estamos
export const getHomeData = async (division: Division) => {
  try {
    // 1. Novedades (Últimos 8 productos DE LA DIVISIÓN ACTUAL)
    const newArrivals = await prisma.product.findMany({
      take: 8,
      where: { 
        isAvailable: true,
        division: division // 👈 ¡Faltaba esto!
      },
      orderBy: { createdAt: 'desc' },
      include: { category: true } 
    });

    // 2. Categorías Destacadas (Solo de esta división)
    const categories = await prisma.category.findMany({
      take: 6, 
      where: { 
        division: division, // 👈 ¡Faltaba esto!
        products: { some: {} } // Que tengan al menos un producto
      },
      orderBy: {
        products: { _count: 'desc' } 
      },
      include: {
        _count: { select: { products: true } }
      }
    });

    // 3. Banner Intermedio (Opcional: Si tus banners tienen división, fíltralos también)
    // Asumo que el banner "MIDDLE_SECTION" es global por ahora, si no, agrega el where.
    const middleBanner = await prisma.banner.findFirst({
      where: { 
        position: 'MIDDLE_SECTION',
        active: true 
      },
      orderBy: { createdAt: 'desc' }
    });

    // 4. Secciones por Tag (Le pasamos la división)
    const { sections } = await getHomeSections(division, true);

    return {
      newArrivals: newArrivals.map(p => ({
        id: p.id,
        title: p.title,
        slug: p.slug,
        description: p.description,
        price: Number(p.price),
        stock: p.stock,
        images: p.images,
        isAvailable: p.isAvailable,
        wholesalePrice: p.wholesalePrice ? Number(p.wholesalePrice) : 0,
        wholesaleMinCount: p.wholesaleMinCount,
        discountPercentage: p.discountPercentage,
        tags: p.tags,
        color: p.color,
        groupTag: p.groupTag,
        division: p.division,
        barcode: p.barcode,
        categoryId: p.categoryId,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
        category: { name: p.category.name, slug: p.category.slug }
      })),
      categories,
      middleBanner,
      sections
    };

  } catch (error) {
    console.error(error);
    return {
      newArrivals: [],
      categories: [],
      middleBanner: null,
      sections: []
    };
  }
};