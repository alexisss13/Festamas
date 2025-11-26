import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar"; // <--- Importar

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FiestasYa | Artículos de Fiesta en Trujillo",
  description: "La mejor tienda de globos y decoración en Trujillo, Perú.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${inter.className} min-h-screen bg-slate-50 antialiased`}>
        <Navbar /> {/* <--- Navbar fijo arriba */}
        {children}
      </body>
    </html>
  );
}