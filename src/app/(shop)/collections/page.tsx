import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Layers, ArrowRight } from 'lucide-react';
import { getActiveCollections } from '@/actions/collections';
import { getEcommerceContextFromCookie } from '@/lib/ecommerce-context';
import { inferLegacyDivision } from '@/lib/ecommerce-helpers';

export const metadata: Metadata = {
  title: 'Colecciones | FiestasYa',
  description: 'Explora nuestras colecciones temáticas de productos.',
};

export default async function CollectionsPage() {
  const { activeBranch } = await getEcommerceContextFromCookie();
  const activeDivision = inferLegacyDivision(activeBranch.ecommerceCode);
  const isToys = activeDivision === 'JUGUETERIA';
  const brandColor = isToys ? '#fc4b65' : '#ec4899';

  const collections = await getActiveCollections();

  return (
    <div className="container mx-auto px-4 py-8 lg:py-12">

      {/* Header */}
      <div className="mb-12 flex flex-col items-center text-center space-y-4">
        <span className="px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase bg-white border border-slate-200 text-slate-400">
          {isToys ? 'Festamas' : 'FiestasYa'} • Colecciones
        </span>
        <div className="relative">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight flex items-center justify-center gap-3">
            <Layers className={`h-8 w-8 ${isToys ? 'text-rose-200' : 'text-pink-200'}`} />
            Nuestras Colecciones
          </h1>
          <div
            className="absolute -bottom-3 left-1/2 -translate-x-1/2 h-1 w-16 rounded-full"
            style={{ backgroundColor: brandColor }}
          />
        </div>
        <p className="text-slate-500 max-w-lg text-base pt-2">
          Selecciones especiales de productos organizadas por tema o temporada.
        </p>
      </div>

      {collections.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
          <Layers className="h-12 w-12 text-slate-200 mb-4" />
          <h3 className="text-lg font-bold text-slate-900 mb-2">Sin colecciones activas</h3>
          <p className="text-slate-500 max-w-sm px-6 text-sm">
            Próximamente publicaremos colecciones temáticas de productos.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 xl:gap-8">
          {collections.map(col => (
            <Link
              key={col.id}
              href={`/collections/${col.slug}`}
              className="group relative overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm hover:shadow-lg transition-all duration-300"
            >
              {/* Cover image */}
              <div className="relative aspect-[4/3] overflow-hidden bg-slate-50">
                {col.coverImage ? (
                  <Image
                    src={col.coverImage}
                    alt={col.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                ) : (
                  <div
                    className="w-full h-full flex items-center justify-center"
                    style={{ background: `linear-gradient(135deg, ${brandColor}22, ${brandColor}44)` }}
                  >
                    <Layers className="h-16 w-16 opacity-30" style={{ color: brandColor }} />
                  </div>
                )}
                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              </div>

              {/* Text */}
              <div className="p-5">
                <h2 className="font-semibold text-[16px] md:text-[18px] text-slate-900 group-hover:text-slate-700 transition-colors leading-tight mb-1.5">
                  {col.name}
                </h2>
                {col.description && (
                  <p className="text-[13px] text-slate-500 leading-snug line-clamp-2 mb-4">
                    {col.description}
                  </p>
                )}
                <span
                  className="inline-flex items-center gap-1.5 text-[13px] font-semibold transition-all group-hover:gap-2.5"
                  style={{ color: brandColor }}
                >
                  Ver colección <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
