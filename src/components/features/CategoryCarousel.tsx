'use client';

import Link from 'next/link';
import Image from 'next/image';
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
 * - Flechas: 40x40px, apiladas verticalmente, FLOTANDO encima del carrusel.
 * - Posicionamiento: Absoluto sobre el margen derecho.
 * - Estilo: Slate-700, strokeWidth: 3.
 */
export function CategoryCarousel({ categories }: Props) {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const currentDivision = useUIStore((state) => state.currentDivision);
  const isToys = currentDivision === 'JUGUETERIA';

  // 🎨 COLORES DE MARCA
  const colorFestamas = "#fc4b65";
  const colorFiestasYa = "#fb3099";
  const activeColor = isToys ? colorFestamas : colorFiestasYa;

  if (!categories.length) return null;

  const checkScroll = useCallback(() => {
    if (carouselRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 5);
      
      const pages = clientWidth > 0 ? Math.ceil(scrollWidth / clientWidth) : 0;
      setPageCount(pages);

      const index = clientWidth > 0 ? Math.round(scrollLeft / clientWidth) : 0;
      setActiveIndex(index);
    }
  }, []);

  useEffect(() => {
    const carousel = carouselRef.current;
    if (carousel) {
      carousel.addEventListener('scroll', checkScroll);
      setTimeout(checkScroll, 100);
      window.addEventListener('resize', checkScroll);
    }
    return () => {
      if (carousel) carousel.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
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
      const scrollAmount = current.clientWidth * 0.8; 
      current.scrollBy({ 
        left: direction === 'left' ? -scrollAmount : scrollAmount, 
        behavior: 'smooth' 
      });
    }
  };

  return (
    <section className="space-y-6 py-6 relative">
      <div className="flex items-center justify-between px-1">
        <h2 className="font-medium text-[24px] leading-tight text-[#333] tracking-tight">
          Compra por categorías
        </h2>
      </div>

      <div className="relative group">
        
        {/* 🔥 FLECHAS FLOTANTES ENCIMA (z-30 y posicionamiento ajustado) 🔥 */}
        <div className="hidden md:flex flex-col absolute -right-1 top-16 z-30 gap-2">
            
            {/* Botón Izquierda */}
            <Button
              variant="ghost"
              size="icon"
              disabled={!canScrollLeft}
              onClick={() => scroll('left')}
              className={cn(
                "h-10 w-10 rounded-full shadow-xl border-0 transition-all duration-300 flex items-center justify-center",
                "!bg-slate-700 !text-white hover:!bg-slate-800 hover:scale-110",
                !canScrollLeft ? "opacity-0 pointer-events-none" : "opacity-100"
              )}
            >
              <ChevronLeft className="h-6 w-6" strokeWidth={3} />
            </Button>

            {/* Botón Derecha */}
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

        {/* CARRUSEL */}
        <div 
          ref={carouselRef}
          className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 scrollbar-hide scroll-smooth px-1" 
        >
          {categories.map((category, idx) => (
            <Link
              key={category.id}
              href={`/category/${category.slug}`}
              className="group/item flex flex-col items-center gap-3 snap-start shrink-0 cursor-pointer w-[140px]"
              onMouseEnter={() => setHoveredIndex(idx)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <div className="relative overflow-hidden rounded-full bg-slate-100 w-[140px] h-[140px]">
                {category.image ? (
                  <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover/item:scale-110"
                    sizes="140px"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-3xl font-bold text-slate-300">{category.name[0]}</span>
                  </div>
                )}
              </div>
              
              <span 
                className="text-[16px] font-normal text-slate-700 text-center line-clamp-2 transition-all duration-300 px-1 leading-snug"
                style={hoveredIndex === idx ? { color: activeColor } : {}}
              >
                {category.name}
              </span>
            </Link>
          ))}
        </div>

        {/* PAGINACIÓN */}
        {pageCount > 1 && (
          <div className="flex justify-center items-center gap-3 mt-4">
            {Array.from({ length: pageCount }).map((_, i) => (
              <button
                key={i}
                onClick={() => scrollToPage(i)}
                style={activeIndex === i ? { backgroundColor: activeColor } : {}}
                className={cn(
                  "rounded-full transition-all duration-300 h-3 w-3",
                  activeIndex === i ? "shadow-md scale-125" : "bg-slate-200"
                )}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}