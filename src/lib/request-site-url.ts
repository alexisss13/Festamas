import { headers } from 'next/headers';
import { SITE_URL } from '@/lib/utils';

// Mismo patrón que ya usa sitemap.ts: cada negocio puede tener su propio
// storefrontDomain (multi-tenant), así que la URL "real" de la tienda no es
// el env var fijo NEXT_PUBLIC_APP_URL — depende del dominio con el que
// realmente llegó la request. Se centraliza acá para no repetir esta lógica
// en cada página que necesite generar metadata (canonical, OG, metadataBase).
export async function getRequestSiteUrl(): Promise<string> {
  const requestHeaders = await headers();
  const host = (requestHeaders.get('x-forwarded-host') ?? requestHeaders.get('host') ?? '')
    .split(',')[0]
    .trim();
  const protocol = requestHeaders.get('x-forwarded-proto') ?? (host.includes('localhost') ? 'http' : 'https');
  return host ? `${protocol}://${host}` : SITE_URL;
}
