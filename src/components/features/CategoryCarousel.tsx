'use client';

import Link from 'next/link';
import Image from 'next/image';
import cloudinaryLoader from '@/lib/cloudinaryLoader';
import { Category } from '@prisma/client';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useRef, useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { useUIStore } from '@/store/ui'; 

interface Props {
  categories: Category[];
}

/**
 * CategoryCarousel: 
 * Componente de carrusel para categorías con navegación refinada.
 * - FIX: Se solucionó la desincronización de los indicadores (puntos) en resoluciones PC.
 */
export function CategoryCarousel({ categories }: Props) {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const activeColor = "var(--primary)";

  const checkScroll = useCallback(() => {
    if (carouselRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
      
      const atStart = scrollLeft <= 5;
      // Añadimos Math.ceil para evitar problemas con subpíxeles en pantallas con zoom
      const atEnd = Math.ceil(scrollLeft + clientWidth) >= scrollWidth - 5;

      setCanScrollLeft(!atStart);
      setCanScrollRight(!atEnd);
      
      const pages = clientWidth > 0 ? Math.ceil(scrollWidth / clientWidth) : 0;
      setPageCount(pages);

      // FIX: Lógica robusta para el index activo en PC.
      // Si llegamos al final, forzamos la última página para que el punto cambie correctamente.
      if (atEnd && pages > 0) {
        setActiveIndex(pages - 1);
      } else if (clientWidth > 0) {
        setActiveIndex(Math.round(scrollLeft / clientWidth));
      } else {
        setActiveIndex(0);
      }
    }
  }, []);

  useEffect(() => {
    const carousel = carouselRef.current;
    if (carousel) {
      carousel.addEventListener('scroll', checkScroll);
      const timeout = setTimeout(checkScroll, 100);
      window.addEventListener('resize', checkScroll);
      return () => {
        carousel.removeEventListener('scroll', checkScroll);
        window.removeEventListener('resize', checkScroll);
        clearTimeout(timeout);
      };
    }
  }, [checkScroll]);

  const scrollToPage = (pageIndex: number) => {
    if (carouselRef.current) {
      const width = carouselRef.current.clientWidth;
      carouselRef.current.scrollTo({
        left: pageIndex * width,
        behavior: 'smooth'
      });
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const { current } = carouselRef;
      // Alineamos el scrollAmount al 100% del contenedor para que encaje perfecto con los puntos
      const scrollAmount = current.clientWidth; 
      current.scrollBy({ 
        left: direction === 'left' ? -scrollAmount : scrollAmount, 
        behavior: 'smooth' 
      });
    }
  };

  if (!categories.length) return null;

  return (
    <section className="space-y-4 md:space-y-6 py-4 md:py-6 relative">
      <div className="flex items-center justify-between px-1">
        <h2 className="font-medium text-[16px] md:text-[24px] leading-tight text-[#333] tracking-tight">
          Compra por categorías
        </h2>
      </div>

      <div className="relative group">
        
        {/* FLECHAS DE NAVEGACIÓN (Desktop) */}
        <div className="hidden md:flex flex-col absolute -right-1 top-16 z-30 gap-2">
            <Button
              variant="ghost"
              size="icon"
              disabled={!canScrollLeft}
              onClick={() => scroll('left')}
              className={cn(
                "h-10 w-10 rounded-full shadow-xl border-0 transition-all duration-300 flex items-center justify-center",
                canScrollLeft 
                  ? "!bg-slate-700 !text-white hover:!bg-slate-800 hover:scale-110" 
                  : "!bg-slate-200 !text-slate-400 cursor-not-allowed shadow-none"
              )}
            >
              <ChevronLeft className="h-6 w-6" strokeWidth={3} />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              disabled={!canScrollRight}
              onClick={() => scroll('right')}
              className={cn(
                "h-10 w-10 rounded-full border-0 transition-all duration-300 shadow-xl flex items-center justify-center",
                canScrollRight 
                  ? "!bg-slate-700 !text-white hover:!bg-slate-800 hover:scale-110" 
                  : "!bg-slate-200 !text-slate-400 cursor-not-allowed shadow-none"
              )}
            >
              <ChevronRight className="h-6 w-6" strokeWidth={3} />
            </Button>
        </div>

        {/* CONTENEDOR DEL CARRUSEL */}
        <div 
          ref={carouselRef}
          className={cn(
            "grid grid-rows-2 grid-flow-col auto-cols-max gap-x-4 gap-y-6",
            "md:flex md:flex-row md:gap-4",
            "overflow-x-auto snap-x snap-mandatory pb-4 scrollbar-hide scroll-smooth px-1"
          )}
        >
          {categories.map((category, idx) => (
            <Link
              key={category.id}
              href={`/category/${category.slug}`}
              className={cn(
                "group/item flex flex-col items-center gap-2 md:gap-3 snap-start shrink-0 cursor-pointer",
                "w-[85px] md:w-[140px]"
              )}
              onMouseEnter={() => setHoveredIndex(idx)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <div className={cn(
                "relative overflow-hidden rounded-full bg-slate-100",
                "w-[80px] h-[80px] md:w-[140px] md:h-[140px]"
              )}>
                {category.image ? (
                  <Image
                    loader={cloudinaryLoader}
                    src={category.image.startsWith('http') || category.image.startsWith('/') ? category.image : `/${category.image}`}
                    alt={category.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover/item:scale-110"
                    sizes="(max-width: 768px) 80px, 140px"
                    priority={idx < 8}
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xl md:text-3xl font-bold text-slate-300">{category.name[0]}</span>
                  </div>
                )}
              </div>
              
              <span 
                className={cn(
                  "font-normal text-slate-700 text-center line-clamp-2 transition-all duration-300 px-1 leading-snug",
                  "text-[12px] md:text-[16px]"
                )}
                style={hoveredIndex === idx ? { color: activeColor } : {}}
              >
                {category.name}
              </span>
            </Link>
          ))}
        </div>

        {/* PAGINACIÓN POR PUNTOS */}
        {pageCount > 1 && (
          <div className="flex justify-center items-center gap-2 md:gap-3 mt-2 md:mt-4">
            {Array.from({ length: pageCount }).map((_, i) => (
              <button
                key={i}
                onClick={() => scrollToPage(i)}
                style={activeIndex === i ? { backgroundColor: activeColor } : {}}
                className={cn(
                  "rounded-full transition-all duration-300",
                  "h-2 w-2 md:h-3 md:w-3",
                  activeIndex === i 
                    ? "shadow-md scale-125 z-10" 
                    : "bg-zinc-300 hover:bg-zinc-400"
                )}
                aria-label={`Ir a página ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}