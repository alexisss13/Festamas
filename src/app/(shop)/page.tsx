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
import { getEcommerceContextFromCookie } from '@/lib/ecommerce-context';

export default async function Home() {
  const { business, activeBranch } = await getEcommerceContextFromCookie();

  const [homeData, categoriesResult] = await Promise.all([
    getHomeData(business.id, activeBranch.id, activeBranch.ecommerceCode),
    getCategories({ businessId: business.id, ecommerceCode: activeBranch.ecommerceCode })
  ]);

  const { newArrivals, middleBanner, sections } = homeData;
  
  const allCategories = categoriesResult.success && categoriesResult.data 
    ? categoriesResult.data 
    : [];

  const sectionsWithProducts = await Promise.all(
    sections.map(async (section) => {
      const { products } = await getProductsByTag(section.tag, 8);
      return { ...section, products };
    })
  );

  return (
    <main className="min-h-screen bg-white pb-24">
      <Hero />

      <div className="container mx-auto px-4 md:px-8 lg:px-10 xl:px-12 mt-8 md:mt-12 space-y-12 md:space-y-16">
        
        {/* 2. CATEGORÍAS */}
        <CategoryCarousel categories={allCategories} />

        {/* 1. RECIÉN LLEGADOS */}
        {newArrivals.length > 0 && (
          <section>
            <div className="flex items-end justify-between mb-4 px-2">
              <div className="flex flex-col">
                <h2 className="font-medium text-[16px] md:text-[24px] leading-tight text-[#333] tracking-tight">
                  ¡Recién Llegados!
                </h2>
              </div>
              
              <Button variant="link" asChild className="text-slate-500 hover:text-slate-900 font-medium px-0 pb-0 h-auto">
                <Link href="/new-arrivals">
                  Ver todo <ArrowRight className="ml-1.5 w-4 h-4" />
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

          return (
            <section key={section.id} className="animate-in fade-in duration-700">
              {/* 🔥 FIX: Estructura clonada de 'Recién Llegados' para armonía visual */}
              <div className="flex items-end justify-between mb-4 px-2">
                <div className="flex flex-col">
                  {/* Título unificado en color y tamaño */}
                  <h2 className="font-medium text-[16px] md:text-[24px] leading-tight text-[#333] tracking-tight">
                    {section.title}
                  </h2>
                  {/* Subtítulo alineado y equilibrado */}
                  {section.subtitle && (
                    <p className="text-[12px] md:text-[14px] text-slate-500 mt-0.5 md:mt-1 leading-tight">
                      {section.subtitle}
                    </p>
                  )}
                </div>
                
                {/* 🔗 BOTÓN UNIFICADO: Link minimalista en PC y Móvil en lugar de botones pesados */}
                <Button variant="link" asChild className="text-slate-500 hover:text-slate-900 font-medium px-0 pb-0 h-auto whitespace-nowrap ml-4">
                    <Link href={`/collections?tag=${section.tag}`}>
                        Ver todo <ArrowRight className="ml-1.5 w-4 h-4" />
                    </Link>
                </Button>
              </div>
              
              <ProductCarousel products={section.products as any} autoPlay={true} />
            </section>
          );
        })}

      </div>
    </main>
  );
}
