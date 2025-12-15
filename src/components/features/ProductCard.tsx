'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AddToCartButton } from './AddToCartButton';
import { cn } from '@/lib/utils';

interface ProductCardProps {
  product: {
    id: string;
    title: string;
    slug: string;
    price: any;
    stock: number;
    images: string[];
    isAvailable: boolean;
    wholesalePrice?: any;
    wholesaleMinCount?: number | null;
    discountPercentage: number;
    tags: string[];
    createdAt: Date;
    division?: string;
  };
}

export function ProductCard({ product }: ProductCardProps) {
  
  // 1. COLORES SEGÚN TIENDA
  const isFestamas = product.division === 'JUGUETERIA';
  const discountBg = isFestamas ? 'bg-[#fc4b65]' : 'bg-[#ec4899]';
  const wholesaleText = isFestamas ? 'text-[#fc4b65]' : 'text-[#ec4899]';
  const wholesaleBorder = isFestamas ? 'border-red-100' : 'border-fuchsia-100';
  const wholesaleBg = isFestamas ? 'bg-red-50' : 'bg-fuchsia-50';

  // 2. LÓGICA DE PRECIOS
  const price = Number(product.price) || 0;
  const wholesalePrice = product.wholesalePrice ? Number(product.wholesalePrice) : 0;
  const discount = product.discountPercentage || 0;
  
  const hasDiscount = discount > 0;
  const finalPrice = hasDiscount ? price * (1 - discount / 100) : price;
  const isOutOfStock = product.stock <= 0;

  return (
    <Card className="group h-full flex flex-col border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300 rounded-lg overflow-hidden bg-white">
      
      {/* 1. IMAGEN (Cuadrada y Limpia) */}
      <div className="relative aspect-square bg-white p-2 overflow-hidden">
        
        {/* Badges Superiores */}
        <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
            {hasDiscount && (
                <Badge className={cn("text-white font-bold text-[10px] px-1.5 h-5 border-0 shadow-sm", discountBg)}>
                    -{discount}%
                </Badge>
            )}
            {isOutOfStock && (
                <Badge variant="secondary" className="bg-slate-900 text-white text-[10px] px-1.5 h-5">
                    AGOTADO
                </Badge>
            )}
        </div>

        <Link href={`/product/${product.slug}`} className="block h-full w-full">
            {product.images[0] ? (
                <Image
                    src={product.images[0]}
                    alt={product.title}
                    fill
                    className={cn(
                        "object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-105",
                        isOutOfStock && "opacity-50 grayscale"
                    )}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
            ) : (
                <div className="flex h-full w-full items-center justify-center bg-slate-50 text-slate-300 text-xs">
                    Sin Foto
                </div>
            )}
        </Link>
      </div>

      {/* 2. CONTENIDO (Compacto) */}
      <CardContent className="p-3 flex-1 flex flex-col gap-1.5">
        
        {/* Marca/Tienda */}
        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
            {isFestamas ? 'FESTAMAS' : 'FIESTASYA'}
        </span>

        {/* Título */}
        <Link href={`/product/${product.slug}`} className="mb-1">
            <h3 className="text-xs sm:text-sm font-medium text-slate-700 leading-tight line-clamp-2 h-[2.4em] group-hover:text-black transition-colors" title={product.title}>
                {product.title}
            </h3>
        </Link>

        {/* Precios */}
        <div className="mt-auto">
            {/* Precio Anterior Tachado */}
            {hasDiscount && (
                <div className="text-[10px] text-slate-400 line-through mb-0.5">
                    S/ {price.toFixed(2)}
                </div>
            )}
            
            {/* Precio Actual Gigante */}
            <div className={cn("text-lg font-bold leading-none", hasDiscount ? "text-red-600" : "text-slate-900")}>
                S/ {finalPrice.toFixed(2)}
            </div>

            {/* Oportunidad Mayorista */}
            {wholesalePrice > 0 && (
                <div className={cn("mt-2 flex items-center justify-between rounded border px-2 py-1", wholesaleBg, wholesaleBorder)}>
                    <div className="flex flex-col leading-none">
                        <span className={cn("text-[9px] font-bold uppercase", wholesaleText)}>
                            x Mayor
                        </span>
                        <span className="text-xs font-bold text-slate-900">
                            S/ {wholesalePrice.toFixed(2)}
                        </span>
                    </div>
                    <div className="bg-white/60 px-1 rounded text-[9px] font-bold text-slate-600">
                        Min {product.wholesaleMinCount || 3}
                    </div>
                </div>
            )}
        </div>
      </CardContent>

      {/* 3. BOTÓN */}
      <CardFooter className="p-3 pt-0">
        <div className="w-full">
            <AddToCartButton 
                product={product as any} 
                disabled={isOutOfStock}
                className={cn(
                    "w-full h-9 text-xs font-bold shadow-none transition-colors",
                    isFestamas 
                        ? "bg-slate-900 hover:bg-[#fc4b65]" 
                        : "bg-slate-900 hover:bg-[#ec4899]"
                )}
            />
        </div>
      </CardFooter>
    </Card>
  );
}