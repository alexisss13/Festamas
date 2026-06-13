import { MetadataRoute } from 'next';
import prisma from '@/lib/prisma';
import { SITE_URL } from '@/lib/utils'; // O pon tu URL directa aquí

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const [products, categories, collections] = await Promise.all([
    prisma.product.findMany({
      where: { isAvailable: true, active: true },
      select: { slug: true, updatedAt: true },
    }),
    prisma.category.findMany({
      where: { products: { some: { isAvailable: true, active: true } } },
      select: { slug: true },
    }),
    prisma.productCollection.findMany({
      where: { active: true },
      select: { slug: true, updatedAt: true },
    }),
  ]);

  const productsUrls = products.map((p) => ({
    url: `${SITE_URL}/product/${p.slug}`,
    lastModified: p.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  const categoriesUrls = categories.map((c) => ({
    url: `${SITE_URL}/category/${c.slug}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  }));

  const collectionsUrls = collections.map((col) => ({
    url: `${SITE_URL}/collections/${col.slug}`,
    lastModified: col.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.85,
  }));

  return [
    { url: SITE_URL,                   lastModified: now, changeFrequency: 'daily',  priority: 1   },
    { url: `${SITE_URL}/collections`,  lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${SITE_URL}/tiendas`,      lastModified: now, changeFrequency: 'monthly',priority: 0.7 },
    ...categoriesUrls,
    ...collectionsUrls,
    ...productsUrls,
  ];
}