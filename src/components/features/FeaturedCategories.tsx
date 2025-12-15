'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useUIStore } from '@/store/ui';
import { Category } from '@prisma/client';
import { cn } from '@/lib/utils';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';

// Importamos Swiper (el mismo motor potente del Hero)
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, FreeMode } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/free-mode';

interface Props {
  categories: Category[];
}

export function FeaturedCategories({ categories }: Props) {
  const { currentDivision } = useUIStore();
  
  // 1. Filtrar por tienda activa
  const displayCategories = categories.filter(cat => cat.division === currentDivision);
  
  // 2. Color de la marca para detalles
  const isToys = currentDivision === 'JUGUETERIA';
  const brandColor = isToys ? '#fc4b65' : '#ec4899';

  if (displayCategories.length === 0) return null;

  return (
    <section className="container mx-auto px-4 py-12 border-b border-slate-50 relative group/section">
      
      {/* HEADER DE LA SECCIÓN */}
      <div className="flex items-center justify-between mb-8">
        <div>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
                Compra por Categoría
            </h2>
            {/* Pequeña línea decorativa de marca */}
            <div 
                className="mt-2 h-1 w-12 rounded-full"
                style={{ backgroundColor: brandColor }}
            />
        </div>
        
        <Link 
            href="/search" 
            className="text-sm font-bold hover:underline flex items-center transition-colors group"
            style={{ color: brandColor }}
        >
            Ver todas <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      {/* CARRUSEL DE CATEGORÍAS */}
      <div className="relative">
        
        {/* Botón ANTERIOR (Solo visible al hover de la sección) */}
        <button className="swiper-prev-cat absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full shadow-lg border border-slate-100 flex items-center justify-center text-slate-700 opacity-0 group-hover/section:opacity-100 transition-all duration-300 disabled:opacity-0 disabled:pointer-events-none -translate-x-1/2 lg:-translate-x-4 hover:scale-110 hover:bg-white hover:text-slate-900">
            <ChevronLeft className="h-6 w-6" />
        </button>

        {/* Botón SIGUIENTE */}
        <button className="swiper-next-cat absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full shadow-lg border border-slate-100 flex items-center justify-center text-slate-700 opacity-0 group-hover/section:opacity-100 transition-all duration-300 disabled:opacity-0 disabled:pointer-events-none translate-x-1/2 lg:translate-x-4 hover:scale-110 hover:bg-white hover:text-slate-900">
            <ChevronRight className="h-6 w-6" />
        </button>

        <Swiper
            modules={[Navigation, FreeMode]}
            spaceBetween={16}
            slidesPerView={2.2} // En móvil muestra 2 y un pedacito (invita a deslizar)
            freeMode={true} // Deslizamiento suave libre
            navigation={{
                nextEl: '.swiper-next-cat',
                prevEl: '.swiper-prev-cat',
            }}
            breakpoints={{
                640: { slidesPerView: 3.5, spaceBetween: 20 },
                768: { slidesPerView: 4.5, spaceBetween: 24 },
                1024: { slidesPerView: 6, spaceBetween: 24 }, // Desktop: 6 categorías visibles
            }}
            className="w-full !px-1 !py-4" // Padding para que la sombra no se corte
        >
            {displayCategories.map((cat) => (
                <SwiperSlide key={cat.id} className="h-auto">
                    <Link href={`/category/${cat.slug}`} className="group flex flex-col h-full gap-3 select-none">
                        
                        {/* TARJETA DE IMAGEN */}
                        <div className="relative aspect-square overflow-hidden rounded-2xl bg-slate-100 border border-slate-100 shadow-sm transition-all duration-300 group-hover:shadow-lg group-hover:-translate-y-1">
                            {cat.image ? (
                                <Image 
                                    src={cat.image} 
                                    alt={cat.name} 
                                    fill 
                                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                            ) : (
                                // Placeholder elegante si no hay foto
                                <div className="w-full h-full flex items-center justify-center text-slate-300 bg-slate-50">
                                    <span className="text-4xl font-bold opacity-20 capitalize">{cat.name[0]}</span>
                                </div>
                            )}
                            
                            {/* Gradiente sutil al hover para dar profundidad */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </div>

                        {/* TEXTO */}
                        <div className="text-center px-1">
                            <h3 className="font-bold text-slate-700 text-sm md:text-base leading-tight transition-colors duration-300"
                                style={{
                                    // Truco: Al hover, el texto toma el color de la marca
                                }}
                            >
                                <span className="group-hover:text-black transition-colors">{cat.name}</span>
                            </h3>
                        </div>
                    </Link>
                </SwiperSlide>
            ))}
        </Swiper>
      </div>
    </section>
  );
}