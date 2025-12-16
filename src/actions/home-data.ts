'use server';

import prisma from '@/lib/prisma';
import { getProducts } from './products';
import { getHomeSections } from './home-sections';

export const getHomeData = async () => {
  try {
    // 1. Novedades (Últimos 8 productos)
    const newArrivals = await prisma.product.findMany({
      take: 8,
      where: { isAvailable: true },
      orderBy: { createdAt: 'desc' },
      include: { category: true } // Necesario para la Card
    });

    // 2. Categorías Destacadas (Para el Bento Grid)
    // Solo traemos las que tienen productos y (idealmente) imagen
    // 2. Categorías: Agregamos ordenamiento o filtro si quisieras
    // Por ahora traemos las que tienen más productos, sin importar tienda para dar variedad
    // Si quieres filtrar, agrega: where: { division: 'JUGUETERIA' } (o lo que aplique)
    const categories = await prisma.category.findMany({
      take: 5, 
      where: { 
        products: { some: {} } 
        // Si quieres separar tiendas estrictamente, aquí deberías filtrar.
        // Pero en la Home Unificada, es mejor mostrar un mix de las top categorías.
      },
      orderBy: {
        products: { _count: 'desc' } // Las categorías con más productos primero
      },
      include: {
        _count: { select: { products: true } }
      }
    });

    // 3. Banner Intermedio (Middle Section)
    const middleBanner = await prisma.banner.findFirst({
      where: { 
        position: 'MIDDLE_SECTION',
        active: true 
      },
      orderBy: { createdAt: 'desc' }
    });

    // 4. Secciones por Tag (Configuradas en Admin)
    const { sections } = await getHomeSections(true);

    return {
      newArrivals: newArrivals.map(p => ({
        ...p,
        price: Number(p.price),
        wholesalePrice: p.wholesalePrice ? Number(p.wholesalePrice) : 0,
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