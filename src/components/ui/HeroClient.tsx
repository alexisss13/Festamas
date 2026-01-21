'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination, EffectFade } from 'swiper/modules';
import { useUIStore } from '@/store/ui';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles } from 'lucide-react';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';

import { Banner, BannerPosition } from '@prisma/client';

interface HeroClientProps {
  banners: Banner[];
}

// Tipo extendido para manejo interno del Default
type DisplayBanner = Banner & {
  isDefault?: boolean;
};

export function HeroClient({ banners }: HeroClientProps) {
  const { currentDivision } = useUIStore();
  
  // 1. Filtrar Main Hero de la división actual
  const mainBanners = banners.filter(
      b => b.division === currentDivision && b.position === BannerPosition.MAIN_HERO
  );

  const isToys = currentDivision === 'JUGUETERIA';

  // 2. Banner por defecto (Fallback visual si no hay imágenes subidas)
  const defaultBanner: DisplayBanner = {
      id: 'default-hero',
      title: isToys ? '¡La diversión comienza aquí!' : 'Celebra a lo grande',
      subtitle: isToys ? 'Encuentra los juguetes más soñados.' : 'Todo para tu fiesta en un solo lugar.',
      imageUrl: '', 
      mobileUrl: null,
      link: '/category/novedades',
      position: BannerPosition.MAIN_HERO,
      division: currentDivision,
      active: true,
      order: 0,     
      createdAt: new Date(),
      updatedAt: new Date(),
      isDefault: true 
  };

  // Usamos los banners reales o el default
  const displayBanners: DisplayBanner[] = mainBanners.length > 0 ? mainBanners : [defaultBanner];

  return (
    <div className="w-full bg-slate-50 relative group">
      
      {/* 📐 ALTURA DEL HERO
          Controlamos la altura responsive aquí para evitar saltos de layout (CLS).
          - Móvil: h-[200px] a [300px] (según prefieras)
          - Tablet: h-[400px]
          - Desktop: h-[500px] o más
      */}
      <div className="w-full h-[400px] sm:h-[350px] md:h-[450px] lg:h-[550px] relative">
           <Swiper
               modules={[Autoplay, Navigation, Pagination, EffectFade]}
               spaceBetween={0}
               slidesPerView={1}
               loop={displayBanners.length > 1}
               effect={displayBanners.some(b => b.isDefault) ? "fade" : "slide"} // Fade suave para default, Slide para imágenes
               fadeEffect={{ crossFade: true }} 
               navigation={displayBanners.length > 1}
               pagination={{ clickable: true, dynamicBullets: true }}
               autoplay={displayBanners.length > 1 ? { delay: 5000, disableOnInteraction: false } : false}
               className="w-full h-full"
               style={{ 
                   '--swiper-pagination-color': '#fff',
                   '--swiper-navigation-color': '#fff',
                   '--swiper-navigation-size': '25px'
               } as React.CSSProperties}
           >
               {displayBanners.map((banner) => (
               <SwiperSlide key={banner.id} className="w-full h-full bg-slate-100">
                   
                   {/* 👉 CASO A: BANNER REAL (IMAGEN) 
                      Sin texto superpuesto, solo la imagen full responsive.
                   */}
                   {!banner.isDefault && banner.imageUrl ? (
                       <Link 
                           href={banner.link || '#'} 
                           className="relative block w-full h-full overflow-hidden"
                       >
                           {/* IMAGEN DESKTOP (Se oculta en móvil si hay mobileUrl) */}
                           <div className={cn(
                               "relative w-full h-full",
                               banner.mobileUrl ? "hidden md:block" : "block"
                           )}>
                               <Image 
                                   src={banner.imageUrl} 
                                   alt={banner.title} 
                                   fill 
                                   className="object-cover" // 'cover' recorta para llenar, 'contain' muestra todo
                                   priority
                                   sizes="100vw"
                               />
                           </div>

                           {/* IMAGEN MÓVIL (Solo si existe mobileUrl) */}
                           {banner.mobileUrl && (
                               <div className="relative w-full h-full md:hidden">
                                   <Image 
                                       src={banner.mobileUrl} 
                                       alt={banner.title} 
                                       fill 
                                       className="object-cover"
                                       priority
                                       sizes="100vw"
                                   />
                               </div>
                           )}
                       </Link>
                   ) : (
                       
                       /* 👉 CASO B: BANNER DEFAULT (TEXTO + GRADIENTE)
                          Este bloque SOLO se muestra si no has subido banners reales.
                          Mantiene la estética "generativa" para no dejar el sitio vacío.
                       */
                       <div className={cn(
                           "w-full h-full relative overflow-hidden flex items-center justify-center",
                           isToys 
                               ? "bg-gradient-to-br from-[#fc4b65] via-[#fb3f5c] to-[#e11d48]" 
                               : "bg-gradient-to-br from-[#eab308] via-[#fbbf24] to-[#d97706]"
                       )}>
                           {/* Contenido Texto Default */}
                           <div className="relative z-10 text-center px-4 max-w-3xl mx-auto flex flex-col items-center gap-4 md:gap-6 animate-in fade-in zoom-in duration-700">
                               <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-white text-[10px] md:text-xs font-bold uppercase tracking-wider">
                                   <Sparkles className="h-3 w-3" />
                                   {isToys ? 'Nuevos Juguetes' : 'Fiesta y Decoración'}
                               </div>

                               <h2 className="text-3xl md:text-5xl lg:text-7xl font-black text-white leading-tight drop-shadow-md">
                                   {banner.title}
                               </h2>

                               <p className="text-white/90 text-sm md:text-xl font-medium max-w-lg drop-shadow-sm">
                                   {banner.subtitle}
                               </p>

                               <Link href={banner.link || '/search'}>
                                   <Button size="lg" className={cn(
                                       "rounded-full font-bold shadow-xl hover:scale-105 transition-transform",
                                       isToys ? "bg-white text-[#fc4b65] hover:bg-slate-50" : "bg-white text-yellow-600 hover:bg-slate-50"
                                   )}>
                                       Ver Catálogo <ArrowRight className="ml-2 h-4 w-4" />
                                   </Button>
                               </Link>
                           </div>

                           {/* Decoración de Fondo (Olas / Blobs) */}
                           <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
                                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-white rounded-full blur-[100px]" />
                                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-black mix-blend-overlay rounded-full blur-[100px]" />
                           </div>
                       </div>
                   )}

               </SwiperSlide>
               ))}
           </Swiper>
      </div>

      {/* Estilos Globales para los puntos del Swiper */}
      <style jsx global>{`
         .swiper-pagination-bullet { background: white; opacity: 0.5; width: 8px; height: 8px; transition: all 0.3s; }
         .swiper-pagination-bullet-active { opacity: 1; width: 24px; border-radius: 4px; background: white; }
         .swiper-button-next, .swiper-button-prev { text-shadow: 0 2px 4px rgba(0,0,0,0.3); }
         @media (max-width: 768px) {
            .swiper-button-next, .swiper-button-prev { display: none !important; } /* Ocultar flechas en móvil */
         }
      `}</style>
    </div>
  );
}