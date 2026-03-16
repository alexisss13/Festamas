'use client';

import { useState } from 'react';
import Image from 'next/image';
import { BookOpen, ExternalLink, Package } from 'lucide-react';
import { useUIStore } from '@/store/ui';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';



// 📚 MOCK DATA: Aquí agregarás todos tus catálogos futuros
// Podrás conectarlo a tu base de datos después, por ahora lee desde este arreglo.
const CATALOGS = [
  {
    id: '1',
    title: 'Catálogo Cuidado Personal 2026',
    coverImage: '/images/auth-bg.jpg', // 🔥 Cambia esto por la URL de la imagen de portada de tu catálogo
    iframeUrl: 'https://player.flipsnack.com?hash=QTVGOUJGRDZBRUQreG4zYjgzdXJ6cA==',
    division: 'JUGUETERIA' // Festamás
  },
  {
    id: '2',
    title: 'Catálogo Juguetes de Verano',
    coverImage: '/images/auth-bg.jpg', // 🔥 Reemplazar portada
    iframeUrl: 'https://www.flipsnack.com/85BC8BAA9F7/cat-logo-cuidado-personal-5/full-view.html',
    division: 'JUGUETERIA' // Festamás
  },
  {
    id: '3',
    title: 'Catálogo Globos Crome Premium',
    coverImage: '/images/auth-bg.jpg', // 🔥 Reemplazar portada
    iframeUrl: 'https://www.flipsnack.com/85BC8BAA9F7/cat-logo-cuidado-personal-5/full-view.html',
    division: 'FIESTAS' // FiestasYa
  },
  {
    id: '4',
    title: 'Catálogo Decoración Neón',
    coverImage: '/images/auth-bg.jpg', // 🔥 Reemplazar portada
    iframeUrl: 'https://www.flipsnack.com/85BC8BAA9F7/cat-logo-cuidado-personal-5/full-view.html',
    division: 'FIESTAS' // FiestasYa
  }
];

export default function CatalogosPage() {
  const currentDivision = useUIStore((state) => state.currentDivision);
  
  // Estado para controlar qué pestaña está activa (inicia en la tienda donde el usuario está navegando)
  const [activeTab, setActiveTab] = useState<'FIESTAS' | 'JUGUETERIA'>(currentDivision);

  // Filtramos los catálogos según la pestaña seleccionada
  const filteredCatalogs = CATALOGS.filter(c => c.division === activeTab);

  const isToys = activeTab === 'JUGUETERIA';

  return (
    <main className="min-h-screen bg-slate-50 py-8 md:py-12">
      <div className="container mx-auto px-4 max-w-6xl flex flex-col gap-6 md:gap-8">

        {/* 📝 CABECERA */}
        <div className="flex flex-col items-center text-center space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="p-3 md:p-4 bg-white shadow-sm rounded-full text-slate-600 mb-1 md:mb-2">
            <BookOpen className="w-6 h-6 md:w-8 md:h-8" />
          </div>
          <h1 className="text-2xl md:text-4xl font-bold text-slate-800 tracking-tight">
            Nuestros Catálogos
          </h1>
          <p className="text-[13px] md:text-base text-slate-500 max-w-xl px-4">
            Explora nuestras colecciones completas. Haz clic en cualquier catálogo para hojearlo en pantalla completa.
          </p>
        </div>

        {/* 🗂️ TABS DE NAVEGACIÓN (Festamás / FiestasYa) */}
        <div className="flex justify-center border-b border-slate-200 mt-2 mb-4">
          <div className="flex gap-4 md:gap-12">
            <button
              onClick={() => setActiveTab('FIESTAS')}
              className={cn(
                "pb-3 px-2 text-[13px] md:text-base font-bold uppercase tracking-wider transition-all relative",
                activeTab === 'FIESTAS' ? "text-slate-900" : "text-slate-400 hover:text-slate-600"
              )}
            >
              Catálogos FiestasYa
              {activeTab === 'FIESTAS' && (
                <div className="absolute bottom-[-1px] left-0 w-full h-[3px] bg-[#fb3099] rounded-t-md" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('JUGUETERIA')}
              className={cn(
                "pb-3 px-2 text-[13px] md:text-base font-bold uppercase tracking-wider transition-all relative",
                activeTab === 'JUGUETERIA' ? "text-slate-900" : "text-slate-400 hover:text-slate-600"
              )}
            >
              Catálogos Festamás
              {activeTab === 'JUGUETERIA' && (
                <div className="absolute bottom-[-1px] left-0 w-full h-[3px] bg-[#fc4b65] rounded-t-md" />
              )}
            </button>
          </div>
        </div>

        {/* 📚 GRILLA DE CATÁLOGOS */}
        {filteredCatalogs.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 animate-in fade-in duration-500">
            {filteredCatalogs.map((catalog) => (
              <Dialog key={catalog.id}>
                <Card className="overflow-hidden group hover:shadow-xl transition-all duration-300 border-slate-200 bg-white rounded-2xl flex flex-col h-full cursor-pointer">
                  
                  {/* Portada del Catálogo */}
                  <DialogTrigger asChild>
                    <div className="relative aspect-[3/4] w-full bg-slate-100 overflow-hidden">
                      <Image
                        src={catalog.coverImage}
                        alt={catalog.title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      {/* Efecto de lupa al pasar el mouse */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <div className="bg-white/95 backdrop-blur-sm p-3 rounded-full shadow-xl transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                            <ExternalLink className="w-5 h-5 text-slate-800" />
                        </div>
                      </div>
                    </div>
                  </DialogTrigger>

                  {/* Info del Catálogo */}
                  <CardContent className="p-3 md:p-4 flex-1 flex flex-col justify-center text-center">
                    <h3 className="font-bold text-[13px] md:text-sm text-slate-800 line-clamp-2 leading-tight">
                      {catalog.title}
                    </h3>
                  </CardContent>

                  {/* Botón de Acción */}
                  <CardFooter className="p-3 md:p-4 pt-0">
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full h-9 md:h-10 rounded-xl border-2 font-bold text-[11px] md:text-[13px] transition-all uppercase tracking-wide",
                          isToys 
                            ? "border-[#fc4b65] text-[#fc4b65] hover:bg-[#fc4b65] hover:text-white" 
                            : "border-[#fb3099] text-[#fb3099] hover:bg-[#fb3099] hover:text-white"
                        )}
                      >
                        Abrir catálogo
                      </Button>
                    </DialogTrigger>
                  </CardFooter>
                </Card>

                {/* 📖 MODAL DEL VISOR (Iframe Flipsnack) */}
                <DialogContent className="max-w-[95vw] md:max-w-[1200px] w-full h-[85vh] md:h-[90vh] p-0 overflow-hidden bg-slate-100 border-none rounded-2xl md:rounded-3xl shadow-2xl">
                  <DialogTitle className="sr-only">Visor de {catalog.title}</DialogTitle>
                  <div className="w-full h-full relative">
                    {/* Botón de cierre nativo de shadcn ya está incluido en DialogContent */}
                    <iframe
                      src={catalog.iframeUrl}
                      width="100%"
                      height="100%"
                      seamless
                      scrolling="no"
                      frameBorder="0"
                      allowFullScreen
                      className="absolute inset-0 w-full h-full"
                      title={catalog.title}
                    />
                  </div>
                </DialogContent>
              </Dialog>
            ))}
          </div>
        ) : (
            <div className="text-center py-20 animate-in fade-in">
                <Package className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500 font-medium">Aún no hay catálogos disponibles para esta sección.</p>
            </div>
        )}

      </div>
    </main>
  );
}