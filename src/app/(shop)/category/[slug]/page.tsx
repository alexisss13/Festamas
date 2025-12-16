import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { getProductsByCategory } from '@/actions/products';
import { ProductCard } from '@/components/features/ProductCard';
import { CategoryFilters } from '@/components/features/CategoryFilters';
import { Pagination } from '@/components/ui/pagination';
import { PartyPopper, SearchX, SlidersHorizontal } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ 
    sort?: string;
    min?: string;
    max?: string;
    page?: string;
    tag?: string;
  }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const title = slug.charAt(0).toUpperCase() + slug.slice(1);
  return {
    title: `${title} | FiestasYa`,
    description: `Compra los mejores artículos de ${slug} en Trujillo.`,
  };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { sort, min, max, page, tag } = await searchParams;

  const currentPage = Number(page) || 1;
  const minPrice = min ? Number(min) : undefined;
  const maxPrice = max ? Number(max) : undefined;

  const data = await getProductsByCategory(slug, {
    page: currentPage,
    take: 12,
    sort: sort || 'newest',
    minPrice,
    maxPrice,
    tag
  });
  
  if (!data) notFound();

  // 👇 Ahora tenemos availableTags disponibles
  const { categoryName, products, division, pagination, availableTags } = data;

  const isToys = division === 'JUGUETERIA';
  const brandColor = isToys ? '#fc4b65' : '#ec4899';
  const bgBrand = isToys ? 'bg-rose-50' : 'bg-pink-50';

  return (
    <div className="container mx-auto px-4 py-8 lg:py-12">
      
      <div className="mb-10 flex flex-col items-center text-center space-y-4">
        <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase bg-white border border-slate-200 shadow-sm text-slate-500`}>
            {isToys ? 'Festamas Juguetería' : 'FiestasYa Decoración'}
        </span>
        <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 capitalize">
          {categoryName}
        </h1>
        <div className="h-1.5 w-20 rounded-full" style={{ backgroundColor: brandColor }}></div>
        <p className="text-slate-500 max-w-xl">
            Explora nuestra colección y encuentra todo lo que necesitas al mejor precio.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
        
        {/* SIDEBAR DESKTOP */}
        <div className="hidden lg:block space-y-8">
            <div className="sticky top-24 p-6 bg-white rounded-xl border border-slate-100 shadow-sm">
                <CategoryFilters 
                    brandColor={brandColor} 
                    availableTags={availableTags} // 👈 Pasamos los tags
                />
            </div>
        </div>

        {/* CONTENIDO PRINCIPAL */}
        <div className="lg:col-span-3">
            
            {/* FILTROS MÓVIL */}
            <div className="lg:hidden mb-6 flex justify-end">
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="outline" className="gap-2 border-slate-300">
                            <SlidersHorizontal className="h-4 w-4" /> Filtros
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-[300px] sm:w-[400px]">
                        <div className="py-6">
                            <h2 className="text-xl font-bold mb-6">Filtros</h2>
                            <CategoryFilters 
                                brandColor={brandColor} 
                                availableTags={availableTags} // 👈 Pasamos los tags
                            />
                        </div>
                    </SheetContent>
                </Sheet>
            </div>

            {/* GRID */}
            {products.length > 0 ? (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 xl:gap-8 animate-in fade-in duration-500">
                    {products.map((product) => (
                        <ProductCard key={product.id} product={product as any} />
                    ))}
                    </div>

                    <Pagination 
                        totalPages={pagination.totalPages} 
                        currentPage={pagination.currentPage} 
                        brandColor={brandColor}
                    />
                </>
            ) : (
                <div className={`flex flex-col items-center justify-center py-24 text-center ${bgBrand} rounded-2xl border-2 border-dashed border-white shadow-inner`}>
                    <div className="bg-white p-5 rounded-full mb-4 shadow-sm">
                        {categoryName.toLowerCase().includes('globo') ? (
                            <PartyPopper className="h-12 w-12 text-slate-300" />
                        ) : (
                            <SearchX className="h-12 w-12 text-slate-300" />
                        )}
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">No encontramos resultados</h3>
                    <p className="text-slate-500 max-w-md px-6">
                        Intenta ajustar los filtros o revisa más tarde.
                    </p>
                    <Button 
                        onClick={() => window.location.href = window.location.pathname} 
                        variant="link" 
                        className="mt-4 text-slate-900 font-bold"
                    >
                        Ver todos los productos
                    </Button>
                </div>
            )}
        </div>
      </div>
    </div>
  );
}