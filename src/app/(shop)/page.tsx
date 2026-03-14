import { cookies } from 'next/headers'; 
import { getHomeData } from '@/actions/home-data';
import { getProductsByTag } from '@/actions/products';
import { getCategories } from '@/actions/categories';
import { Hero } from '@/components/ui/Hero';
import { CategoryCarousel } from '@/components/features/CategoryCarousel';
import { PromoBanner } from '@/components/features/PromoBanner';
import { ProductCarousel } from '@/components/features/ProductCarousel';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Division } from '@prisma/client';

export default async function Home() {
  const cookieStore = await cookies();
  const divisionCookie = cookieStore.get('festamas_division')?.value as Division;
  
  const currentDivision = (divisionCookie === 'FIESTAS' || divisionCookie === 'JUGUETERIA') 
    ? divisionCookie 
    : 'JUGUETERIA';

  // 1. Ejecutamos las promesas en paralelo para velocidad
  const [homeData, categoriesResult] = await Promise.all([
    getHomeData(currentDivision),
    getCategories(currentDivision)
  ]);

  const { newArrivals, middleBanner, sections } = homeData;
  
  const allCategories = categoriesResult.success && categoriesResult.data 
    ? categoriesResult.data 
    : [];

  const sectionsWithProducts = await Promise.all(
    sections.map(async (section) => {
      const { products } = await getProductsByTag(section.tag, 8, section.division);
      return { ...section, products };
    })
  );

  return (
    <main className="min-h-screen bg-white pb-24">
      <Hero />

      {/* 🔥 FIX: Redujimos 'space-y-24' a 'space-y-12 md:space-y-16' para juntar las secciones. */}
      {/* También se ajustó el margen top inicial 'mt-8 md:mt-12' para acercarlo al Hero */}
      <div className="container mx-auto px-4 md:px-8 lg:px-10 xl:px-12 mt-8 md:mt-12 space-y-12 md:space-y-16">
        
        {/* 2. CATEGORÍAS */}
        <CategoryCarousel categories={allCategories} />

        {/* 1. RECIÉN LLEGADOS */}
        {newArrivals.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4 px-2">
              <div className="flex items-center gap-2">
                {/* Título igualado a las categorías (proporcional) */}
                <h2 className="font-medium text-[16px] md:text-[24px] leading-tight text-[#333] tracking-tight">
                  ¡Recién Llegados!
                </h2>
              </div>
              
              <Button variant="link" asChild className="text-slate-500 hover:text-slate-900 font-medium">
                <Link href={`/new-arrivals?division=${currentDivision}`}>
                  Ver todo <ArrowRight className="ml-1 w-4 h-4" />
                </Link>
              </Button>
            </div>
            
            <ProductCarousel products={newArrivals as any} autoPlay={true} />
          </section>
        )}

        {/* 3. BANNER INTERMEDIO */}
        {middleBanner && <PromoBanner banner={middleBanner} />}

        {/* 4. SECCIONES DINÁMICAS */}
        {sectionsWithProducts.map((section) => {
          if (!section.products || section.products.length === 0) return null;

          const titleClass = section.division === 'JUGUETERIA' ? 'text-rose-600' : 'text-fuchsia-600';

          return (
            <section key={section.id} className="animate-in fade-in duration-700">
              <div className="flex items-center justify-between mb-4 px-2">
                <div>
                  {/* Título igualado a las categorías, respetando color */}
                  <h2 className={`font-medium text-[16px] md:text-[24px] leading-tight tracking-tight ${titleClass}`}>
                    {section.title}
                  </h2>
                  {section.subtitle && (
                    <p className="text-sm text-slate-500 mt-1">{section.subtitle}</p>
                  )}
                </div>
                
                {/* 🔗 BOTÓN DESKTOP */}
                <Button variant="outline" size="sm" asChild className="hidden sm:flex border-slate-200 text-slate-600 hover:text-slate-900">
                    <Link href={`/collections?tag=${section.tag}&division=${section.division}`}>
                        Ver colección
                    </Link>
                </Button>
              </div>
              
              <ProductCarousel products={section.products as any} autoPlay={true} />
              
              <div className="mt-4 px-2 sm:hidden">
                  {/* 🔗 BOTÓN MÓVIL */}
                  <Button variant="outline" className="w-full" asChild>
                    <Link href={`/collections?tag=${section.tag}&division=${section.division}`}>Ver colección</Link>
                  </Button>
              </div>
            </section>
          );
        })}

      </div>
    </main>
  );
}