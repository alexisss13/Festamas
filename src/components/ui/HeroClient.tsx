'use client';

import Image from 'next/image';
import Link from 'next/link';
import cloudinaryLoader from '@/lib/cloudinaryLoader';
import { useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';
import { useUIStore } from '@/store/ui';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles } from 'lucide-react';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

import { Banner, BannerPosition } from '@prisma/client';

interface HeroClientProps {
  banners: Banner[];
}

type DisplayBanner = Banner & {
  isDefault?: boolean;
};

export function HeroClient({ banners }: HeroClientProps) {
  const { activeBranchId, branches } = useUIStore();
  const swiperRef = useRef<SwiperType | null>(null);
  
  const mainBanners = banners.filter(
      b => (b.branchId === activeBranchId || !b.branchId) && b.position === BannerPosition.MAIN_HERO
  );

  const activeBranch = branches.find(b => b.id === activeBranchId) ?? branches[0];
  const brandName = activeBranch?.name || 'Tienda';

  const defaultBanner: DisplayBanner = {
      id: 'default-hero',
      title: `¡Bienvenido a ${brandName}!`,
      subtitle: 'Encuentra los mejores productos.',
      imageUrl: '', 
      mobileUrl: null,
      link: '/category/novedades',
      position: BannerPosition.MAIN_HERO,
      branchId: activeBranchId,
      active: true,
      order: 0,     
      createdAt: new Date(),
      updatedAt: new Date(),
      isDefault: true 
  };

  const displayBanners: DisplayBanner[] = mainBanners.length > 0 ? mainBanners : [defaultBanner];
  const hasMultipleBanners = displayBanners.length > 1;
  const handleMouseEnter = () => {
    if (swiperRef.current?.autoplay) {
      swiperRef.current.autoplay.stop();
    }
  };

  const handleMouseLeave = () => {
    if (swiperRef.current?.autoplay) {
      swiperRef.current.autoplay.start();
    }
  };

  return (
    <div 
      className="w-full bg-slate-50 relative group"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="w-full relative aspect-[640/680] md:aspect-auto md:h-[450px]">
           <Swiper
               onSwiper={(swiper) => { swiperRef.current = swiper; }}
               modules={[Autoplay, Navigation, Pagination]}
               spaceBetween={0}
               slidesPerView={1}
               loop={hasMultipleBanners}
               navigation={true}
               pagination={{ 
                   clickable: true, 
                   dynamicBullets: true 
               }}
               autoplay={{ 
                   delay: 5000, 
                   disableOnInteraction: false,
                   pauseOnMouseEnter: true
               }}
               speed={600}
               className="w-full h-full"
               style={{ 
                   '--swiper-pagination-color': '#fff',
                   '--swiper-navigation-color': '#fff',
                   '--swiper-navigation-size': '32px'
               } as React.CSSProperties}
           >
               {displayBanners.map((banner, idx) => (
               <SwiperSlide key={banner.id} className="w-full h-full bg-slate-100">
                   
                   {!banner.isDefault && banner.imageUrl ? (
                       <Link 
                           href={banner.link || '#'} 
                           className="relative block w-full h-full overflow-hidden"
                       >
                           <div className={cn(
                               "relative w-full h-full",
                               banner.mobileUrl ? "hidden md:block" : "block"
                           )}>
                               <Image 
                                   loader={cloudinaryLoader}
                                   src={banner.imageUrl.startsWith('http') || banner.imageUrl.startsWith('/') ? banner.imageUrl : `/${banner.imageUrl}`} 
                                   alt={banner.title} 
                                   fill 
                                   className="object-cover"
                                   priority={idx === 0}
                                   loading={idx === 0 ? "eager" : "lazy"}
                                   sizes="100vw"
                               />
                           </div>

                           {banner.mobileUrl && (
                               <div className="relative w-full h-full md:hidden">
                                   <Image 
                                       loader={cloudinaryLoader}
                                       src={banner.mobileUrl.startsWith('http') || banner.mobileUrl.startsWith('/') ? banner.mobileUrl : `/${banner.mobileUrl}`} 
                                       alt={banner.title} 
                                       fill 
                                       className="object-cover" 
                                       priority={idx === 0}
                                       loading={idx === 0 ? "eager" : "lazy"}
                                       sizes="100vw"
                                   />
                               </div>
                           )}
                       </Link>
                   ) : (
                       <div className={cn(
                           "w-full h-full relative overflow-hidden flex items-center justify-center",
                           "bg-primary"
                       )}>
                           <div className="relative z-10 text-center px-4 max-w-3xl mx-auto flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-700">
                               <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-white text-[10px] md:text-xs font-bold uppercase tracking-wider">
                                   <Sparkles className="h-3 w-3" />
                                   {brandName}
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
         .swiper-button-next, 
         .swiper-button-prev {
            transition: all 0.3s ease;
         }
         .swiper-button-next:hover, 
         .swiper-button-prev:hover {
            transform: scale(1.1);
         }
         .swiper-button-next::after, 
         .swiper-button-prev::after {
            font-size: 32px;
            font-weight: bold;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
         }
         .swiper-pagination-bullet { 
            background: white; 
            opacity: 0.5; 
            width: 8px; 
            height: 8px; 
            transition: all 0.3s; 
            cursor: pointer;
         }
         .swiper-pagination-bullet-active { 
            opacity: 1; 
            width: 24px; 
            border-radius: 4px; 
            background: white; 
         }
         @media (max-width: 768px) {
            .swiper-button-next, .swiper-button-prev { 
               display: none !important; 
            }
         }
      `}</style>
    </div>
  );
}
