'use client';

import Link from 'next/link';
import Image from 'next/image';
import cloudinaryLoader from '@/lib/cloudinaryLoader';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { AddToCartButton } from './AddToCartButton';
import { FavoriteButton } from './FavoriteButton';
import { cn } from '@/lib/utils';
import { Package, AlertCircle } from 'lucide-react';
import { useUIStore } from '@/store/ui';

interface ProductCardProps {
  product: {
    id: string;
    title: string;
    slug: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    price: any;
    stock: number;
    images: string[];
    isAvailable: boolean;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    wholesalePrice?: any;
    wholesaleMinCount?: number | null;
    discountPercentage: number;
    tags: string[];
    createdAt: Date;
    division?: string;
  };
}

export function ProductCard({ product }: ProductCardProps) {
  
  const theme = {
        brandText: 'text-primary',
        discountBadge: 'bg-primary text-white',
      };

  // Función para extraer public_id
  const getPublicId = (url: string): string => {
    if (!url || url.trim() === '') return '';
    if (!url.includes('res.cloudinary.com')) return url;
    
    try {
      const parts = url.split('/upload/');
      if (parts.length < 2) return url;
      
      const pathAfterUpload = parts[1];
      const pathParts = pathAfterUpload.split('/');
      const withoutVersion = pathParts.filter(part => !part.startsWith('v') || part.length < 10);
      return withoutVersion.join('/').split('.')[0];
    } catch {
      return url;
    }
  };

  // --- Lógica de Precios ---
  const price = Number(product.price) || 0;
  const wholesalePrice = product.wholesalePrice ? Number(product.wholesalePrice) : 0;
  const discount = product.discountPercentage || 0;
  const hasDiscount = discount > 0;
  const finalPrice = hasDiscount ? price * (1 - discount / 100) : price;
  const isOutOfStock = product.stock <= 0;
  const hasWholesale = wholesalePrice > 0;

  return (
    <Card className={cn(
        "group relative flex flex-col h-full overflow-hidden transition-all duration-300 bg-white border border-slate-200 rounded-2xl",
        "hover:shadow-md"
    )}>
      
      {/* 🛡️ ÁREA DE IMAGEN */}
      <div className="relative aspect-square w-full overflow-hidden bg-slate-50/50">
          
          {/* Etiqueta Superior (Solo Agotado) */}
          <div className="absolute top-3 left-3 z-10 flex flex-col gap-2 pointer-events-none">
              {isOutOfStock && (
                  <div className="bg-slate-900/90 backdrop-blur-sm text-white text-[11px] font-bold px-3 py-1 rounded-full shadow-sm tracking-wide">
                      AGOTADO
                  </div>
              )}
          </div>

          <FavoriteButton 
              productId={product.id} 
              className="absolute top-3 right-3 z-30 shadow-sm bg-white/90 backdrop-blur-sm hover:bg-white"
          />

          {/* ENLACE DE IMAGEN */}
          <Link href={`/product/${product.slug}`} className="block w-full h-full">
            {product.images[0] ? (
                <Image
                    loader={cloudinaryLoader}
                    src={getPublicId(product.images[0])}
                    alt={product.title}
                    fill
                    className={cn(
                        "object-contain p-5 transition-transform duration-500 group-hover:scale-105",
                        isOutOfStock && "opacity-50 grayscale"
                    )}
                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
                />
            ) : (
                <div className="flex h-full w-full items-center justify-center text-slate-300">
                    <Package className="w-12 h-12 opacity-20" />
                </div>
            )}
          </Link>
      </div>

      {/* 📝 ÁREA DE CONTENIDO */}
      {/* 🔥 FIX: Reducimos padding en móvil (p-3) para dar más ancho al texto */}
      <CardContent className="flex flex-col flex-1 p-3 md:p-4 pt-3 md:pt-4 gap-1.5">
        
        {/* Alerta de Stock */}
        {!isOutOfStock && product.stock > 0 && product.stock < 5 && (
            <div className="flex mb-0.5">
                <div className="flex items-center gap-1 text-[9px] font-semibold text-orange-600 bg-orange-100 px-1.5 py-0.5 rounded-md">
                    <AlertCircle className="w-2.5 h-2.5" />
                    ¡Solo {product.stock}!
                </div>
            </div>
        )}

        {/* Título del Producto */}
        <Link href={`/product/${product.slug}`} title={product.title} className="mb-1">
            {/* 🔥 FIX: Letra un poco más pequeña en móvil (text-[12px]) */}
            <h3 className="text-[12px] md:text-[14px] font-medium text-slate-700 leading-tight md:leading-snug line-clamp-2">
                {product.title}
            </h3>
        </Link>

        {/* Espaciador flexible para asegurar que los precios se alineen abajo */}
        <div className="flex-1" />

        {/* 💰 BLOQUE DE PRECIOS EN CASCADA (Vertical) */}
        <div className="flex flex-col mt-1 md:mt-2">
            
            {/* 1. Precio Original (Tachado, solo si hay descuento) */}
            {hasDiscount && (
                <span className="text-[10px] md:text-[12px] font-medium text-slate-400 line-through leading-none mb-0.5 md:mb-1">
                    S/ {price.toFixed(2)}
                </span>
            )}

            {/* 2. Precio Final (Regular o con Descuento) */}
            <div className="flex items-center gap-1.5 md:gap-2 mb-1">
                <span className="text-[16px] md:text-[19px] font-bold text-slate-800 leading-none">
                    S/ {finalPrice.toFixed(2)}
                </span>
                
                {/* Etiqueta de Descuento integrada al precio */}
                {hasDiscount && (
                    <span className={cn(
                        // 🔥 FIX: Padding y tamaño más compacto en móvil
                        "text-[9px] md:text-[10px] font-bold px-1 md:px-1.5 py-0.5 rounded leading-none shadow-sm", 
                        theme.discountBadge
                    )}>
                        {discount}% OFF
                    </span>
                )}
            </div>

            {/* 3. Precio Mayorista */}
            {hasWholesale && !isOutOfStock && (
                 <div className="flex items-center flex-wrap gap-x-1 mt-0.5 leading-none">
                    {/* 🔥 FIX: Textos abreviados ("x Mayor" y "Mín.") y tamaños micro en móvil para evitar que salte de línea */}
                    <span className={cn("text-[9px] md:text-[11px] font-medium uppercase tracking-tight", theme.brandText)}>
                        x Mayor:
                    </span>
                    <span className={cn("text-[11px] md:text-[13px] font-bold", theme.brandText)}>
                        S/ {wholesalePrice.toFixed(2)}
                    </span>
                    <span className="text-[8px] md:text-[10px] font-medium text-slate-500 ml-0.5">
                        (Mín. {product.wholesaleMinCount || 3})
                    </span>
                </div>
            )}
        </div>
      </CardContent>

      <CardFooter className="p-3 md:p-4 pt-0">
        <AddToCartButton 
            product={product as any} 
            disabled={isOutOfStock}
            className="w-full h-9 md:h-10 text-[12px] md:text-[13px] font-semibold rounded-xl shadow-sm hover:shadow-md transition-all active:scale-95"
        />
      </CardFooter>
    </Card>
  );
}