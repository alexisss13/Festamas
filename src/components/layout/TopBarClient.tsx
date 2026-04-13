'use client';

import { useUIStore } from '@/store/ui';
import { Banner } from '@prisma/client';
import Image from 'next/image';
import Link from 'next/link';
import cloudinaryLoader from '@/lib/cloudinaryLoader';
import { cn } from '@/lib/utils';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';

import 'swiper/css';

interface TopBarClientProps {
  banners: Banner[];
}

export function TopBarClient({ banners }: TopBarClientProps) {
  const { activeBranchId } = useUIStore();

  const branchBanners = banners.filter(
    (b) => b.branchId === activeBranchId || !b.branchId
  );

  if (branchBanners.length === 0) return null;

  return (
    <div className="w-full bg-slate-900 overflow-hidden relative print:hidden z-50">
      <Swiper
        modules={[Autoplay]}
        spaceBetween={0}
        slidesPerView={1}
        loop={branchBanners.length > 1}
        autoplay={{
          delay: 4000,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        speed={500}
        className="w-full"
      >
        {branchBanners.map((banner) => (
          <SwiperSlide key={banner.id}>
            <Link 
              href={banner.link || '#'} 
              className={cn(
                "block w-full text-center relative",
                banner.link ? "cursor-pointer" : "cursor-default pointer-events-none"
              )}
            >
              {/* Contenedor desktop */}
              <div className={cn(
                "relative w-full",
                banner.mobileUrl ? "hidden md:block" : "block"
              )}>
                {banner.imageUrl ? (
                  <Image
                    loader={cloudinaryLoader}
                    src={banner.imageUrl.startsWith('http') || banner.imageUrl.startsWith('/') ? banner.imageUrl : `/${banner.imageUrl}`}
                    alt={banner.title}
                    width={1920}
                    height={50}
                    className="w-full h-auto block"
                    priority
                    quality={100}
                    sizes="100vw"
                  />
                ) : (
                  <div className="text-white text-xs sm:text-sm font-semibold truncate px-4 h-10 flex items-center justify-center">
                    {banner.title}
                  </div>
                )}
              </div>

              {/* Contenedor mobile */}
              {banner.mobileUrl && (
                <div className="relative w-full md:hidden">
                  <Image
                    loader={cloudinaryLoader}
                    src={banner.mobileUrl.startsWith('http') || banner.mobileUrl.startsWith('/') ? banner.mobileUrl : `/${banner.mobileUrl}`}
                    alt={banner.title}
                    width={800}
                    height={200}
                    className="w-full h-auto block"
                    priority
                    quality={100}
                    sizes="100vw"
                  />
                </div>
              )}
            </Link>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
