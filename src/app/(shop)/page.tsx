import { getProducts } from '@/actions/products';
import { Hero } from '@/components/ui/Hero';
import { FeaturedCategories } from '@/components/features/FeaturedCategories';
import { ProductSort } from '@/components/features/ProductSort';
import prisma from '@/lib/prisma';
import { ProductGrid } from '@/components/features/ProductGrid'; // 👈 Importamos el Grid

export const revalidate = 60;

interface Props {
  searchParams: Promise<{ sort?: string }>;
}

export default async function HomePage({ searchParams }: Props) {
  const { sort } = await searchParams;

  // 1. Traemos TODOS los productos (el Grid filtrará visualmente)
  const productsRes = await getProducts({ sort: sort || 'newest' });
  const products = productsRes.data || [];

  // 2. Traemos Categorías
  const categories = await prisma.category.findMany({ orderBy: { name: 'asc' } });

  return (
    <main className="bg-slate-50 min-h-screen">
      
      <Hero />
      
      <FeaturedCategories categories={categories} />

      <section id="catalogo" className="container mx-auto px-4 py-8">
        
        <div className="mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
           <h2 className="text-2xl font-bold text-slate-900">Catálogo</h2>
           <ProductSort />
        </div>

        {/* 👇 Aquí está la magia: El Grid filtra por tienda activa */}
        <ProductGrid products={products} />
        
      </section>
    </main>
  );
}