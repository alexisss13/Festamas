'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ImagePlus, X, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import cloudinaryLoader from '@/lib/cloudinaryLoader';

interface ImageUploadProps {
  value: string[]; // Array de public_ids o URLs (se convertirán automáticamente)
  onChange: (value: string[]) => void;
  disabled?: boolean;
  maxFiles?: number;
  sizing?: 'cover' | 'contain' | 'banner' | 'mobile';
}

/**
 * Componente de Upload Manual a Cloudinary (SIN WIDGET)
 * 
 * - Sube directamente a Cloudinary API
 * - Guarda public_ids en lugar de URLs
 * - UI totalmente personalizable
 * - Sin dependencias de next-cloudinary
 */
export default function ImageUpload({
  value,
  onChange,
  disabled,
  maxFiles = 5,
  sizing = 'cover'
}: ImageUploadProps) {
  
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  // Filtrar valores vacíos o inválidos
  const validValues = value.filter(item => item && item.trim() !== '');

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
      
      if (!cloudName) {
        throw new Error('NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME no está configurado');
      }

      const uploadPromises = Array.from(files).map(async (file, index) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', 'fiestasya_preset');
        formData.append('folder', 'uploads');

        const res = await fetch(
          `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
          {
            method: 'POST',
            body: formData
          }
        );

        if (!res.ok) {
          const error = await res.json();
          throw new Error(error.error?.message || 'Error al subir imagen');
        }

        const data = await res.json();
        
        // Actualizar progreso
        setUploadProgress(((index + 1) / files.length) * 100);
        
        return data.public_id; // Retornamos solo el public_id
      });

      const publicIds = await Promise.all(uploadPromises);

      // Actualizar el estado
      if (maxFiles === 1) {
        onChange([publicIds[0]]);
      } else {
        // Filtrar valores vacíos antes de agregar
        const currentValid = value.filter(v => v && v.trim() !== '');
        onChange([...currentValid, ...publicIds]);
      }

    } catch (error) {
      console.error('Error uploading images:', error);
      alert(error instanceof Error ? error.message : 'Error al subir las imágenes. Intenta de nuevo.');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      // Limpiar el input
      e.target.value = '';
    }
  };

  const onRemove = (item: string) => {
    onChange(value.filter((current) => current !== item));
  };

  // Función para extraer public_id de URLs antiguas
  const getPublicId = (urlOrId: string): string => {
    if (!urlOrId.includes('res.cloudinary.com')) {
      return urlOrId; // Ya es un public_id
    }
    
    // Extraer public_id de URL completa
    try {
      const parts = urlOrId.split('/upload/');
      if (parts.length < 2) return urlOrId;
      
      const pathParts = parts[1].split('/');
      const withoutVersion = pathParts.filter(part => !part.startsWith('v'));
      return withoutVersion.join('/').split('.')[0];
    } catch {
      return urlOrId;
    }
  };

  const aspectRatioClass =
    sizing === 'banner' ? 'aspect-[2.5/1]' :
    sizing === 'mobile' ? 'aspect-[9/16]' :
    'aspect-square';

  const gridClasses = cn(
    'gap-4',
    (maxFiles === 1 || sizing === 'banner')
      ? 'flex flex-col w-full'
      : 'grid grid-cols-2 sm:grid-cols-3'
  );

  return (
    <div className="w-full">
      {/* LISTA DE IMÁGENES CARGADAS */}
      {validValues.length > 0 && (
        <div className={cn('mb-4', gridClasses)}>
          {validValues.map((item) => {
            if (!item || item.trim() === '') return null;

            const publicId = getPublicId(item);
            
            // No renderizar si el publicId está vacío
            if (!publicId || publicId.trim() === '') return null;

            return (
              <div
                key={item}
                className={cn(
                  'relative overflow-hidden rounded-lg border border-slate-200 bg-slate-50 w-full group',
                  aspectRatioClass
                )}
              >
                <div className="absolute top-2 right-2 z-20">
                  <Button
                    type="button"
                    onClick={() => onRemove(item)}
                    variant="destructive"
                    size="icon"
                    className="h-8 w-8 shadow-sm opacity-90 hover:opacity-100 transition-opacity"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <Image
                  loader={cloudinaryLoader}
                  src={publicId}
                  fill
                  className={cn(
                    'object-cover transition-transform duration-500 group-hover:scale-105',
                    sizing === 'contain' && 'object-contain'
                  )}
                  alt="Imagen subida"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>
            );
          })}
        </div>
      )}

      {/* BOTÓN DE SUBIDA */}
      {validValues.length < maxFiles && (
        <div className="relative">
          <input
            type="file"
            id="image-upload-input"
            accept="image/*"
            multiple={maxFiles > 1}
            onChange={handleFileChange}
            disabled={disabled || isUploading}
            className="hidden"
          />
          <label htmlFor="image-upload-input">
            <Button
              type="button"
              disabled={disabled || isUploading}
              variant="secondary"
              className="w-full h-14 border-dashed border-2 border-slate-300 bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-700 hover:border-slate-400 transition-all cursor-pointer"
              asChild
            >
              <div>
                {isUploading ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Subiendo... {Math.round(uploadProgress)}%
                  </>
                ) : (
                  <>
                    <ImagePlus className="h-5 w-5 mr-2" />
                    {maxFiles === 1 ? 'Subir Imagen' : 'Agregar Imágenes'}
                  </>
                )}
              </div>
            </Button>
          </label>
        </div>
      )}
    </div>
  );
}
