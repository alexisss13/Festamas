import { Metadata } from 'next';
import { getNewArrivalsProducts } from '@/actions/products'; // Reusamos la lógica potente
import { ProductCard } from '@/components/features/ProductCard';
import { CategoryFilters } from '@/components/features/CategoryFilters';
import { Pagination } from '@/components/ui/pagination';
import { SlidersHorizontal, SearchX, Layers } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { getEcommerceContextFromCookie } from '@/lib/ecommerce-context';
import { inferLegacyDivision } from '@/lib/ecommerce-helpers';

interface Props {
  searchParams: Promise<{ 
    sort?: string;
    min?: string;
    max?: string;
    page?: string;
    tag?: string;
  }>;
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { tag } = await searchParams;
  const title = tag ? `Colección ${tag.charAt(0).toUpperCase() + tag.slice(1)}` : 'Colecciones';
  return {
    title: `${title} | FiestasYa`,
    description: `Explora los mejores productos de ${tag || 'nuestra tienda'}.`,
  };
}

export default async function CollectionsPage({ searchParams }: Props) {
  const { sort, min, max, page, tag } = await searchParams;
  const { activeBranch } = await getEcommerceContextFromCookie();

  const currentPage = Number(page) || 1;
  const minPrice = min ? Number(min) : undefined;
  const maxPrice = max ? Number(max) : undefined;
  
  const activeDivision = inferLegacyDivision(activeBranch.ecommerceCode);

  const isToys = activeDivision === 'JUGUETERIA';
  const brandColor = isToys ? '#fc4b65' : '#ec4899';
  const bgBrand = isToys ? 'bg-rose-50' : 'bg-pink-50';
  
  // Título visual (Capitalizado)
  const collectionTitle = tag 
    ? tag.charAt(0).toUpperCase() + tag.slice(1) 
    : 'Catálogo Completo';

  const data = await getNewArrivalsProducts({
    division: activeDivision,
    page: currentPage,
    take: 12,
    sort: sort || 'newest',
    minPrice,
    maxPrice,
    tag // 👈 Filtramos por el tag de la colección
  });

  if (!data) return <div className="py-20 text-center text-slate-500">No se pudieron cargar los productos.</div>;

  const { products, pagination, availableTags } = data;

  return (
    <div className="container mx-auto px-4 py-8 lg:py-12">
      
      {/* 1. CABECERA */}
      <div className="mb-12 flex flex-col items-center text-center space-y-4">
        <span className="px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase bg-white border border-slate-200 text-slate-400">
            {isToys ? 'Festamas' : 'FiestasYa'} • Colección
        </span>
        
        <div className="relative">
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight flex items-center justify-center gap-3">
              {/* Icono sutil decorativo */}
              <Layers className={`h-8 w-8 ${isToys ? 'text-rose-200' : 'text-pink-200'}`} />
              {collectionTitle}
            </h1>
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 h-1 w-16 rounded-full" style={{ backgroundColor: brandColor }}></div>
        </div>

        <p className="text-slate-500 max-w-lg text-base pt-2">
            Explora esta selección especial de productos que hemos preparado para ti.
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
                        <Button 
                          variant="outline" 
                          className="gap-2 border-slate-200 text-slate-700 text-[13px] h-9 rounded-lg hover:bg-slate-50"
                        >
                            <SlidersHorizontal className="h-4 w-4" /> Filtros
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-[300px] sm:w-[350px] overflow-y-auto p-0">
                        <div className="px-6 py-6">
                            <SheetTitle className="text-[18px] font-medium mb-6 text-slate-900">
                              Filtros
                            </SheetTitle>
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
                    <h3 className="text-lg font-bold text-slate-900 mb-2">Colección vacía</h3>
                    <p className="text-slate-500 max-w-sm px-6 text-sm">
                        No encontramos productos con estos filtros en esta colección.
                    </p>
                    <Button 
                        onClick={() => window.location.href = '/new-arrivals'} 
                        variant="link" 
                        className="mt-2 text-slate-900 font-bold"
                    >
                        Ver todo el catálogo
                    </Button>
                </div>
            )}
        </div>
      </div>
    </div>
  );
}
