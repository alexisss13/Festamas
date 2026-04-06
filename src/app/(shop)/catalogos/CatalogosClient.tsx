'use client';

import Image from 'next/image';
import { ExternalLink, Package } from 'lucide-react';
import { useUIStore } from '@/store/ui';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { Catalog } from '@prisma/client';

interface Props {
  catalogs: Catalog[];
}

export default function CatalogosClient({ catalogs }: Props) {
  const activeBranchId = useUIStore((state) => state.activeBranchId);
  const branches = useUIStore((state) => state.branches);
  
  const activeBranch = branches.find(b => b.id === activeBranchId);
  const filteredCatalogs = catalogs.filter(c => c.branchId === activeBranchId || !c.branchId);

  return (
    <main className="min-h-screen bg-white py-6 md:py-10">
      {/* Ajustamos el contenedor para mantener los mismos márgenes del Home */}
      <div className="container mx-auto px-4 md:px-8 lg:px-10 xl:px-12 flex flex-col gap-6 md:gap-8">

        {/* 📝 CABECERA (Estilo unificado con la página principal) */}
        <div className="flex flex-col px-2 animate-in fade-in duration-700">
          <h1 className="font-medium text-[16px] md:text-[24px] leading-tight text-[#333] tracking-tight">
            Nuestros Catálogos
          </h1>
          <p className="text-[12px] md:text-[14px] text-slate-500 mt-0.5 md:mt-1 leading-tight">
            Explora nuestras colecciones completas. Haz clic en cualquier catálogo para hojearlo a pantalla completa.
          </p>
        </div>

        {/* 📚 GRILLA DE CATÁLOGOS */}
        {filteredCatalogs.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 animate-in fade-in duration-500">
            {filteredCatalogs.map((catalog) => (
              <Dialog key={catalog.id}>
                <Card className="overflow-hidden group hover:shadow-md transition-all duration-300 border-slate-200 bg-white rounded-2xl flex flex-col h-full cursor-pointer">
                  
                  {/* Portada del Catálogo */}
                  <DialogTrigger asChild>
                    <div className="relative aspect-[3/4] w-full bg-slate-50 overflow-hidden">
                      <Image
                        src={catalog.coverImage}
                        alt={catalog.title}
                        fill
                        sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <div className="bg-white/95 backdrop-blur-sm p-3 rounded-full shadow-xl transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                            <ExternalLink className="w-5 h-5 text-slate-800" />
                        </div>
                      </div>
                    </div>
                  </DialogTrigger>

                  {/* Info del Catálogo */}
                  <CardContent className="p-3 md:p-4 flex-1 flex flex-col justify-center text-left">
                    <h3 className="font-medium text-[13px] md:text-[14px] text-slate-700 line-clamp-2 leading-snug">
                      {catalog.title}
                    </h3>
                  </CardContent>

                  {/* Botón de Acción */}
                  <CardFooter className="p-3 md:p-4 pt-0">
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full h-9 md:h-10 rounded-xl border font-semibold text-[12px] md:text-[13px] transition-all uppercase tracking-wide",
                          "border-primary text-primary hover:bg-primary hover:text-white"
                        )}
                      >
                        Abrir catálogo
                      </Button>
                    </DialogTrigger>
                  </CardFooter>
                </Card>

                {/* 📖 MODAL DEL VISOR (Iframe) */}
                <DialogContent className="max-w-[95vw] md:max-w-[1200px] w-full h-[85vh] md:h-[90vh] p-0 overflow-hidden bg-slate-100 border-none rounded-2xl md:rounded-3xl shadow-2xl">
                  <DialogTitle className="sr-only">Visor de {catalog.title}</DialogTitle>
                  <div className="w-full h-full relative">
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
            <div className="text-center py-20 animate-in fade-in flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl mx-2">
                <Package className="w-10 h-10 md:w-12 md:h-12 text-slate-300 mb-3" />
                <p className="text-[13px] md:text-sm text-slate-500 font-medium">Aún no hay catálogos disponibles para esta sección.</p>
            </div>
        )}

      </div>
    </main>
  );
}