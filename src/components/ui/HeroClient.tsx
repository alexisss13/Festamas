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
      
      {/* 📐 MEDIDAS EXACTAS CORREGIDAS:
          - Móvil: 640x680 (Aspect Ratio 16:17 aprox). Usamos 'aspect-[640/680]' para precisión de píxel.
          - Web: 1500x450 (Altura fija). Rompemos el ratio móvil con 'md:aspect-auto' y fijamos altura.
      */}
      <div className="w-full relative aspect-[640/680] md:aspect-auto md:h-[450px]">
           <Swiper
               modules={[Autoplay, Navigation, Pagination, EffectFade]}
               spaceBetween={0}
               slidesPerView={1}
               loop={displayBanners.length > 1}
               effect={displayBanners.some(b => b.isDefault) ? "fade" : "slide"} 
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
                   
                   {/* 👉 CASO A: BANNER REAL (IMAGEN) */}
                   {!banner.isDefault && banner.imageUrl ? (
                       <Link 
                           href={banner.link || '#'} 
                           className="relative block w-full h-full overflow-hidden"
                       >
                           {/* IMAGEN DESKTOP (1500x450) */}
                           <div className={cn(
                               "relative w-full h-full",
                               banner.mobileUrl ? "hidden md:block" : "block"
                           )}>
                               <Image 
                                   src={banner.imageUrl} 
                                   alt={banner.title} 
                                   fill 
                                   className="object-cover"
                                   priority
                                   sizes="100vw"
                               />
                           </div>

                           {/* IMAGEN MÓVIL (640x680) */}
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
                       
                       /* 👉 CASO B: BANNER DEFAULT */
                       <div className={cn(
                           "w-full h-full relative overflow-hidden flex items-center justify-center",
                           isToys 
                               ? "bg-gradient-to-br from-[#fc4b65] via-[#fb3f5c] to-[#e11d48]" 
                               : "bg-gradient-to-br from-[#eab308] via-[#fbbf24] to-[#d97706]"
                       )}>
                           <div className="relative z-10 text-center px-4 max-w-3xl mx-auto flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-700">
                               <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-white text-[10px] md:text-xs font-bold uppercase tracking-wider">
                                   <Sparkles className="h-3 w-3" />
                                   {isToys ? 'Nuevos Juguetes' : 'Fiesta y Decoración'}
                               </div>
                               <h2 className="text-3xl md:text-5xl font-black text-white leading-tight drop-shadow-md">
                                   {banner.title}
                               </h2>
                               <p className="text-white/90 text-sm md:text-lg font-medium max-w-lg drop-shadow-sm">
                                   {banner.subtitle}
                               </p>
                               <Link href={banner.link || '/search'}>
                                   <Button size="lg" className="rounded-full font-bold shadow-xl bg-white text-slate-900 hover:bg-slate-50">
                                       Ver Catálogo <ArrowRight className="ml-2 h-4 w-4" />
                                   </Button>
                               </Link>
                           </div>
                       </div>
                   )}

               </SwiperSlide>
               ))}
           </Swiper>
      </div>

      <style jsx global>{`
         .swiper-pagination-bullet { background: white; opacity: 0.5; width: 8px; height: 8px; transition: all 0.3s; }
         .swiper-pagination-bullet-active { opacity: 1; width: 24px; border-radius: 4px; background: white; }
         @media (max-width: 768px) {
            .swiper-button-next, .swiper-button-prev { display: none !important; }
         }
      `}</style>
    </div>
  );
}