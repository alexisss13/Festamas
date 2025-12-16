'use client';

import { Product } from '@prisma/client';
import { ProductCard } from './ProductCard';
import { useRef, useEffect, useState, memo } from 'react';
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

  // 🛡️ LÓGICA DE VISIBILIDAD DE FLECHAS (PRECISIÓN MILIMÉTRICA)
  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      
      // Solo mostramos la flecha IZQUIERDA si nos hemos movido más de 10px (evita falsos positivos)
      setCanScrollLeft(Math.ceil(scrollLeft) > 10);
      
      // Solo mostramos la flecha DERECHA si queda contenido real por ver (tolerancia 5px)
      setCanScrollRight(Math.ceil(scrollLeft) < scrollWidth - clientWidth - 5);
      
      // Si todo el contenido cabe en la pantalla, apagamos el sistema de flechas
      setShowArrows(scrollWidth > clientWidth);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [products]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { current } = scrollRef;
      // Scroll de un bloque lógico (80% del ancho visible)
      const scrollAmount = current.clientWidth * 0.8; 
      
      const targetScroll = direction === 'left' 
        ? current.scrollLeft - scrollAmount 
        : current.scrollLeft + scrollAmount;

      current.scrollTo({
        left: targetScroll,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    if (!autoPlay || !showArrows) return;

    const interval = setInterval(() => {
      if (!isHovered && scrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        
        // Si llegamos al final, volver al inicio INSTANTÁNEAMENTE (reset invisible)
        if (scrollLeft + clientWidth >= scrollWidth - 10) {
            scrollRef.current.scrollTo({ left: 0, behavior: 'auto' }); 
        } else {
            scroll('right');
        }
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [isHovered, autoPlay, showArrows]);

  if (!products.length) return null;

  return (
    <div 
      className={cn("relative w-full group/carousel", className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      
      {/* --- FLECHAS DE NAVEGACIÓN --- */}
      {showArrows && (
        <>
          {/* FLECHA IZQUIERDA: Se oculta si estamos al inicio (canScrollLeft) */}
          <div className={cn(
                "absolute top-1/2 -left-3 md:-left-5 -translate-y-1/2 z-30 hidden md:block transition-all duration-300",
                canScrollLeft ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4 pointer-events-none"
            )}>
            <Button 
                variant="outline" 
                size="icon" 
                className="h-10 w-10 rounded-full shadow-lg bg-white/90 backdrop-blur-sm border-slate-200 text-slate-700 hover:bg-white hover:scale-110 transition-all"
                onClick={() => scroll('left')}
            >
                <ChevronLeft className="h-6 w-6" />
            </Button>
          </div>
          
          {/* FLECHA DERECHA */}
          <div className={cn(
                "absolute top-1/2 -right-3 md:-right-5 -translate-y-1/2 z-30 hidden md:block transition-all duration-300",
                canScrollRight ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4 pointer-events-none"
            )}>
            <Button 
                variant="outline" 
                size="icon" 
                className="h-10 w-10 rounded-full shadow-lg bg-white/90 backdrop-blur-sm border-slate-200 text-slate-700 hover:bg-white hover:scale-110 transition-all"
                onClick={() => scroll('right')}
            >
                <ChevronRight className="h-6 w-6" />
            </Button>
          </div>
        </>
      )}

      {/* --- CONTENEDOR SCROLL --- */}
      <div 
        ref={scrollRef}
        onScroll={checkScroll}
        className="flex gap-4 overflow-x-auto pb-4 px-1 scroll-smooth snap-x snap-mandatory scrollbar-hide"
        style={{ 
            scrollbarWidth: 'none', 
            msOverflowStyle: 'none',
            maxWidth: '100vw' 
        }}
      >
        {products.map((product) => (
          <div 
            key={product.id} 
            // 📐 FIX TAMAÑO: Usamos 'w-' (ancho fijo) en vez de 'min-w-'
            // Esto obliga a la imagen a respetar el carril y no desbordarse ni cortar la siguiente tarjeta.
            className="snap-start flex-shrink-0 w-[80%] sm:w-[calc(50%-8px)] md:w-[calc(33.333%-11px)] lg:w-[calc(20%-13px)]"
          >
            <ProductCard product={product as any} />
          </div>
        ))}
      </div>
    </div>
  );
});