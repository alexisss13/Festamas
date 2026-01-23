import Link from 'next/link';
import Image from 'next/image';
import { Category } from '@prisma/client';
import { cn } from '@/lib/utils';
import { ArrowRight } from 'lucide-react';

interface Props {
  categories: Category[];
}

export function CategoryCarousel({ categories }: Props) {
  if (!categories.length) return null;

  return (
    <section className="space-y-4 py-4">
      {/* Cabecera (Opcional, igual que antes) */}
      <div className="flex items-center justify-between px-1">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
          Compra por Categoría
        </h2>
        <Link 
          href="/search" 
          className="text-sm font-medium text-slate-600 hover:text-slate-900 flex items-center gap-1 transition-colors"
        >
          Ver todas <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* CAROUSEL NATIVO (Scroll Snap)
         - snap-x snap-mandatory: Hace que se detenga centrado en cada elemento.
         - overflow-x-auto: Permite scroll horizontal.
         - no-scrollbar: (Opcional) visualmente más limpio.
      */}
      <div className="flex gap-6 overflow-x-auto snap-x snap-mandatory pb-6 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide">
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/category/${category.slug}`}
            className="group flex flex-col items-center gap-3 snap-center shrink-0 cursor-pointer"
          >
            {/* Círculo de Imagen */}
            <div className={cn(
              "relative overflow-hidden rounded-full bg-slate-100 shadow-sm",
              "border-2 border-transparent group-hover:border-primary/50 transition-all duration-300",
              // Tamaño exacto solicitado: 144.5px
              "w-[144.5px] h-[144.5px]"
            )}>
              {category.image ? (
                <Image
                  src={category.image}
                  alt={category.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                  sizes="(max-width: 768px) 150px, 150px"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-100 text-slate-300">
                  <span className="text-4xl font-bold opacity-30">
                    {category.name[0]}
                  </span>
                </div>
              )}
            </div>

            {/* Nombre de Categoría */}
            <span className="text-sm font-medium text-slate-700 text-center max-w-[145px] leading-tight group-hover:text-primary transition-colors">
              {category.name}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}