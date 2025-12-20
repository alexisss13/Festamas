import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { Providers } from "@/components/providers/Providers"; // 👈 Importamos el nuevo provider
import { auth } from "@/auth"; // 👈 Importamos la autenticación
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Festamas | Artículos de Fiesta en Trujillo",
  description: "La mejor tienda de globos y decoración en Trujillo, Perú.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  return (
    <html lang="es">
      <body className={`${inter.className} antialiased`}>
        <Providers session={session}>
          {children}
          <Toaster richColors position="top-center" />
        </Providers>
      </body>
    </html>
  );
}