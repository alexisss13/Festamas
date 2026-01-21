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

import { Banner, BannerPosition, Division } from '@prisma/client';

interface HeroClientProps {
  banners: Banner[];
}

// Extendemos el tipo Banner para permitir la propiedad interna "isDefault"
// que usamos solo en el frontend para saber si mostrar el arte generativo.
type DisplayBanner = Banner & {
    isDefault?: boolean;
};

export function HeroClient({ banners }: HeroClientProps) {
  const { currentDivision } = useUIStore();
  
  // 1. Filtramos solo los MAIN_HERO de la división actual
  const mainBanners = banners.filter(
      b => b.division === currentDivision && b.position === BannerPosition.MAIN_HERO
  );

  const isToys = currentDivision === 'JUGUETERIA';

  // 2. Definimos el banner por defecto
  const defaultBanner: DisplayBanner = {
      id: 'default-hero',
      title: isToys ? '¡La diversión comienza aquí!' : 'Celebra a lo grande',
      subtitle: isToys ? 'Encuentra los juguetes más soñados.' : 'Todo para tu fiesta en un solo lugar.',
      imageUrl: '', 
      mobileUrl: null, // Requerido por el tipo Banner
      link: '/category/novedades',
      position: BannerPosition.MAIN_HERO,
      division: currentDivision,
      active: true, // "active" en lugar de "isActive" según tu schema
      order: 0,     // Requerido por el tipo Banner
      createdAt: new Date(),
      updatedAt: new Date(),
      isDefault: true // Flag interno
  };

  // Si no hay banners reales, usamos el array con el default
  const displayBanners: DisplayBanner[] = mainBanners.length > 0 ? mainBanners : [defaultBanner];

  return (
    <div className="w-full flex flex-col gap-0 bg-white relative">
      
      {/* HERO SECTION */}
      <div className={cn(
            "w-full relative group hero-slider overflow-hidden transition-colors duration-500",
            // Fondo Base
            isToys 
                ? "bg-gradient-to-br from-[#fc4b65] via-[#fb3f5c] to-[#e11d48]" 
                : "bg-gradient-to-br from-[#eab308] via-[#fbbf24] to-[#d97706]"
        )}>
          
          <div className="w-full max-w-[1600px] mx-auto relative px-0 pt-4 pb-12 md:pt-8 md:pb-20">
                <Swiper
                    modules={[Autoplay, Navigation, Pagination, EffectFade]}
                    spaceBetween={0}
                    slidesPerView={1}
                    loop={displayBanners.length > 1}
                    effect="fade"
                    fadeEffect={{ crossFade: true }} 
                    navigation={displayBanners.length > 1}
                    pagination={{ clickable: true }}
                    autoplay={displayBanners.length > 1 ? { delay: 6000, disableOnInteraction: false } : false}
                    className="w-full h-full"
                    style={{ '--swiper-pagination-color': '#fff' } as React.CSSProperties}
                >
                    {displayBanners.map((banner) => (
                    <SwiperSlide key={banner.id}>
                        {/* Contenedor del Slide */}
                        <div className="relative w-full px-6 md:px-12 lg:px-20 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-12 min-h-[300px] md:min-h-[400px]">
                            
                            {/* --- COLUMNA IZQUIERDA: TEXTO --- */}
                            <div className="relative z-20 flex flex-col items-center md:items-start text-center md:text-left max-w-2xl animate-in slide-in-from-left-5 fade-in duration-700">
                                
                                {/* Badge */}
                                {(banner.title || banner.isDefault) && (
                                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-white text-[10px] md:text-xs font-bold uppercase tracking-wider mb-3">
                                        <Sparkles className="h-3 w-3" />
                                        {isToys ? 'Nuevos Juguetes' : 'Fiesta y Decoración'}
                                    </div>
                                )}

                                {/* Título */}
                                <h2 className="text-3xl md:text-5xl lg:text-6xl font-black text-white leading-[0.95] tracking-tight mb-3 drop-shadow-md">
                                    {banner.title || (banner.isDefault ? (isToys ? "DIVERSIÓN TOTAL" : "FIESTA TOTAL") : "")}
                                </h2>
                                
                                {/* Subtítulo (Ahora sí existe en el tipo Banner) */}
                                {banner.subtitle && (
                                    <p className="text-base md:text-lg text-white/90 font-medium mb-6 max-w-lg leading-relaxed drop-shadow-sm">
                                        {banner.subtitle}
                                    </p>
                                )}

                                {/* Botón */}
                                {(banner.link || banner.isDefault) && (
                                    <Link href={banner.link || '/search'}>
                                        <Button size="lg" className={cn(
                                            "h-11 px-6 rounded-full text-base font-bold shadow-lg hover:scale-105 transition-transform",
                                            isToys 
                                                ? "bg-white text-[#fc4b65] hover:bg-slate-50" 
                                                : "bg-white text-yellow-600 hover:bg-slate-50"
                                        )}>
                                            Explorar Ahora <ArrowRight className="ml-2 h-4 w-4" />
                                        </Button>
                                    </Link>
                                )}
                            </div>

                            {/* --- COLUMNA DERECHA: IMAGEN --- */}
                            <div className="relative z-10 w-full md:w-1/2 h-[250px] md:h-[400px] flex items-center justify-center animate-in slide-in-from-right-5 fade-in duration-700">
                                {banner.imageUrl ? (
                                    // IMAGEN REAL
                                    <div className="relative w-full h-full drop-shadow-2xl hover:scale-105 transition-transform duration-500">
                                        <Image 
                                            src={banner.imageUrl} 
                                            alt={banner.title} 
                                            fill 
                                            className="object-contain object-center"
                                            priority
                                        />
                                    </div>
                                ) : (
                                    // ARTE GENERATIVO
                                    <div className="relative w-full h-full flex items-center justify-center pointer-events-none select-none">
                                        {isToys ? (
                                            <div className="relative w-56 h-56 md:w-80 md:h-80">
                                                <div className="absolute top-0 right-5 w-24 h-24 bg-yellow-400 rounded-lg transform rotate-12 animate-pulse shadow-lg"></div>
                                                <div className="absolute bottom-5 left-5 w-32 h-32 bg-blue-500 rounded-full opacity-80 mix-blend-hard-light animate-bounce" style={{ animationDuration: '3s' }}></div>
                                                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-44 h-44 bg-green-400 rounded-2xl rotate-45 border-4 border-white/50 shadow-2xl flex items-center justify-center">
                                                    <span className="text-7xl filter drop-shadow">🧸</span>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="relative w-56 h-56 md:w-80 md:h-80">
                                                <div className="absolute top-0 left-5 w-24 h-32 bg-purple-500 rounded-[100%] opacity-90 animate-bounce shadow-lg" style={{ animationDuration: '4s' }}></div>
                                                <div className="absolute top-10 right-5 w-28 h-36 bg-pink-500 rounded-[100%] opacity-90 animate-bounce shadow-lg" style={{ animationDuration: '5s' }}></div>
                                                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-32 h-40 bg-blue-400 rounded-[100%] opacity-90 animate-bounce shadow-xl flex items-center justify-center" style={{ animationDuration: '4.5s' }}>
                                                    <span className="text-5xl pt-4">🎉</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                        </div>
                    </SwiperSlide>
                    ))}
                </Swiper>
          </div>

          {/* DECORACIÓN FONDO */}
          <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                {isToys ? (
                    <>
                        <div className="absolute -top-10 -left-10 w-[40vw] h-[40vw] bg-white opacity-[0.03] rounded-full blur-3xl"></div>
                        <div className="absolute bottom-0 right-0 w-[30vw] h-[30vw] bg-yellow-300 opacity-[0.08] rounded-full blur-3xl mix-blend-overlay"></div>
                    </>
                ) : (
                    <>
                         <div className="absolute -top-10 right-0 w-[40vw] h-[40vw] bg-white opacity-[0.04] rounded-full blur-3xl"></div>
                         <div className="absolute bottom-0 left-0 w-[30vw] h-[30vw] bg-pink-500 opacity-[0.08] rounded-full blur-3xl mix-blend-overlay"></div>
                    </>
                )}
          </div>

          {/* OLA INFERIOR */}
          {isToys && (
              <div className="absolute bottom-[-1px] left-0 w-full overflow-hidden leading-[0] transform rotate-180 z-20">
                <svg className="relative block w-[calc(130%+1.3px)] h-[40px] md:h-[80px]" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
                    <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" className="fill-white"></path>
                </svg>
              </div>
          )}
          {!isToys && (
               <div className="absolute bottom-[-1px] left-0 w-full overflow-hidden leading-[0] z-20">
                  <svg className="relative block w-[calc(100%+1.3px)] h-[40px] md:h-[80px]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" preserveAspectRatio="none">
                      <path fill="#ffffff" fillOpacity="1" d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,224C672,245,768,267,864,261.3C960,256,1056,224,1152,197.3C1248,171,1344,149,1392,138.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
                  </svg>
               </div>
          )}

        </div>
      
      {/* ESTILOS SWIPER */}
      <style jsx global>{`
        .hero-slider .swiper-pagination-bullet { background: rgba(255,255,255,0.4); opacity: 1; width: 10px; height: 10px; transition:all 0.3s; border: 2px solid transparent; }
        .hero-slider .swiper-pagination-bullet-active { background: white; width: 28px; border-radius: 6px; border-color: white; opacity: 1; }
        .hero-slider .swiper-button-next, .hero-slider .swiper-button-prev { color: white; opacity: 0.5; transform: scale(0.6); transition: all 0.2s; }
        .hero-slider .swiper-button-next:hover, .hero-slider .swiper-button-prev:hover { opacity: 1; transform: scale(0.8); }
        @media (max-width: 768px) {
            .hero-slider .swiper-button-next, .hero-slider .swiper-button-prev { display: none; }
        }
      `}</style>
    </div>
  );
}