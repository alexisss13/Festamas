'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AddToCartButton } from './AddToCartButton';
import { cn } from '@/lib/utils';
import { Tag, Sparkles, Package } from 'lucide-react';

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
  
  // 1. Cálculos de Precio
  const price = Number(product.price) || 0;
  const wholesalePrice = product.wholesalePrice ? Number(product.wholesalePrice) : 0;
  
  const hasDiscount = product.discountPercentage > 0;
  const finalPrice = hasDiscount 
    ? price * (1 - product.discountPercentage / 100) 
    : price;

  const isNew = new Date(product.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 días como "Nuevo"
  const isOutOfStock = product.stock <= 0;

  // Lógica para mostrar "Precio Mayorista" solo si vale la pena resaltarlo
  const showWholesale = wholesalePrice > 0 && wholesalePrice < finalPrice;

  return (
    <Card className="group h-full flex flex-col border-0 shadow-sm hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden bg-white ring-1 ring-slate-100">
      
      {/* --- 1. ZONA DE IMAGEN --- */}
      <div className="relative aspect-square overflow-hidden bg-slate-50 p-6"> 
        {/* Padding generoso para que el producto respire */}
        
        {/* Badges Flotantes (Diseño Moderno) */}
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-2 items-start">
          
          {hasDiscount && (
            <Badge className="bg-rose-500 hover:bg-rose-600 text-white font-bold px-2.5 py-0.5 rounded-full shadow-sm text-[11px] border-0">
              -{product.discountPercentage}%
            </Badge>
          )}
          
          {isNew && !hasDiscount && (
            <Badge className="bg-blue-500 hover:bg-blue-600 text-white font-bold px-2.5 py-0.5 rounded-full shadow-sm text-[11px] border-0 flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> NUEVO
            </Badge>
          )}

          {isOutOfStock && (
             <Badge variant="secondary" className="bg-slate-900 text-white font-bold px-2 py-0.5 rounded-full text-[10px]">
               AGOTADO
             </Badge>
          )}
        </div>

        {/* Imagen del Producto */}
        <Link href={`/product/${product.slug}`} className="block h-full w-full relative">
          {product.images[0] ? (
            <Image
              src={product.images[0]}
              alt={product.title}
              fill
              className={cn(
                  "object-contain mix-blend-multiply transition-transform duration-700 ease-out group-hover:scale-110", 
                  isOutOfStock && "opacity-50 grayscale"
              )}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-slate-300">
              <Package className="w-12 h-12 opacity-20" />
            </div>
          )}
        </Link>

        {/* Botón Rápido "Ver" al Hover (Opcional, estilo Zara/H&M) */}
        <div className="absolute bottom-0 left-0 right-0 p-4 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 hidden md:block">
            <Link href={`/product/${product.slug}`} className="block w-full">
                <div className="bg-white/90 backdrop-blur-sm text-slate-900 text-xs font-bold text-center py-2.5 rounded-full shadow-sm border border-slate-100 hover:bg-slate-900 hover:text-white transition-colors">
                    VER DETALLES
                </div>
            </Link>
        </div>
      </div>

      {/* --- 2. INFORMACIÓN --- */}
      <CardContent className="p-5 flex-1 flex flex-col gap-3 relative">
        
        {/* Tags / Categoría (Sutil) */}
        {product.tags && product.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 overflow-hidden h-5">
                {product.tags.slice(0, 2).map(tag => (
                    <span key={tag} className="inline-flex items-center text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50 px-1.5 rounded-sm">
                        {tag}
                    </span>
                ))}
            </div>
        )}

        {/* Título */}
        <Link href={`/product/${product.slug}`} className="block">
          <h3 className="font-bold text-slate-800 text-[15px] leading-snug line-clamp-2 min-h-[40px] group-hover:text-primary transition-colors">
            {product.title}
          </h3>
        </Link>

        {/* Separador Sutil */}
        <div className="h-px bg-slate-50 w-full my-1"></div>

        {/* Precios Jerarquizados */}
        <div className="mt-auto space-y-2">
            
            {/* Precio Unitario Principal */}
            <div className="flex items-end gap-2 flex-wrap">
                <span className="text-xl font-extrabold text-slate-900">
                    S/ {finalPrice.toFixed(2)}
                </span>
                {hasDiscount && (
                    <span className="text-xs text-slate-400 line-through mb-1">
                        S/ {price.toFixed(2)}
                    </span>
                )}
            </div>

            {/* Banner de Mayorista (El "Gancho") */}
            {showWholesale && (
                <div className="flex items-center justify-between bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100 rounded-lg px-2.5 py-1.5 shadow-sm">
                    <div className="flex flex-col leading-none">
                        <span className="text-[9px] font-bold text-amber-700 uppercase tracking-wide mb-0.5">
                            Precio Mayorista
                        </span>
                        <span className="text-sm font-bold text-amber-900">
                            S/ {wholesalePrice.toFixed(2)}
                        </span>
                    </div>
                    <div className="bg-white/50 px-1.5 py-0.5 rounded text-[10px] font-medium text-amber-800 border border-amber-100/50">
                        x {product.wholesaleMinCount}+
                    </div>
                </div>
            )}
        </div>
      </CardContent>

      {/* --- 3. FOOTER (Acción) --- */}
      {/* Solo visible en móvil siempre, o si quieres botón de agregar directo */}
      <CardFooter className="p-4 pt-0">
        <AddToCartButton product={product as any} disabled={isOutOfStock} />
      </CardFooter>
    </Card>
  );
}