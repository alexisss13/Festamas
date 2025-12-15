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

// Importamos los tipos generados por Prisma
import { Banner, BannerPosition } from '@prisma/client';

interface HeroClientProps {
  banners: Banner[];
}

export function HeroClient({ banners }: HeroClientProps) {
  const { currentDivision } = useUIStore();
  
  // 1. Filtramos: Solo los banners de la división actual
  const currentBanners = banners.filter(b => b.division === currentDivision);
  
  // 2. Separamos por posición
  const topBanners = currentBanners.filter(b => b.position === BannerPosition.TOP_STRIP);
  const mainBanners = currentBanners.filter(b => b.position === BannerPosition.MAIN_HERO);

  // Clase para identificar la marca en el CSS
  const brandClass = currentDivision === 'JUGUETERIA' ? 'theme-festamas' : 'theme-fiestasya';

  if (currentBanners.length === 0) return null;

  return (
    <div className="w-full flex flex-col gap-0">
      
      {/* 1. CARRUSEL SUPERIOR (CINTILLO) */}
      {topBanners.length > 0 && (
        <div className="w-full h-10 md:h-12 bg-slate-100 relative overflow-hidden">
          <Swiper
            modules={[Autoplay]}
            spaceBetween={0}
            slidesPerView={1}
            loop={true}
            autoplay={{ delay: 4000, disableOnInteraction: false }}
            className="w-full h-full"
          >
            {topBanners.map((banner) => (
              <SwiperSlide key={banner.id}>
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
        <div className={cn("w-full relative group hero-slider", brandClass)}>
          
          {/* ASPECT RATIO RESPONSIVO */}
          <div className="w-full aspect-[4/5] md:aspect-[3.5/1] lg:aspect-[4/1] relative">
            <Swiper
                modules={[Autoplay, Navigation, Pagination]}
                spaceBetween={0}
                slidesPerView={1}
                loop={true}
                navigation={true}
                pagination={{ clickable: true }}
                autoplay={{ delay: 6000, disableOnInteraction: false }}
                className="w-full h-full"
                style={{
                    '--swiper-pagination-color': '#fff',
                } as React.CSSProperties}
            >
                {mainBanners.map((banner) => (
                <SwiperSlide key={banner.id}>
                    <Link href={banner.link || '#'} className={cn("block w-full h-full relative", !banner.link && "cursor-default")}>
                        
                        {/* A. IMAGEN DESKTOP */}
                        <div className="hidden md:block w-full h-full relative">
                            <Image 
                                src={banner.imageUrl} 
                                alt={banner.title} 
                                fill 
                                className="object-cover object-center"
                                priority={true}
                            />
                        </div>

                        {/* B. IMAGEN MÓVIL */}
                        <div className="block md:hidden w-full h-full relative">
                            <Image 
                                src={banner.mobileUrl || banner.imageUrl} 
                                alt={banner.title} 
                                fill 
                                className="object-cover object-center"
                                priority={true}
                            />
                        </div>

                    </Link>
                </SwiperSlide>
                ))}
            </Swiper>
          </div>
        </div>
      )}

      {/* ESTILOS GLOBALES PERSONALIZADOS */}
      <style jsx global>{`
        /* --- BOTÓN DE NAVEGACIÓN (El Círculo) --- */
        .hero-slider .swiper-button-next,
        .hero-slider .swiper-button-prev {
            background-color: rgba(0, 0, 0, 0.25); /* Fondo oscuro transparente */
            color: white; 
            width: 40px !important;  /* Tamaño del Círculo */
            height: 40px !important; /* Tamaño del Círculo */
            border-radius: 50%;
            backdrop-filter: blur(4px);
            transition: all 0.2s ease;
            opacity: 0; /* Oculto hasta hover */
            
            /* Centrado Flexbox */
            display: flex;
            align-items: center;
            justify-content: center;
            margin-top: -20px; /* Ajuste vertical */
        }

        /* --- AQUÍ ESTÁ EL FIX: FORZAMOS EL TAMAÑO DEL SVG --- */
        .hero-slider .swiper-button-next svg,
        .hero-slider .swiper-button-prev svg {
            width: 14px !important;  /* ¡Tamaño del icono fijo! */
            height: 14px !important; /* ¡Tamaño del icono fijo! */
            flex-shrink: 0; /* Evita que se aplaste */
        }

        /* Hover sobre el círculo */
        .hero-slider .swiper-button-next:hover,
        .hero-slider .swiper-button-prev:hover {
            background-color: rgba(0, 0, 0, 0.6); /* Más oscuro */
            transform: scale(1.1);
        }

        /* Mostrar flechas solo al pasar el mouse */
        .hero-slider:hover .swiper-button-next,
        .hero-slider:hover .swiper-button-prev {
            opacity: 1;
        }

        /* Eliminar estilos legacy por si acaso */
        .hero-slider .swiper-button-next:after,
        .hero-slider .swiper-button-prev:after {
            display: none; /* Ocultamos la fuente antigua si existe */
        }

        /* --- PAGINACIÓN (CÁPSULA OSCURA) --- */
        .hero-slider .swiper-pagination {
            background: rgba(0, 0, 0, 0.4); 
            padding: 6px 12px;
            border-radius: 100px;
            width: auto !important;
            left: 50% !important;
            transform: translateX(-50%);
            bottom: 24px !important;
            display: flex;
            gap: 6px;
            align-items: center;
            backdrop-filter: blur(2px);
        }

        .hero-slider .swiper-pagination-bullet {
            width: 6px;
            height: 6px;
            background: rgba(255, 255, 255, 0.5);
            opacity: 1;
            margin: 0 !important;
            transition: all 0.3s ease;
        }

        /* Puntito Activo (Píldora Blanca) */
        .hero-slider .swiper-pagination-bullet-active {
            width: 18px; /* Se estira */
            border-radius: 4px;
            background: white; 
        }

        /* Color de marca opcional en la píldora */
        .theme-festamas .swiper-pagination-bullet-active {
            background: #fc4b65; 
        }
        .theme-fiestasya .swiper-pagination-bullet-active {
            background: #ec4899; 
        }
      `}</style>
    </div>
  );
}