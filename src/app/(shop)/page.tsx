export const revalidate = 60; 

import { getHomeData } from '@/actions/home-data';
import { getProductsByTag } from '@/actions/products';
import { Hero } from '@/components/ui/Hero';
import { CategoryBento } from '@/components/features/CategoryBento';
import { PromoBanner } from '@/components/features/PromoBanner';
import { ProductCarousel } from '@/components/features/ProductCarousel';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default async function Home() {
  const { newArrivals, categories, middleBanner, sections } = await getHomeData();

  const sectionsWithProducts = await Promise.all(
    sections.map(async (section) => {
      const { products } = await getProductsByTag(section.tag, 8, section.division);
      return { ...section, products };
    })
  );

  return (
    <main className="min-h-screen bg-white pb-24">
      <Hero />

      <div className="container mx-auto px-4 mt-12 md:mt-16 space-y-24">
        
        {/* 1. RECIÉN LLEGADOS */}
        {newArrivals.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-2 px-2">
              <div className="flex items-center gap-2">
                {/* TÍTULO LIMPIO (Sin emojis) */}
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-700">
                  Recién Llegados
                </h2>
              </div>
              
              <Button variant="link" asChild className="text-slate-500 hover:text-slate-900 font-medium">
                <Link href="/search?sort=newest">
                  Ver todo <ArrowRight className="ml-1 w-4 h-4" />
                </Link>
              </Button>
            </div>
            
            {/* Carrusel Automático */}
            <ProductCarousel products={newArrivals as any} autoPlay={true} />
          </section>
        )}

        {/* 2. CATEGORÍAS */}
        <CategoryBento categories={categories} />

        {/* 3. BANNER INTERMEDIO */}
        {middleBanner && <PromoBanner banner={middleBanner} />}

        {/* 4. SECCIONES DINÁMICAS (TAGS) */}
        {sectionsWithProducts.map((section) => {
          if (!section.products || section.products.length === 0) return null;

          const titleClass = section.division === 'JUGUETERIA' ? 'text-rose-600' : 'text-fuchsia-600';

          return (
            <section key={section.id} className="animate-in fade-in duration-700">
              <div className="flex items-center justify-between mb-2 px-2">
                <div>
                  <h2 className={`text-2xl md:text-3xl font-bold tracking-tight ${titleClass}`}>
                    {section.title}
                  </h2>
                  {section.subtitle && (
                    <p className="text-sm text-slate-500 mt-1">{section.subtitle}</p>
                  )}
                </div>
                
                <Button variant="outline" size="sm" asChild className="hidden sm:flex border-slate-200 text-slate-600 hover:text-slate-900">
                    <Link href={`/search?tag=${section.tag}`}>
                        Ver colección
                    </Link>
                </Button>
              </div>
              
              <ProductCarousel products={section.products as any} autoPlay={true} />
              
              <div className="mt-4 px-2 sm:hidden">
                 <Button variant="outline" className="w-full" asChild>
                    <Link href={`/search?tag=${section.tag}`}>Ver colección</Link>
                 </Button>
              </div>
            </section>
          );
        })}

      </div>
    </main>
  );
}