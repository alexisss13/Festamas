import Link from 'next/link';
import Image from 'next/image';
import { Banner } from '@prisma/client';
import { Button } from '@/components/ui/button';

interface Props {
  banner: Banner | null;
}

export function PromoBanner({ banner }: Props) {
  if (!banner) return null;

  return (
    <section className="relative w-full aspect-[21/9] md:aspect-[32/9] overflow-hidden rounded-2xl bg-slate-900 group">
      {/* Imagen Background */}
      <Image
        src={banner.imageUrl}
        alt={banner.title}
        fill
        className="object-cover opacity-90 transition-transform duration-700 group-hover:scale-105"
      />
      
      {/* Contenido (Centrado) */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 bg-black/20">
        <h2 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight drop-shadow-lg mb-6">
          {banner.title}
        </h2>
        
        {banner.link && (
          <Button asChild size="lg" className="bg-white text-black hover:bg-slate-100 font-bold rounded-full px-8">
            <Link href={banner.link}>
              Ver Promoción
            </Link>
          </Button>
        )}
      </div>
    </section>
  );
}