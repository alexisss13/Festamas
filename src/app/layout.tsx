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

// Configuración de Fuente Rubik
const rubik = Rubik({ 
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  variable: "--font-rubik",
});

export const metadata: Metadata = {
  title: "Festamas | Artículos de Fiesta",
  description: "La mejor tienda de celebraciones.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  const storefront = await getActiveStorefrontConfig();
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
      {/* 🚀 AQUÍ ESTÁ EL TRUCO: data-theme="festamas"
         Esto activa el bloque CSS que definimos arriba con el color Rojo.
      */}
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
