'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface BannerData {
  id: string;
  title: string;
  desktopUrl: string;
  mobileUrl: string;
  link: string | null;
}

interface TopBannerClientProps {
  banners: BannerData[];
}

export function TopBannerClient({ banners }: TopBannerClientProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Auto-play del carrusel
  useEffect(() => {
    if (banners.length <= 1 || isHovered) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 5000); // Cambia cada 5 segundos

    return () => clearInterval(interval);
  }, [banners.length, isHovered]);

  const currentBanner = banners[currentIndex];

  const bannerContent = (
    <div 
      className="relative w-full h-[40px] md:h-[60px] overflow-hidden bg-slate-100 group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {banners.map((banner, index) => (
        <div
          key={banner.id}
          className="absolute inset-0 w-full h-full transition-transform duration-700 ease-in-out"
          style={{
            transform: `translateX(${(index - currentIndex) * 100}%)`,
          }}
        >
          {/* Imagen Desktop */}
          <div className="hidden md:block relative w-full h-full">
            <Image
              src={banner.desktopUrl}
              alt={banner.title}
              fill
              className="object-cover object-center transition-all duration-700 ease-out group-hover:scale-105"
              priority={index === 0}
              sizes="100vw"
              unoptimized
            />
          </div>
          
          {/* Imagen Mobile */}
          <div className="block md:hidden relative w-full h-full">
            <Image
              src={banner.mobileUrl}
              alt={banner.title}
              fill
              className="object-cover object-center transition-all duration-700 ease-out group-hover:scale-105"
              priority={index === 0}
              sizes="100vw"
              unoptimized
            />
          </div>
        </div>
      ))}
    </div>
  );

  // Si tiene link, envolver en Link
  if (currentBanner.link) {
    return (
      <Link href={currentBanner.link} className="block w-full">
        {bannerContent}
      </Link>
    );
  }

  return bannerContent;
}
