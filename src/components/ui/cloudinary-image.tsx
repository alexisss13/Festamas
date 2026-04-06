'use client';

import Image, { ImageProps } from 'next/image';
import cloudinaryLoader from '@/lib/cloudinaryLoader';

interface CloudinaryImageProps extends Omit<ImageProps, 'src' | 'loader'> {
  publicId: string;
  quality?: number;
}

/**
 * Componente optimizado para mostrar imágenes de Cloudinary
 * 
 * Ventajas:
 * - Usa el loader de Cloudinary para optimización automática
 * - Formato automático (WebP/AVIF)
 * - Compresión inteligente
 * - Responsive automático
 * 
 * Uso:
 * <CloudinaryImage 
 *   publicId="uploads/abc123" 
 *   width={800} 
 *   height={600} 
 *   alt="Producto"
 * />
 */
export default function CloudinaryImage({ 
  publicId, 
  quality,
  ...props 
}: CloudinaryImageProps) {
  const safeSrc = publicId.startsWith('http') || publicId.startsWith('/') ? publicId : `/${publicId}`;

  return (
    <Image
      loader={(loaderProps) => cloudinaryLoader({ ...loaderProps, quality })}
      src={safeSrc}
      {...props}
    />
  );
}
