import { Metadata } from 'next';
import { getNewArrivalsProducts } from '@/actions/products';
import { ProductCard } from '@/components/features/ProductCard';
import { CategoryFilters } from '@/components/features/CategoryFilters';
import { Pagination } from '@/components/ui/pagination';
import { SlidersHorizontal, SearchX } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Division } from '@prisma/client';

interface Props {
  searchParams: Promise<{ 
    sort?: string;
    min?: string;
    max?: string;
    page?: string;
    tag?: string;
    division?: string; 
  }>;
}

export const metadata: Metadata = {
  title: 'Recién Llegados | FiestasYa',
  description: 'Descubre lo último en juguetes y decoración.',
};

export default async function NewArrivalsPage({ searchParams }: Props) {
  const { sort, min, max, page, tag, division } = await searchParams;

  const currentPage = Number(page) || 1;
  const minPrice = min ? Number(min) : undefined;
  const maxPrice = max ? Number(max) : undefined;
  
  // Detección de tienda segura
  let activeDivision: Division = 'JUGUETERIA';
  if (division === 'FIESTAS' || division === 'DECORACION') {
     activeDivision = 'FIESTAS' as Division; 
  }

  const isToys = activeDivision === 'JUGUETERIA';

  // Colores
  const brandColor = isToys ? '#fc4b65' : '#ec4899';
  const bgBrand = isToys ? 'bg-rose-50' : 'bg-pink-50';
  const title = isToys ? 'Nuevos Juguetes' : 'Nueva Decoración';

  const data = await getNewArrivalsProducts({
    division: activeDivision,
    page: currentPage,
    take: 12,
    sort: sort || 'newest',
    minPrice,
    maxPrice,
    tag
  });

  if (!data) return <div className="py-20 text-center text-slate-500">No se pudieron cargar los productos.</div>;

  const { products, pagination, availableTags } = data;

  return (
    <div className="container mx-auto px-4 py-8 lg:py-12">
      
      {/* 1. CABECERA PRO (Sin íconos, tipografía limpia) */}
      <div className="mb-12 flex flex-col items-center text-center space-y-4">
        {/* Badge sutil de la tienda */}
        <span className="px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase bg-white border border-slate-200 text-slate-400">
            {isToys ? 'Festamas' : 'FiestasYa'}
        </span>
        
        {/* Título Principal - Limpio y Elegante */}
        <div className="relative">
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
              {title}
            </h1>
            {/* Pequeño acento de color debajo */}
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 h-1 w-12 rounded-full" style={{ backgroundColor: brandColor }}></div>
        </div>

        <p className="text-slate-500 max-w-lg text-base pt-2">
            Explora las últimas novedades que acaban de llegar a nuestra tienda.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
        
        {/* Sidebar Desktop */}
        <div className="hidden lg:block space-y-8">
            <div className="sticky top-24 p-6 bg-white rounded-xl border border-slate-100 shadow-sm">
                <CategoryFilters 
                    brandColor={brandColor} 
                    availableTags={availableTags}
                />
            </div>
        </div>

        {/* Contenido */}
        <div className="lg:col-span-3">
            
            {/* Filtros Móvil */}
            <div className="lg:hidden mb-6 flex justify-end">
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="outline" className="gap-2 border-slate-300 text-slate-700">
                            <SlidersHorizontal className="h-4 w-4" /> Filtros
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-[300px] sm:w-[400px]">
                        <div className="py-6">
                            <h2 className="text-xl font-bold mb-6 text-slate-900">Filtros</h2>
                            <CategoryFilters 
                                brandColor={brandColor} 
                                availableTags={availableTags} 
                            />
                        </div>
                    </SheetContent>
                </Sheet>
            </div>

            {/* Grid */}
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
                <div className={`flex flex-col items-center justify-center py-24 text-center ${bgBrand} rounded-2xl border-2 border-dashed border-white shadow-sm`}>
                    <div className="bg-white p-5 rounded-full mb-4 shadow-sm">
                        <SearchX className="h-10 w-10 text-slate-300" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">Sin resultados</h3>
                    <p className="text-slate-500 max-w-sm px-6 text-sm">
                        No encontramos productos nuevos con estos filtros. Intenta limpiar la búsqueda.
                    </p>
                    <Button 
                        onClick={() => window.location.href = `/new-arrivals?division=${activeDivision}`} 
                        variant="link" 
                        className="mt-2 text-slate-900 font-bold"
                    >
                        Ver todo
                    </Button>
                </div>
            )}
        </div>
      </div>
    </div>
  );
}