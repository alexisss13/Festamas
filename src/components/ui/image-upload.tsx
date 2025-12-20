'use client';

import { useEffect, useRef, useState } from 'react';
import { CldUploadWidget } from 'next-cloudinary';
import { Button } from '@/components/ui/button';
import { ImagePlus, X } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface ImageUploadProps {
  value: string[];
  onChange: (value: string[]) => void;
  disabled?: boolean;
  maxFiles?: number; 
  sizing?: 'cover' | 'contain' | 'banner' | 'mobile';
}

export default function ImageUpload({ 
  value, 
  onChange, 
  disabled, 
  maxFiles = 5, 
  sizing = 'cover' 
}: ImageUploadProps) {
  
  const [isMounted, setIsMounted] = useState(false);
  
  // 🧠 TRUCO DE SENIOR:
  // Usamos useRef para tener siempre acceso al valor ACTUAL del array 'value'
  // dentro del callback de Cloudinary sin depender de re-renderizados que rompen el widget.
  const valueRef = useRef(value);

  // Mantenemos la referencia sincronizada
  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Función para desbloquear el scroll forzosamente
  const unlockScroll = () => {
    document.body.style.overflow = 'auto';
    document.body.style.paddingRight = '0px'; // A veces shadcn/radix agrega padding
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onUpload = (result: any) => {
    const url = result.info.secure_url;
    
    // Lógica inteligente:
    if (maxFiles === 1) {
        // Modo Único: Reemplazamos siempre
        onChange([url]);
    } else {
        // Modo Galería (Productos):
        // Usamos valueRef.current para asegurar que AGREGAMOS a lo que ya existe
        // y no sobreescribimos con el estado antiguo.
        const newArray = [...valueRef.current, url];
        onChange(newArray);
    }
    
    // Desbloquear scroll al terminar una subida exitosa
    // (Opcional aquí, pero bueno por seguridad)
    unlockScroll(); 
  };

  const onRemove = (url: string) => {
    onChange(value.filter((current) => current !== url));
  };

  if (!isMounted) return null;

  // 🎨 Clases dinámicas
  const isSingleMode = maxFiles === 1;

  const aspectRatioClass = 
    sizing === 'banner' ? "aspect-[2.5/1]" :  
    sizing === 'mobile' ? "aspect-[9/16]" :   
    "aspect-square";                          

  const gridClasses = cn(
    "gap-4",
    (maxFiles === 1 || sizing === 'banner') 
        ? "flex flex-col w-full" 
        : "grid grid-cols-2 sm:grid-cols-3"
  );

  return (
    <div className="w-full">
      {/* 1. LISTA DE IMÁGENES CARGADAS */}
      {value.length > 0 && (
        <div className={cn("mb-4", gridClasses)}>
            {value.map((url) => {
            if (!url) return null; 

            return (
                <div key={url} className={cn("relative overflow-hidden rounded-lg border border-slate-200 bg-slate-50 w-full group", aspectRatioClass)}>
                    <div className="absolute top-2 right-2 z-20">
                        <Button 
                        type="button" 
                        onClick={() => onRemove(url)} 
                        variant="destructive" 
                        size="icon"
                        className="h-8 w-8 shadow-sm opacity-90 hover:opacity-100 transition-opacity"
                        >
                        <X className="h-4 w-4" />
                        </Button>
                    </div>
                    <Image 
                        fill 
                        className={cn(
                            "object-cover transition-transform duration-500 group-hover:scale-105", 
                            sizing === 'contain' && "object-contain"
                        )} 
                        alt="Imagen subida" 
                        src={url} 
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                </div>
            );
            })}
        </div>
      )}
      
      {/* 2. BOTÓN DE SUBIDA */}
      {value.length < maxFiles && (
        <CldUploadWidget 
            uploadPreset="fiestasya_preset" 
            onSuccess={onUpload}
            // 🛡️ FIX SCROLL: Evento crítico para desbloquear cuando se cierra el modal
            onClose={unlockScroll} 
            options={{
                maxFiles: maxFiles, // Permite seleccionar varios a la vez si maxFiles > 1
                resourceType: "image",
                multiple: maxFiles > 1,
                // sources: ['local', 'url', 'camera'], // Opcional: limitar fuentes
            }}
        >
            {({ open }) => {
            return (
                <Button
                type="button"
                disabled={disabled}
                variant="secondary"
                onClick={() => open()}
                className="w-full h-14 border-dashed border-2 border-slate-300 bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-700 hover:border-slate-400 transition-all"
                >
                <ImagePlus className="h-5 w-5 mr-2" />
                {maxFiles === 1 ? 'Subir Imagen' : 'Agregar Imágenes'}
                </Button>
            );
            }}
        </CldUploadWidget>
      )}
    </div>
  );
}