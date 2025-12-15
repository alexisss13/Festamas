'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';
import { useUIStore } from '@/store/ui';
import { cn } from '@/lib/utils';

// Estilos de Swiper
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

// Importamos los tipos generados por Prisma (o definimos la interfaz)
import { Banner, BannerPosition, Division } from '@prisma/client';

interface HeroClientProps {
  banners: Banner[]; // Recibimos los banners reales de la BD
}

export function HeroClient({ banners }: HeroClientProps) {
  const { currentDivision } = useUIStore();
  
  // 1. Filtramos: Solo los banners de la división actual (JUGUETERIA o FIESTAS)
  const currentBanners = banners.filter(b => b.division === currentDivision);
  
  // 2. Separamos por posición (Cintillo vs Hero Principal)
  const topBanners = currentBanners.filter(b => b.position === BannerPosition.TOP_STRIP);
  const mainBanners = currentBanners.filter(b => b.position === BannerPosition.MAIN_HERO);

  // Colores para las flechitas del slider
  const sliderColorClass = currentDivision === 'JUGUETERIA' ? 'swiper-festamas' : 'swiper-fiestasya';

  // Si no hay banners cargados para esta sección, no mostramos nada para evitar errores
  if (currentBanners.length === 0) return null;

  return (
    <div className="w-full flex flex-col gap-0">
      
      {/* 1. CARRUSEL SUPERIOR (CINTILLO) */}
      {topBanners.length > 0 && (
        <div className="w-full h-10 md:h-12 bg-gray-100 relative overflow-hidden">
          <Swiper
            modules={[Autoplay]}
            spaceBetween={0}
            slidesPerView={1}
            loop={true}
            autoplay={{ delay: 3500, disableOnInteraction: false }}
            className="w-full h-full"
          >
            {topBanners.map((banner) => (
              <SwiperSlide key={banner.id}>
                {/* Si tiene Link, lo envolvemos, si no, solo la imagen */}
                {banner.link ? (
                    <Link href={banner.link} className="block w-full h-full relative cursor-pointer">
                        <Image 
                            src={banner.imageUrl} 
                            alt={banner.title} 
                            fill 
                            className="object-cover object-center"
                            priority 
                        />
                    </Link>
                ) : (
                    <div className="w-full h-full relative">
                        <Image 
                            src={banner.imageUrl} 
                            alt={banner.title} 
                            fill 
                            className="object-cover object-center"
                            priority 
                        />
                    </div>
                )}
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      )}

      {/* 2. CARRUSEL PRINCIPAL (HERO) */}
      {mainBanners.length > 0 && (
        <div className={cn("w-full relative group", sliderColorClass)}>
          {/* Aspect Ratio Responsivo */}
          <div className="w-full aspect-[5/4] md:aspect-[3.5/1] lg:aspect-[4/1] relative">
            <Swiper
                modules={[Autoplay, Navigation, Pagination]}
                spaceBetween={0}
                slidesPerView={1}
                loop={true}
                navigation={true}
                pagination={{ clickable: true }}
                autoplay={{ delay: 6000, disableOnInteraction: false }}
                className="w-full h-full"
            >
                {mainBanners.map((banner) => (
                <SwiperSlide key={banner.id}>
                    {/* Lógica para usar imagen Mobile si existe y estamos en celular (Opcional avanzado) */}
                    {/* Por ahora usamos imageUrl general */}
                    <Link href={banner.link || '#'} className={cn("block w-full h-full relative", !banner.link && "cursor-default")}>
                        <Image 
                            src={banner.imageUrl} 
                            alt={banner.title} 
                            fill 
                            className="object-cover object-center"
                            priority={true}
                        />
                    </Link>
                </SwiperSlide>
                ))}
            </Swiper>
          </div>
        </div>
      )}

      {/* Estilos Globales para flechas */}
      <style jsx global>{`
        .swiper-festamas .swiper-button-next,
        .swiper-festamas .swiper-button-prev {
            color: #fc4b65;
            background: rgba(255,255,255,0.8);
            width: 40px;
            height: 40px;
            border-radius: 50%;
            opacity: 0;
            transition: all 0.3s ease;
        }
        .swiper-festamas .swiper-button-next:after,
        .swiper-festamas .swiper-button-prev:after { font-size: 18px; font-weight: bold; }
        .swiper-festamas .swiper-pagination-bullet-active { background: #fc4b65; }

        .swiper-fiestasya .swiper-button-next,
        .swiper-fiestasya .swiper-button-prev {
            color: #ec4899;
            background: rgba(255,255,255,0.8);
            width: 40px;
            height: 40px;
            border-radius: 50%;
            opacity: 0;
            transition: all 0.3s ease;
        }
        .swiper-fiestasya .swiper-button-next:after,
        .swiper-fiestasya .swiper-button-prev:after { font-size: 18px; font-weight: bold; }
        .swiper-fiestasya .swiper-pagination-bullet-active { background: #ec4899; }

        .group:hover .swiper-button-next,
        .group:hover .swiper-button-prev { opacity: 1; }
      `}</style>
    </div>
  );
}