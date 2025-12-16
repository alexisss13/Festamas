'use client';

import { Product } from '@prisma/client';
import { ProductCard } from './ProductCard';
import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  products: Product[];
  title?: string;
}

export function ProductCarousel({ products, title }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { current } = scrollRef;
      const scrollAmount = direction === 'left' ? -300 : 300;
      current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  if (!products.length) return null;

  return (
    <div className="relative group">
      {/* Botones de Navegación (Solo visibles en hover desktop) */}
      <div className="absolute top-1/2 -left-4 -translate-y-1/2 z-10 opacity-0 group-hover:opacity-100 transition-opacity hidden md:block">
        <Button 
            variant="outline" 
            size="icon" 
            className="rounded-full shadow-md bg-white/90 hover:bg-white"
            onClick={() => scroll('left')}
        >
            <ChevronLeft className="h-5 w-5" />
        </Button>
      </div>
      
      <div className="absolute top-1/2 -right-4 -translate-y-1/2 z-10 opacity-0 group-hover:opacity-100 transition-opacity hidden md:block">
        <Button 
            variant="outline" 
            size="icon" 
            className="rounded-full shadow-md bg-white/90 hover:bg-white"
            onClick={() => scroll('right')}
        >
            <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      {/* Contenedor Scroll Snap */}
      <div 
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-4 px-1 snap-x snap-mandatory scrollbar-hide -mx-4 md:mx-0 px-4 md:px-0"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {products.map((product) => (
          <div key={product.id} className="min-w-[160px] md:min-w-[220px] snap-start">
            <ProductCard product={product as any} />
          </div>
        ))}
      </div>
    </div>
  );
}