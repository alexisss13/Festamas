'use client';

import { Product } from '@prisma/client';
import { ProductCard } from './ProductCard';
import { useRef, useEffect, useState, memo, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';


interface Props {
  products: Product[];
  className?: string;
  autoPlay?: boolean;
}

export const ProductCarousel = memo(function ProductCarousel({ products, className, autoPlay = true }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [showArrows, setShowArrows] = useState(false);
  
  // Estados para la paginación (Puntitos)
  const [activeIndex, setActiveIndex] = useState(0);
  const [pageCount, setPageCount] = useState(0);

  const activeColor = "var(--primary)";

  // 🛡️ LÓGICA DE VISIBILIDAD DE FLECHAS Y PUNTOS
  const checkScroll = useCallback(() => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      
      const atStart = scrollLeft <= 5;
      const atEnd = Math.ceil(scrollLeft + clientWidth) >= scrollWidth - 5;

      setCanScrollLeft(!atStart);
      setCanScrollRight(!atEnd);
      setShowArrows(scrollWidth > clientWidth);
      
      const pages = clientWidth > 0 ? Math.ceil(scrollWidth / clientWidth) : 0;
      setPageCount(pages);

      // Sincronización precisa del puntito activo
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
    const carousel = scrollRef.current;
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
  }, [checkScroll, products]);

  const scrollToPage = useCallback((pageIndex: number) => {
    if (scrollRef.current) {
      const width = scrollRef.current.clientWidth;
      scrollRef.current.scrollTo({
        left: pageIndex * width,
        behavior: 'smooth'
      });
    }
  }, []);

  const scroll = useCallback((direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { current } = scrollRef;
      const scrollAmount = current.clientWidth; 
      
      current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  }, []);

  useEffect(() => {
    if (!autoPlay || !showArrows) return;

    const interval = setInterval(() => {
      if (!isHovered && scrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        
        if (Math.ceil(scrollLeft + clientWidth) >= scrollWidth - 10) {
            scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' }); 
        } else {
            scroll('right');
        }
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [isHovered, autoPlay, showArrows, scroll]);

  if (!products.length) return null;

  return (
    <div 
      className={cn("relative w-full group/carousel flex flex-col gap-2", className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative w-full">
          {/* --- FLECHAS DE NAVEGACIÓN APILADAS (Igual que Categorías) --- */}
          {showArrows && (
            <div className="hidden md:flex flex-col absolute -right-2 md:-right-4 top-1/2 -translate-y-1/2 z-30 gap-2">
                <Button 
                    variant="ghost" 
                    size="icon" 
                    disabled={!canScrollLeft}
                    className={cn(
                        "h-10 w-10 rounded-full shadow-xl border-0 transition-all duration-300 flex items-center justify-center",
                        canScrollLeft 
                          ? "!bg-slate-700 !text-white hover:!bg-slate-800 hover:scale-110" 
                          : "!bg-slate-200 !text-slate-400 cursor-not-allowed shadow-none"
                    )}
                    onClick={() => scroll('left')}
                >
                    <ChevronLeft className="h-6 w-6" strokeWidth={3} />
                </Button>
              
                <Button 
                    variant="ghost" 
                    size="icon" 
                    disabled={!canScrollRight}
                    className={cn(
                        "h-10 w-10 rounded-full shadow-xl border-0 transition-all duration-300 flex items-center justify-center",
                        canScrollRight 
                          ? "!bg-slate-700 !text-white hover:!bg-slate-800 hover:scale-110" 
                          : "!bg-slate-200 !text-slate-400 cursor-not-allowed shadow-none"
                    )}
                    onClick={() => scroll('right')}
                >
                    <ChevronRight className="h-6 w-6" strokeWidth={3} />
                </Button>
            </div>
          )}

          {/* --- CONTENEDOR SCROLL --- */}
          <div 
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto pb-4 px-1 scroll-smooth snap-x snap-mandatory scrollbar-hide"
            style={{ 
                scrollbarWidth: 'none', 
                msOverflowStyle: 'none',
            }}
          >
            {products.map((product) => (
              <div 
                key={product.id} 
                className={cn(
                  "snap-start flex-shrink-0",
                  "w-[calc(50%-8px)]",                  // Móvil: 2 exactos
                  "sm:w-[calc(33.333%-10.6px)]",        // Tablet mini: 3 exactos
                  "md:w-[calc(25%-12px)]",              // Tablet: 4 exactos
                  "lg:w-[calc(20%-12.8px)]"             // Laptop/PC: 5 exactos (Máximo)
                )}
              >
                <ProductCard product={product as any} />
              </div>
            ))}
          </div>
      </div>

      {/* --- PAGINACIÓN POR PUNTOS --- */}
      {pageCount > 1 && (
        <div className="flex justify-center items-center gap-2 md:gap-3 mt-1 md:mt-2">
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
  );
});