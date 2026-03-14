'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { AddToCartButton } from './AddToCartButton';
import { FavoriteButton } from './FavoriteButton';
import { cn } from '@/lib/utils';
import { Tag, Package, AlertCircle } from 'lucide-react';
import { useUIStore } from '@/store/ui'; // 🔥 IMPORTAMOS EL ESTADO GLOBAL

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
  
  // --- Lógica de Tienda y Temas ---
  // 🔥 Leemos la tienda ACTIVA en la que el usuario está navegando
  const currentDivision = useUIStore((state) => state.currentDivision);
  const isActiveFestamas = currentDivision === 'JUGUETERIA';

  // Mantenemos el nombre original de la marca del producto por si queremos mostrarlo
  const isProductFestamas = product.division === 'JUGUETERIA' || !product.division;
  const brandName = isProductFestamas ? 'Festamás' : 'FiestasYa';

  // 🔥 El TEMA visual ahora depende exclusivamente de la pestaña activa
  const theme = isActiveFestamas 
    ? {
        brandText: 'text-[#fc4b65]',
        titleHover: 'group-hover:text-[#fc4b65]',
        cardBorder: 'hover:border-[#fc4b65]/30',
        discountBadge: 'bg-[#fc4b65] text-white',
      }
    : {
        brandText: 'text-[#fb3099]',
        titleHover: 'group-hover:text-[#fb3099]',
        cardBorder: 'hover:border-[#fb3099]/30',
        discountBadge: 'bg-[#fb3099] text-white',
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
        "group relative flex flex-col h-full overflow-hidden transition-all duration-500 bg-white border border-slate-200 rounded-2xl",
        "hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:-translate-y-1",
        theme.cardBorder
    )}>
      
      {/* 🛡️ ÁREA DE IMAGEN */}
      <div className="relative aspect-square w-full overflow-hidden bg-slate-50/50">
          
          {/* Etiquetas Superiores */}
          <div className="absolute top-3 left-3 z-10 flex flex-col gap-2 pointer-events-none">
              {isOutOfStock ? (
                  <div className="bg-slate-900/90 backdrop-blur-sm text-white text-[11px] font-black px-3 py-1 rounded-full shadow-sm tracking-wide">
                      AGOTADO
                  </div>
              ) : hasDiscount && (
                  <div className={cn("text-[11px] font-black px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1", theme.discountBadge)}>
                      <Tag className="w-3 h-3" strokeWidth={3} />
                      -{discount}%
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
                    src={product.images[0]}
                    alt={product.title}
                    fill
                    className={cn(
                        "object-contain p-5 transition-all duration-700 group-hover:scale-110",
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
      <CardContent className="flex flex-col flex-1 p-4 pt-3 gap-1.5">
        
        {/* Marca y Alerta de Stock */}
        <div className="flex items-start justify-between gap-2 min-h-[20px]">
            <span className={cn("text-[10px] font-black uppercase tracking-widest", theme.brandText)}>
                {brandName}
            </span>
            
            {!isOutOfStock && product.stock > 0 && product.stock < 5 && (
                <div className="flex items-center gap-1 text-[9px] font-bold text-orange-600 bg-orange-100 px-1.5 py-0.5 rounded-md">
                    <AlertCircle className="w-2.5 h-2.5" />
                    ¡Solo {product.stock}!
                </div>
            )}
        </div>

        {/* Título del Producto */}
        <Link href={`/product/${product.slug}`} title={product.title} className="mb-1">
            <h3 className={cn(
                "text-sm font-bold text-slate-800 leading-snug line-clamp-2 transition-colors duration-300",
                theme.titleHover
            )}>
                {product.title}
            </h3>
        </Link>

        <div className="flex-1" />

        {/* 💰 BLOQUE DE PRECIOS */}
        <div className="flex flex-col gap-1 mt-2">
            
            {/* Precio Regular */}
            <div className="flex items-end gap-2 flex-wrap leading-none">
                <span className="text-xl font-black text-slate-900 tracking-tight">
                    S/ {finalPrice.toFixed(2)}
                </span>
                {hasDiscount && (
                    <span className="text-xs font-semibold text-slate-400 line-through mb-[3px]">
                        S/ {price.toFixed(2)}
                    </span>
                )}
            </div>

            {/* 🔥 PRECIO MAYORISTA */}
            {hasWholesale && !isOutOfStock && (
                 <div className="flex items-baseline gap-1 mt-0.5 whitespace-nowrap overflow-hidden text-ellipsis">
                    <span className={cn("text-[11px] font-medium uppercase tracking-tight", theme.brandText)}>
                        Por mayor:
                    </span>
                    <span className={cn("text-[13px] font-bold", theme.brandText)}>
                        S/ {wholesalePrice.toFixed(2)}
                    </span>
                    <span className="text-[10px] font-medium text-slate-500 ml-0.5">
                        (Mín. {product.wholesaleMinCount || 3} un.)
                    </span>
                </div>
            )}
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <AddToCartButton 
            product={product as any} 
            disabled={isOutOfStock}
            className="w-full h-10 text-[13px] font-bold rounded-xl shadow-sm hover:shadow-md transition-all active:scale-95"
        />
      </CardFooter>
    </Card>
  );
}