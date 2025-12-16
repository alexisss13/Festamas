import Link from 'next/link';
import Image from 'next/image';
import { Category } from '@prisma/client';
import { cn } from '@/lib/utils';
import { ArrowRight } from 'lucide-react';

interface Props {
  categories: Category[];
}

export function CategoryBento({ categories }: Props) {
  if (!categories.length) return null;

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Compra por Categoría</h2>
        <Link href="/search" className="text-sm font-medium text-slate-600 hover:text-slate-900 flex items-center gap-1">
          Ver todas <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 auto-rows-[200px]">
        {categories.map((category, i) => {
          // El primero ocupa 2x2 en desktop, los demás 1x1
          const isLarge = i === 0;
          
          return (
            <Link
              key={category.id}
              href={`/category/${category.slug}`}
              className={cn(
                "group relative overflow-hidden rounded-2xl bg-slate-100",
                isLarge ? "md:col-span-2 md:row-span-2 min-h-[400px]" : "md:col-span-1 md:row-span-1"
              )}
            >
              {/* Imagen de Fondo */}
              {category.image ? (
                <Image
                  src={category.image}
                  alt={category.name}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes={isLarge ? "(max-width: 768px) 100vw, 50vw" : "(max-width: 768px) 50vw, 25vw"}
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                    <span className="text-slate-300 font-bold text-4xl opacity-20">{category.name[0]}</span>
                </div>
              )}

              {/* Overlay Gradiente (Para leer el texto) */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-transparent opacity-60 group-hover:opacity-70 transition-opacity" />

              {/* Texto */}
              <div className="absolute bottom-0 left-0 p-6">
                <h3 className={cn(
                  "font-bold text-white mb-1",
                  isLarge ? "text-3xl" : "text-lg"
                )}>
                  {category.name}
                </h3>
                <span className="inline-flex items-center text-white/80 text-xs font-medium group-hover:text-white transition-colors">
                  Explorar <ArrowRight className="ml-1 w-3 h-3" />
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}