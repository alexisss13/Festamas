import { redirect } from 'next/navigation';
import { getProducts } from '@/actions/products';
import { ProductCard } from '@/components/features/ProductCard';
import { CategoryFilters } from '@/components/features/CategoryFilters';
import { CategoryHeader } from '@/components/features/CategoryHeader';
import { CategorySort } from '@/components/features/CategorySort';
import { ClearFiltersButton } from '@/components/features/ClearFiltersButton';
import { Pagination } from '@/components/ui/pagination';
import { SearchX, SlidersHorizontal } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { getEcommerceContextFromCookie } from '@/lib/ecommerce-context';

interface Props {
  searchParams: Promise<{
    q?: string;
    sort?: string;
    min?: string;
    max?: string;
    page?: string;
    tag?: string;
    discount?: string;
    stock?: string;
  }>;
}

export const metadata = {
  title: 'Resultados de búsqueda | FiestasYa',
  description: 'Encuentra los mejores artículos para tu fiesta.',
};

export default async function SearchPage({ searchParams }: Props) {
  const { q, sort, min, max, page, tag } = await searchParams;
  const discount = (await searchParams).discount === 'true';
  const stock = (await searchParams).stock === 'true';
  
  const query = q || '';

  // Si no hay búsqueda, redirigir al home
  if (!query) {
    redirect('/');
  }

  const { activeBranch } = await getEcommerceContextFromCookie();
  const brandColor = (activeBranch.brandColors as any)?.primary ?? '#fc4b65';

  const currentPage = Number(page) || 1;
  const minPrice = min ? Number(min) : undefined;
  const maxPrice = max ? Number(max) : undefined;

  const { data: products, pagination, availableTags } = await getProducts({ 
    query,
    sort: sort || 'newest',
    minPrice,
    maxPrice,
    tag,
    discount,
    stock,
    page: currentPage,
    take: 12
  });

  const hasFilters = !!(minPrice || maxPrice || tag || sort !== 'newest' || discount || stock);

  return (
    <div className="min-h-screen bg-white">
      
      {/* BREADCRUMB Y TÍTULO */}
      <div className="border-b border-slate-200 bg-slate-50/50">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 py-4 md:py-6">
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-3">
            <span>Inicio</span>
            <span>/</span>
            <span className="text-slate-900 font-medium">Búsqueda</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
            Resultados para &quot;{query}&quot;
          </h1>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          
          {/* SIDEBAR IZQUIERDO - FILTROS */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-24">
              {/* Título de Filtros */}
              <CategoryHeader 
                categoryName="Búsqueda"
                hasFilters={hasFilters}
                currentPath={`/search?q=${encodeURIComponent(query)}`}
              />

              {/* Componente de Filtros */}
              <div className="space-y-6 pb-6">
                <CategoryFilters 
                  brandColor={brandColor} 
                  availableTags={availableTags || []}
                />
              </div>
            </div>
          </aside>

          {/* CONTENIDO PRINCIPAL DERECHO */}
          <main className="flex-1 min-w-0">
            
            {/* BARRA SUPERIOR - Ordenar y Resultados */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200">
              
              {/* Contador de resultados */}
              <div className="flex items-center gap-3 md:gap-4">
                {products && products.length > 0 && (
                  <p className="text-[13px] md:text-[14px] text-slate-600">
                    <span className="font-semibold text-slate-900">{pagination?.totalItems || products.length}</span> {(pagination?.totalItems || products.length) === 1 ? 'producto encontrado' : 'productos encontrados'}
                  </p>
                )}
                
                {/* Botón de filtros móvil */}
                <Sheet>
                  <SheetTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="lg:hidden gap-2 border-slate-200 bg-white hover:bg-slate-50 text-[13px] h-9 rounded-lg"
                    >
                      <SlidersHorizontal className="h-4 w-4" /> 
                      Filtros
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-[300px] sm:w-[350px] overflow-y-auto p-0">
                    <div className="px-6 py-6">
                      <SheetTitle className="text-[18px] font-medium mb-6 text-slate-900">
                        Filtros
                      </SheetTitle>
                      <CategoryFilters 
                        brandColor={brandColor} 
                        availableTags={availableTags || []}
                      />
                    </div>
                  </SheetContent>
                </Sheet>
              </div>

              {/* Selector de ordenamiento */}
              <CategorySort brandColor={brandColor} />
            </div>

            {/* GRID DE PRODUCTOS */}
            {products && products.length > 0 ? (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4 lg:gap-5 mb-8">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product as any} />
                  ))}
                </div>

                {/* PAGINACIÓN */}
                {pagination && pagination.totalPages > 1 && (
                  <div className="mt-8 pt-6 border-t border-slate-200">
                    <Pagination 
                      totalPages={pagination.totalPages} 
                      currentPage={pagination.currentPage} 
                      brandColor={brandColor}
                    />
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 md:py-32 text-center bg-slate-50 rounded-2xl border border-slate-200">
                <div className="bg-white p-6 rounded-full mb-6 shadow-sm">
                  <SearchX className="h-14 w-14 text-slate-400" />
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-slate-900 mb-3">
                  No encontramos productos
                </h3>
                <p className="text-slate-600 max-w-md px-6 mb-6">
                  Intenta con otras palabras clave o ajusta los filtros. 
                  Prueba buscando &quot;globos&quot;, &quot;velas&quot; o &quot;decoración&quot;.
                </p>
                <ClearFiltersButton currentPath={`/search?q=${encodeURIComponent(query)}`} />
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}