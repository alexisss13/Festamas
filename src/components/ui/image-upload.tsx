'use client';

import { useEffect, useRef } from 'react';
import { CldUploadWidget } from 'next-cloudinary';
import { Button } from '@/components/ui/button';
import { ImagePlus, Trash, X } from 'lucide-react';
import Image from 'next/image';

interface ImageUploadProps {
  value: string[];
  onChange: (value: string[]) => void;
  disabled?: boolean;
}

export default function ImageUpload({ value, onChange, disabled }: ImageUploadProps) {
  
  const valueRef = useRef(value);

  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onUpload = (result: any) => {
    onChange([...valueRef.current, result.info.secure_url]);
  };

  const onRemove = (url: string) => {
    onChange(value.filter((current) => current !== url));
  };

  return (
    <div>
      <div className="mb-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
        {value.map((url) => {
          // 🛡️ Protección: Si la URL está vacía, no renderizamos nada para evitar el error de Next/Image
          if (!url) return null; 

          return (
            <div key={url} className="relative aspect-square w-full overflow-hidden rounded-md border border-slate-200 group">
              <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button 
                  type="button" 
                  onClick={() => onRemove(url)} 
                  variant="destructive" 
                  size="icon"
                  className="h-6 w-6 shadow-sm"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
              <Image 
                  fill 
                  className="object-cover" 
                  alt="Imagen banner" 
                  src={url} 
              />
            </div>
          );
        })}
      </div>
      
      <CldUploadWidget 
        uploadPreset="fiestasya_preset" // Asegúrate que este preset exista en tu Cloudinary
        onSuccess={onUpload}
        options={{
            maxFiles: 1, // Limitamos a 1 porque es un banner
            resourceType: "image"
        }}
      >
        {({ open }) => {
          return (
            <Button
              type="button"
              disabled={disabled}
              variant="secondary"
              onClick={() => open()}
              className="w-full"
            >
              <ImagePlus className="h-4 w-4 mr-2" />
              Subir Imagen
            </Button>
          );
        }}
      </CldUploadWidget>
    </div>
  );
}