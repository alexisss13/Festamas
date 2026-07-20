import { MetadataRoute } from 'next';
import { headers } from 'next/headers';
import prisma from '@/lib/prisma';
import { SITE_URL } from '@/lib/utils';
import { getEcommerceContextFromCookie } from '@/lib/ecommerce-context';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const { business } = await getEcommerceContextFromCookie();
  const requestHeaders = await headers();
  const host = (requestHeaders.get('x-forwarded-host') ?? requestHeaders.get('host') ?? '')
    .split(',')[0]
    .trim();
  const protocol = requestHeaders.get('x-forwarded-proto') ?? (host.includes('localhost') ? 'http' : 'https');
  const siteUrl = host ? `${protocol}://${host}` : SITE_URL;

  const [products, categories, collections] = await Promise.all([
    prisma.product.findMany({
      where: { businessId: business.id, isAvailable: true, active: true, availableChannels: { in: ['ECOMMERCE', 'BOTH'] } },
      select: { slug: true, updatedAt: true },
    }),
    prisma.category.findMany({
      where: { businessId: business.id, products: { some: { isAvailable: true, active: true, availableChannels: { in: ['ECOMMERCE', 'BOTH'] } } } },
      select: { slug: true },
    }),
    prisma.productCollection.findMany({
      where: { businessId: business.id, active: true },
      select: { slug: true, updatedAt: true },
    }),
  ]);

  const productsUrls = products.map((p) => ({
    url: `${siteUrl}/product/${p.slug}`,
    lastModified: p.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  const categoriesUrls = categories.map((c) => ({
    url: `${siteUrl}/category/${c.slug}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  }));

  const collectionsUrls = collections.map((col) => ({
    url: `${siteUrl}/collections/${col.slug}`,
    lastModified: col.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.85,
  }));

  return [
    { url: siteUrl,                   lastModified: now, changeFrequency: 'daily',  priority: 1   },
    { url: `${siteUrl}/collections`,  lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${siteUrl}/tiendas`,      lastModified: now, changeFrequency: 'monthly',priority: 0.7 },
    ...categoriesUrls,
    ...collectionsUrls,
    ...productsUrls,
  ];
}
