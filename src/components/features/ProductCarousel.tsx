'use client';

import { Product } from '@prisma/client';
import { ProductCard } from './ProductCard';
import { useRef, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Props {
  products: Product[];
  className?: string;
  autoPlay?: boolean;
}

export function ProductCarousel({ products, className, autoPlay = true }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Lógica de Scroll Infinito
  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { current } = scrollRef;
      // Desplazamos un porcentaje del ancho visible para que sea fluido
      const scrollAmount = direction === 'left' ? -current.offsetWidth / 2 : current.offsetWidth / 2;
      
      const isAtEnd = current.scrollLeft + current.clientWidth >= current.scrollWidth - 5; // Tolerancia de 5px
      const isAtStart = current.scrollLeft <= 0;

      if (direction === 'right' && isAtEnd) {
        current.scrollTo({ left: 0, behavior: 'smooth' });
      } else if (direction === 'left' && isAtStart) {
        current.scrollTo({ left: current.scrollWidth, behavior: 'smooth' });
      } else {
        current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    }
  };

  // Auto-Play: Gira cada 5 segundos si no hay hover
  useEffect(() => {
    if (!autoPlay) return;
    const interval = setInterval(() => {
      if (!isHovered) scroll('right');
    }, 5000); // 5 segundos para dar tiempo a leer
    return () => clearInterval(interval);
  }, [isHovered, autoPlay]);

  if (!products.length) return null;

  return (
    <div 
      className={cn("relative w-full group/carousel", className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      
      {/* --- FLECHAS DE NAVEGACIÓN (SIEMPRE VISIBLES) --- */}
      
      {/* Izquierda */}
      <div className="absolute top-1/2 -left-4 md:-left-5 -translate-y-1/2 z-30 hidden md:block">
        <Button 
            variant="outline" 
            size="icon" 
            className="h-10 w-10 rounded-full shadow-lg bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-black hover:scale-105 transition-all"
            onClick={() => scroll('left')}
        >
            <ChevronLeft className="h-6 w-6" />
        </Button>
      </div>
      
      {/* Derecha */}
      <div className="absolute top-1/2 -right-4 md:-right-5 -translate-y-1/2 z-30 hidden md:block">
        <Button 
            variant="outline" 
            size="icon" 
            className="h-10 w-10 rounded-full shadow-lg bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-black hover:scale-105 transition-all"
            onClick={() => scroll('right')}
        >
            <ChevronRight className="h-6 w-6" />
        </Button>
      </div>

      {/* --- CONTENEDOR SCROLL --- */}
      {/* gap-4 = 16px de espacio entre tarjetas.
          Para que entren 5 exactas en Desktop:
          Width = (100% - (4 gaps * 16px)) / 5 = calc(20% - 13px) aprox.
      */}
      <div 
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto py-6 px-1 scroll-smooth snap-x snap-mandatory scrollbar-hide"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {products.map((product) => (
          <div 
            key={product.id} 
            // 📐 MATEMÁTICA PURA PARA FIT PERFECTO:
            // Móvil: 1.2 items (80%) para invitar a scroll
            // Tablet: 3 items (33% menos ajuste de gap)
            // Desktop: 5 items (20% menos ajuste de gap)
            className="snap-start flex-shrink-0 min-w-[80%] sm:min-w-[calc(50%-8px)] md:min-w-[calc(33.333%-11px)] lg:min-w-[calc(20%-13px)]"
          >
            <ProductCard product={product as any} />
          </div>
        ))}
      </div>
    </div>
  );
}