import { MetadataRoute } from 'next';
import prisma from '@/lib/prisma';
import { SITE_URL } from '@/lib/utils'; // O pon tu URL directa aquí

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // 1. Obtener datos dinámicos
  const products = await prisma.product.findMany({ where: { isAvailable: true } });
  const categories = await prisma.category.findMany();

  // 2. Mapear productos
  const productsUrls = products.map((product) => ({
    url: `${SITE_URL}/product/${product.slug}`,
    lastModified: product.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  // 3. Mapear categorías
  const categoriesUrls = categories.map((category) => ({
    url: `${SITE_URL}/category/${category.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  }));

  // 4. Rutas estáticas
  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    ...categoriesUrls,
    ...productsUrls,
  ];
}