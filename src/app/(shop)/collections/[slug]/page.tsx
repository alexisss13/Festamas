import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Layers, SearchX, SlidersHorizontal } from 'lucide-react';
import Link from 'next/link';
import { getCollectionBySlug } from '@/actions/collections';
import { getNewArrivalsProducts } from '@/actions/products';
import { ProductCard } from '@/components/features/ProductCard';
import { CategoryFilters } from '@/components/features/CategoryFilters';
import { Pagination } from '@/components/ui/pagination';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { getEcommerceContextFromCookie } from '@/lib/ecommerce-context';
import { inferLegacyDivision } from '@/lib/ecommerce-helpers';

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    sort?: string;
    min?: string;
    max?: string;
    page?: string;
  }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const collection = await getCollectionBySlug(slug);
  if (!collection) return { title: 'Colección no encontrada' };

  return {
    title: `${collection.name} | FiestasYa`,
    description: collection.description ?? `Explora los productos de la colección ${collection.name}.`,
  };
}

export default async function CollectionSlugPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { sort, min, max, page } = await searchParams;

  const [collection, { activeBranch }] = await Promise.all([
    getCollectionBySlug(slug),
    getEcommerceContextFromCookie(),
  ]);

  if (!collection) notFound();

  const activeDivision = inferLegacyDivision(activeBranch.ecommerceCode);
  const isToys = activeDivision === 'JUGUETERIA';
  const brandColor = isToys ? '#fc4b65' : '#ec4899';
  const bgBrand = isToys ? 'bg-rose-50' : 'bg-pink-50';

  const currentPage = Number(page) || 1;
  const minPrice = min ? Number(min) : undefined;
  const maxPrice = max ? Number(max) : undefined;

  const data = await getNewArrivalsProducts({
    division: activeDivision,
    page: currentPage,
    take: 12,
    sort: sort || 'newest',
    minPrice,
    maxPrice,
    tag: collection.groupTag,
  });

  if (!data) return <div className="py-20 text-center text-slate-500">No se pudieron cargar los productos.</div>;

  const { products, pagination, availableTags } = data;

  return (
    <div className="container mx-auto px-4 py-8 lg:py-12">

      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-slate-400 mb-8">
        <Link href="/" className="hover:text-slate-600 transition-colors">Inicio</Link>
        <span>/</span>
        <Link href="/collections" className="hover:text-slate-600 transition-colors">Colecciones</Link>
        <span>/</span>
        <span className="text-slate-700 font-medium">{collection.name}</span>
      </nav>

      {/* Header */}
      <div className="mb-12 flex flex-col items-center text-center space-y-4">
        <span className="px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase bg-white border border-slate-200 text-slate-400">
          {isToys ? 'Festamas' : 'FiestasYa'} • Colección
        </span>
        <div className="relative">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight flex items-center justify-center gap-3">
            <Layers className={`h-8 w-8 ${isToys ? 'text-rose-200' : 'text-pink-200'}`} />
            {collection.name}
          </h1>
          <div
            className="absolute -bottom-3 left-1/2 -translate-x-1/2 h-1 w-16 rounded-full"
            style={{ backgroundColor: brandColor }}
          />
        </div>
        {collection.description && (
          <p className="text-slate-500 max-w-lg text-base pt-2">{collection.description}</p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">

        {/* Sidebar Desktop */}
        <div className="hidden lg:block space-y-8">
          <div className="sticky top-24 p-6 bg-white rounded-xl border border-slate-100 shadow-sm">
            <CategoryFilters brandColor={brandColor} availableTags={availableTags} />
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">

          {/* Mobile filters */}
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
                  <SheetTitle className="text-[18px] font-medium mb-6 text-slate-900">Filtros</SheetTitle>
                  <CategoryFilters brandColor={brandColor} availableTags={availableTags} />
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Grid */}
          {products.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 xl:gap-8 animate-in fade-in duration-500">
                {products.map(product => (
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
              <h3 className="text-lg font-bold text-slate-900 mb-2">Sin productos en esta colección</h3>
              <p className="text-slate-500 max-w-sm px-6 text-sm">
                No hay productos disponibles en esta colección con los filtros seleccionados.
              </p>
              <Link
                href="/collections"
                className="mt-4 text-sm font-bold text-slate-900 hover:underline"
              >
                Ver todas las colecciones
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
