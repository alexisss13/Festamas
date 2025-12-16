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
    <div className="flex flex-col-reverse gap-4 md:flex-row">
      
      {/* Miniaturas */}
      <div className="flex gap-3 overflow-x-auto md:flex-col md:w-20 md:h-[500px] scrollbar-hide py-1">
        {images.map((img, idx) => (
          <button
            key={idx}
            onClick={() => setActiveImage(img)}
            className={cn(
              "relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border-2 bg-slate-50 transition-all hover:opacity-80",
              // Borde suave (Slate-300) en lugar de negro fuerte
              activeImage === img ? "border-slate-400 ring-2 ring-slate-100 ring-offset-1" : "border-transparent"
            )}
          >
            <Image src={img} alt={`${title} - view ${idx}`} fill className="object-cover" />
          </button>
        ))}
      </div>

      {/* Imagen Principal */}
      <div className="relative aspect-square w-full flex-1 overflow-hidden rounded-2xl bg-white border border-slate-100 shadow-sm group">
        <Image
          src={activeImage}
          alt={title}
          fill
          className={cn(
            "object-contain p-4 transition-all duration-500",
            // Sin BLUR, solo opacidad y escala de grises para mantener nitidez
            isOutOfStock && "opacity-50 grayscale" 
          )}
          priority
        />

        {/* Badge Agotado */}
        {isOutOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/10 z-10">
             <div className="bg-slate-800/90 text-white px-8 py-3 rounded-full font-bold tracking-widest text-sm uppercase shadow-xl border border-white/20">
                Agotado
             </div>
          </div>
        )}
      </div>
    </div>
  );
}