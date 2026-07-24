import type { Metadata } from "next";
import { Rubik } from "next/font/google"; // Asegúrate de importar Rubik
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Providers } from "@/components/providers/Providers";
import { auth } from "@/auth";
import { MarketingAnalytics } from "@/components/analytics/MarketingAnalytics";
import { getActiveStorefrontConfig } from "@/lib/storefront-config";
import { hexToHslString } from "@/lib/utils";
import { getEcommerceContextFromCookie } from '@/lib/ecommerce-context';
import { StorefrontUnavailable } from '@/components/storefront/StorefrontUnavailable';
import { getRequestSiteUrl } from '@/lib/request-site-url';

// Configuración de Fuente Rubik
const rubik = Rubik({ 
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  variable: "--font-rubik",
});

export async function generateMetadata(): Promise<Metadata> {
  // metadataBase resuelve URLs relativas (imágenes OG) contra el dominio real
  // de la request, no un env var fijo — necesario porque cada negocio puede
  // tener su propio storefrontDomain (ver getRequestSiteUrl).
  const metadataBase = new URL(await getRequestSiteUrl());
  try {
    const { business, activeBranch } = await getEcommerceContextFromCookie();
    const name = activeBranch.name || business.name;
    const description = `Tienda online de ${name}`;
    return {
      metadataBase,
      title: { default: name, template: `%s | ${name}` },
      description,
      openGraph: { siteName: name, type: 'website' },
      twitter: { card: 'summary_large_image' },
    };
  } catch { return { metadataBase, title: 'Tienda online', description: 'Catálogo y pedidos online.' }; }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  let storefront;
  try {
    storefront = await getActiveStorefrontConfig();
  } catch (error) {
    return (
      <html lang="es">
        <body className={cn(rubik.className, "antialiased")}>
          <StorefrontUnavailable reason={error instanceof Error ? error.message : undefined} />
        </body>
      </html>
    );
  }
  const themeStyle = {
    '--brand-primary': storefront.theme.primary,
    '--brand-secondary': storefront.theme.secondary,
    '--brand-accent': storefront.theme.accent,
    '--brand-primary-hsl': hexToHslString(storefront.theme.primary),
    '--brand-secondary-hsl': hexToHslString(storefront.theme.secondary),
    '--brand-accent-hsl': hexToHslString(storefront.theme.accent),
  } as React.CSSProperties;

  return (
    <html lang="es">
      <body 
        className={cn(rubik.className, "antialiased")}
        data-template={storefront.templateKey}
        style={themeStyle}
      >
        <Providers session={session}>
          <MarketingAnalytics />
          {children}
          <Toaster richColors position="top-center" />
        </Providers>
      </body>
    </html>
  );
}
