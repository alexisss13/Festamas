export const revalidate = 60; // ISR 60 segundos

import { getHomeData } from '@/actions/home-data';
import { getProductsByTag } from '@/actions/products';
import { Hero } from '@/components/ui/Hero';
import { CategoryBento } from '@/components/features/CategoryBento';
import { PromoBanner } from '@/components/features/PromoBanner';
import { ProductCarousel } from '@/components/features/ProductCarousel'; // 👈 El nuevo componente
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';

export default async function Home() {
  // 1. Obtenemos toda la data base
  // Novedades: Se traen los últimos 8 productos creados (configurado en el action)
  const { newArrivals, categories, middleBanner, sections } = await getHomeData();

  // 2. Fetching paralelo de productos para las secciones configuradas
  const sectionsWithProducts = await Promise.all(
    sections.map(async (section) => {
      // Traemos más productos (8) para que el carrusel tenga sentido
      const { products } = await getProductsByTag(section.tag, 8); 
      return { ...section, products };
    })
  );

  return (
    <main className="min-h-screen bg-white pb-20">
      
      {/* 1. HERO PRINCIPAL */}
      <Hero />

      <div className="container mx-auto px-4 mt-12 md:mt-16 space-y-20">
        
        {/* 2. NOVEDADES (Carrusel) */}
        {newArrivals.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-6">
              <Sparkles className="w-5 h-5 text-amber-500" />
              {/* Título en Gris Oscuro como pediste */}
              <h2 className="text-xl md:text-2xl font-bold tracking-tight text-slate-700">
                Recién Llegados
              </h2>
            </div>
            
            <ProductCarousel products={newArrivals as any} />
          </section>
        )}

        {/* 3. CATEGORÍAS (BENTO GRID) */}
        {/* Nota: Muestra las 5 categorías con más productos automáticamente */}
        <CategoryBento categories={categories} />

        {/* 4. BANNER INTERMEDIO (PROMO) */}
        {middleBanner && <PromoBanner banner={middleBanner} />}

        {/* 5. SECCIONES DINÁMICAS (TAGS) */}
        {sectionsWithProducts.map((section) => {
          if (!section.products || section.products.length === 0) return null;

          // Colores de marca sutiles
          const titleColor = section.division === 'JUGUETERIA' ? 'text-rose-600' : 'text-fuchsia-600';

          return (
            <section key={section.id} className="animate-in fade-in duration-700">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className={`text-xl md:text-2xl font-bold tracking-tight ${titleColor}`}>
                    {section.title}
                  </h2>
                  {section.subtitle && (
                    <p className="text-sm text-slate-500 mt-1">{section.subtitle}</p>
                  )}
                </div>
                {/* Enlace "Ver Todo" funcional hacia la búsqueda por Tag */}
                <Button variant="link" asChild className="text-slate-500 hover:text-slate-900">
                    <Link href={`/search?tag=${section.tag}`}>
                        Ver todo <ArrowRight className="ml-1 w-4 h-4" />
                    </Link>
                </Button>
              </div>
              
              <ProductCarousel products={section.products as any} />
            </section>
          );
        })}

      </div>
    </main>
  );
}