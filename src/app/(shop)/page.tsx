import Link from 'next/link';
import { getProducts } from '@/actions/products';
// import { getStoreConfig } from '@/actions/settings'; // YA NO LO NECESITAMOS AQUÍ (El Hero se encarga)
// import { getBanners } from '@/actions/design';     // YA NO LO NECESITAMOS (El Hero se encarga)
import { ProductCard } from '@/components/features/ProductCard';
import { ProductSort } from '@/components/features/ProductSort';
import { PartyPopper } from 'lucide-react';
import { Hero } from '@/components/ui/Hero'; // El nuevo Hero inteligente

export const revalidate = 60; 

interface Props {
  searchParams: Promise<{ sort?: string }>;
}

export default async function HomePage({ searchParams }: Props) {
  const { sort } = await searchParams;

  // Solo traemos productos. Los banners y la config del Hero ahora las maneja el componente <Hero /> internamente.
  const productsRes = await getProducts({ sort: sort || 'newest' });
  const products = productsRes.data;

  return (
    <main>
      
      {/* 1. HERO INTELIGENTE (Cintillo + Carrusel Principal) */}
      {/* Este componente ya sabe si mostrar Festamas o FiestasYa y trae sus banners de la BD */}
      <Hero />

      {/* 2. CATÁLOGO DE PRODUCTOS */}
      <section id="catalogo" className="container mx-auto px-4 py-16">
        <div className="mb-12 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-col items-center md:items-start">
             <h2 className="text-3xl font-extrabold text-slate-900">Nuestros Productos</h2>
             <div className="mt-1 h-1 w-20 rounded-full bg-[#fc4b65] md:ml-1"></div> {/* Color Festamas por defecto */}
          </div>
          
          {/* FILTRO */}
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