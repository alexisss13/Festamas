'use client';

import { useUIStore } from '@/store/ui';
import { MapPin, Clock, Phone, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// 📍 DATA: Ambas tiendas siempre visibles
const STORES = [
  {
    id: 'festamas',
    brand: 'Festamás',
    name: 'FESTAMÁS Trujillo',
    address: 'Av José María Eguren 132, Trujillo 13000',
    schedule: 'Lun - Sáb: 9:00 AM - 7:00 PM | Dom: 9:00 AM - 1:00 PM',
    phone: '948 679 563',
    whatsappLink: 'https://wa.me/51948679563',
    mapQuery: 'Av+José+María+Eguren+132,+Trujillo',
  },
  {
    id: 'fiestasya',
    brand: 'FiestasYa',
    name: 'FiestasYa Centro',
    address: 'Jirón Bolivar 681, Trujillo 13001',
    schedule: 'Lun - Sáb: 9:00 AM - 7:00 PM | Dom: 9:00 AM - 1:00 PM',
    phone: '948 679 563',
    whatsappLink: 'https://wa.me/51948679563',
    mapQuery: 'Jirón+Bolivar+681,+Trujillo',
  }
];

// 📱 INSTAGRAM REELS
const REELS = [
  'https://www.instagram.com/reel/DQotA_Cjsj1/embed',
  'https://www.instagram.com/reel/DRJOJUGjBI4/embed'
];

export default function TiendasPage() {
  // Tema reactivo que aplicará a los íconos y botones de AMBAS tarjetas
  const theme = {
    text: 'text-primary',
    bg: 'bg-primary',
    hover: 'hover:opacity-90',
  };

  return (
    // 🔥 FIX: Aseguramos que el main sea bg-white puro
    <main className="min-h-screen bg-white pb-24">
      {/* Contenedor idéntico al de Home */}
      <div className="container mx-auto px-4 md:px-8 lg:px-10 xl:px-12 mt-8 md:mt-12 space-y-12 md:space-y-16">

        {/* 📍 SECCIÓN 1: TIENDAS FÍSICAS */}
        <section className="animate-in fade-in duration-700">
          
          {/* Cabecera unificada (Calco de Home) */}
          <div className="flex items-end justify-between mb-4 px-2">
            <div className="flex flex-col">
              <h2 className="font-medium text-[16px] md:text-[24px] leading-tight text-[#333] tracking-tight">
                Nuestras Tiendas
              </h2>
              <p className="text-[12px] md:text-[14px] text-slate-500 mt-0.5 md:mt-1 leading-tight">
                Encuentra nuestra ubicación más cercana y ven a visitarnos.
              </p>
            </div>
          </div>

          {/* Grilla de Tiendas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-2">
            {STORES.map((store) => (
              <div key={store.id} className="flex flex-col bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-md transition-shadow duration-300">
                
                {/* Info Textual */}
                <div className="p-4 md:p-6 flex flex-col gap-4">
                  <h3 className="font-medium text-[16px] md:text-[18px] leading-tight text-[#333] tracking-tight">
                    {store.name}
                  </h3>

                  <div className="flex flex-col gap-3">
                    <div className="flex items-start gap-2.5">
                      <MapPin className={cn("w-4 h-4 shrink-0 mt-0.5", theme.text)} />
                      <span className="text-[13px] md:text-[14px] leading-tight text-slate-600">
                        {store.address}
                      </span>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <Clock className={cn("w-4 h-4 shrink-0 mt-0.5", theme.text)} />
                      <div className="flex flex-col">
                        <span className="text-[13px] md:text-[14px] leading-tight text-slate-600">
                            {store.schedule.split(' | ')[0]}
                        </span>
                        <span className="text-[12px] md:text-[13px] leading-tight text-slate-400 mt-0.5">
                            {store.schedule.split(' | ')[1]}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <Phone className={cn("w-4 h-4 shrink-0", theme.text)} />
                      <a href={store.whatsappLink} target="_blank" rel="noopener noreferrer" className="text-[13px] md:text-[14px] leading-tight text-slate-600 hover:text-slate-900 transition-colors">
                        {store.phone}
                      </a>
                    </div>
                  </div>

                  <Button 
                    asChild
                    className={cn(
                      "w-full sm:w-fit mt-2 h-9 md:h-10 px-6 font-medium text-[13px] rounded-xl transition-all",
                      theme.bg, 
                      theme.hover,
                      "text-white shadow-sm"
                    )}
                  >
                    <a href={`https://maps.google.com/maps?q=${store.mapQuery}&t=&z=16&ie=UTF8&iwloc=&output=embed`} target="_blank" rel="noopener noreferrer">
                      <Navigation className="w-4 h-4 mr-2" />
                      Cómo llegar
                    </a>
                  </Button>
                </div>

                {/* Iframe del Mapa */}
                {/* 🔥 FIX: Eliminado el bg-slate-50 y cambiado a bg-white para que sea contínuo */}
                <div className="h-[250px] w-full border-t border-slate-100 bg-white relative">
                  <iframe 
                    src={`https://maps.google.com/maps?q=${store.mapQuery}&t=&z=16&ie=UTF8&iwloc=&output=embed`}
                    width="100%" 
                    height="100%" 
                    style={{ border: 0 }} 
                    allowFullScreen={false} 
                    loading="lazy" 
                    referrerPolicy="no-referrer-when-downgrade"
                    className="absolute inset-0 w-full h-full grayscale-[15%] contrast-105"
                    title={`Mapa de ${store.name}`}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 📱 SECCIÓN 2: INSTAGRAM REELS */}
        <section className="animate-in fade-in duration-700 delay-150">
          
          {/* Cabecera unificada */}
          <div className="flex items-end justify-between mb-4 px-2">
            <div className="flex flex-col">
              <h2 className="font-medium text-[16px] md:text-[24px] leading-tight text-[#333] tracking-tight">
                Conoce nuestra tienda
              </h2>
              <p className="text-[12px] md:text-[14px] text-slate-500 mt-0.5 md:mt-1 leading-tight">
                Un pequeño recorrido por nuestras instalaciones en redes sociales.
              </p>
            </div>
          </div>

          {/* Grilla de Reels */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 px-2">
            {REELS.map((reelUrl, idx) => (
              <div key={idx} className="bg-white border border-slate-200 rounded-2xl overflow-hidden aspect-[9/16] relative flex justify-center w-full max-w-[350px] mx-auto md:mx-0 shadow-sm">
                  <iframe 
                      src={reelUrl} 
                      className="absolute top-0 left-0 w-full h-full" 
                      frameBorder="0" 
                      scrolling="no" 
                  />
              </div>
            ))}
          </div>

        </section>

      </div>
    </main>
  );
}