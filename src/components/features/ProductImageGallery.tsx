'use client';

import { useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface Props {
  images: string[];
  title: string;
  isOutOfStock: boolean;
}

export function ProductImageGallery({ images, title, isOutOfStock }: Props) {
  const [activeImage, setActiveImage] = useState(images[0] || '/placeholder.jpg');

  return (
    <div className="flex flex-col-reverse gap-3 md:gap-4 md:flex-row">
      
      {/* Miniaturas */}
      <div className="flex gap-2 md:gap-3 overflow-x-auto md:flex-col md:w-16 lg:w-20 md:h-[400px] lg:md:h-[500px] scrollbar-hide py-1">
        {images.map((img, idx) => (
          <button
            key={idx}
            onClick={() => setActiveImage(img)}
            className={cn(
              "relative h-16 w-16 md:h-16 md:w-16 lg:h-20 lg:w-20 flex-shrink-0 overflow-hidden rounded-lg border-2 bg-slate-50 transition-all hover:opacity-80",
              activeImage === img ? "border-slate-400 ring-2 ring-slate-100 ring-offset-1" : "border-transparent"
            )}
          >
            <Image src={img} alt={`${title} - view ${idx}`} fill className="object-cover" sizes="80px" />
          </button>
        ))}
      </div>

      {/* Imagen Principal */}
      <div className="relative aspect-square w-full flex-1 overflow-hidden rounded-xl md:rounded-2xl bg-white border border-slate-100 shadow-sm group">
        <Image
          src={activeImage}
          alt={title}
          fill
          className={cn(
            "object-contain p-3 md:p-4 transition-all duration-500",
            isOutOfStock && "opacity-50 grayscale" 
          )}
          priority
          sizes="(max-width: 768px) 100vw, 50vw"
        />

        {/* Badge Agotado */}
        {isOutOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/10 z-10">
             <div className="bg-slate-800/90 text-white px-6 md:px-8 py-2 md:py-3 rounded-full font-bold tracking-widest text-xs md:text-sm uppercase shadow-xl border border-white/20">
                Agotado
             </div>
          </div>
        )}
      </div>
    </div>
  );
}