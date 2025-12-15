import Link from 'next/link';
import prisma from '@/lib/prisma'; // Importamos prisma directo para server component
import { getProducts } from '@/actions/products';
import { ProductCard } from '@/components/features/ProductCard';
import { ProductSort } from '@/components/features/ProductSort';
import { PartyPopper } from 'lucide-react';
import { Hero } from '@/components/ui/Hero';
import { FeaturedCategories } from '@/components/features/FeaturedCategories'; // 👈 Importamos

export const revalidate = 60; 

interface Props {
  searchParams: Promise<{ sort?: string }>;
}

export default async function HomePage({ searchParams }: Props) {
  const { sort } = await searchParams;

  // 1. Traemos productos
  const productsRes = await getProducts({ sort: sort || 'newest' });
  const products = productsRes.data;

  // 2. Traemos Categorías (para el nuevo componente)
  // Como estamos en un Server Component, podemos llamar a Prisma directo para mayor velocidad
  const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
  });

  return (
    <main>
      
      {/* 1. HERO (Cintillo + Carrusel Principal) */}
      <Hero />

      {/* 2. COMPRA POR CATEGORÍA (NUEVO) 📸 */}
      {/* Le pasamos todas las categorías y él filtra en el cliente según la tienda */}
      <FeaturedCategories categories={categories} />

      {/* 3. CATÁLOGO DE PRODUCTOS */}
      <section id="catalogo" className="container mx-auto px-4 py-16">
        <div className="mb-12 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-col items-center md:items-start">
             <h2 className="text-3xl font-extrabold text-slate-900">Nuestros Productos</h2>
             <div className="mt-1 h-1 w-20 rounded-full bg-slate-200 md:ml-1"></div>
          </div>
          
          <ProductSort />
        </div>

        {products && products.length > 0 ? (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center">
            <PartyPopper className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 text-lg">Aún no hay productos disponibles.</p>
          </div>
        )}
      </section>

    </main>
  );
}