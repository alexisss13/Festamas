'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Heart, ShoppingCart, Minus, Plus, Package, Tag } from 'lucide-react';
import { useCartStore, CartProduct } from '@/store/cart';
import { Product } from '@prisma/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface Props {
  // 🛡️ FIX CRÍTICO: Sobrescribimos los tipos Decimal por number
  // Esto soluciona el error de "Type number is not assignable to type Decimal"
  product: Omit<Product, 'price' | 'wholesalePrice'> & {
    price: number;
    wholesalePrice?: number | null;
    wholesaleMinCount?: number | null;
    discountPercentage?: number;
  };
}

export function ProductActions({ product }: Props) {
  const [quantity, setQuantity] = useState(1);
  const addProductToCart = useCartStore(state => state.addProductToCart);
  
  const isToys = product.division === 'JUGUETERIA';
  const themeColor = isToys ? 'text-[#fc4b65]' : 'text-[#ec4899]';
  const btnBg = isToys ? 'bg-[#fc4b65] hover:bg-[#e11d48]' : 'bg-[#ec4899] hover:bg-[#db2777]';
  
  // Lógica de precios
  const discount = product.discountPercentage || 0;
  const wholesalePrice = product.wholesalePrice || 0;
  const minCount = product.wholesaleMinCount || 0;
  
  // Precio Efectivo
  let unitPrice = product.price;
  let isWholesale = false;
  let isDiscount = false;

  if (wholesalePrice > 0 && minCount > 0 && quantity >= minCount) {
    unitPrice = wholesalePrice;
    isWholesale = true;
  } else if (discount > 0) {
    unitPrice = product.price * (1 - discount / 100);
    isDiscount = true;
  }

  const handleAddToCart = () => {
    const cartProduct: CartProduct = {
      id: product.id,
      slug: product.slug,
      title: product.title,
      price: product.price,
      quantity: quantity,
      image: product.images[0] || '/placeholder.jpg',
      stock: product.stock,
      division: product.division,
      wholesalePrice: wholesalePrice,
      wholesaleMinCount: minCount,
      discountPercentage: discount,
    };

    addProductToCart(cartProduct);
    toast.success(`Agregaste ${quantity} unidad(es) al carrito`);
  };

  const formatPrice = (val: number) => 
    new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(val);

  return (
    <div className="space-y-6">
      
      {/* 🏷️ PRECIOS */}
      <div className="space-y-1">
        {(isDiscount || isWholesale) && (
            <span className="text-sm text-slate-400 line-through font-medium">
                {formatPrice(product.price)}
            </span>
        )}
        
        <div className="flex items-center gap-3">
            <span className={cn("text-3xl font-extrabold tracking-tight", themeColor)}>
                {formatPrice(unitPrice)}
            </span>
            
            {isWholesale && (
                <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-100 px-2 py-0.5">
                    <Package className="w-3 h-3 mr-1" /> Mayorista
                </Badge>
            )}
            {isDiscount && !isWholesale && (
                <Badge variant="secondary" className="bg-red-50 text-red-600 border-red-100 px-2 py-0.5">
                    <Tag className="w-3 h-3 mr-1" /> -{discount}%
                </Badge>
            )}
        </div>

        {minCount > 0 && !isWholesale && (
            <p className="text-xs text-slate-500 font-medium mt-1">
                Lleva <span className="text-slate-900 font-bold">{minCount}</span> unidades para pagar <span className="text-blue-600 font-bold">{formatPrice(wholesalePrice)}</span> c/u
            </p>
        )}
      </div>

      <div className="h-px bg-slate-100 w-full" />

      {/* 📦 SELECTOR Y BOTONES */}
      <div className="flex flex-col sm:flex-row gap-4">
        
        <div className="flex items-center border border-slate-200 rounded-lg w-fit shadow-sm">
            <Button 
                variant="ghost" 
                size="icon" 
                className="h-11 w-11 rounded-none rounded-l-lg hover:bg-slate-50 text-slate-600"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
            >
                <Minus className="h-4 w-4" />
            </Button>
            <div className="h-11 w-12 flex items-center justify-center border-x border-slate-100 font-bold text-slate-900 text-lg">
                {quantity}
            </div>
            <Button 
                variant="ghost" 
                size="icon" 
                className="h-11 w-11 rounded-none rounded-r-lg hover:bg-slate-50 text-slate-600"
                onClick={() => setQuantity(quantity + 1)}
            >
                <Plus className="h-4 w-4" />
            </Button>
        </div>

        <div className="flex-1 flex gap-3">
            <Button 
                className={cn("flex-1 h-11 text-base font-bold shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5", 
                    product.stock > 0 ? btnBg : "bg-slate-200 text-slate-400 hover:bg-slate-200 cursor-not-allowed shadow-none"
                )}
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
            >
                <ShoppingCart className="mr-2 h-5 w-5" />
                {product.stock > 0 ? 'Agregar al Carrito' : 'Agotado'}
            </Button>
            
            <Button variant="outline" size="icon" className="h-11 w-11 border-slate-300 text-slate-400 hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-colors">
                <Heart className="h-5 w-5" />
            </Button>
        </div>
      </div>

      {/* INFO EXTRA */}
      <div className="grid grid-cols-2 gap-4 text-xs text-slate-500 bg-slate-50 p-4 rounded-lg border border-slate-100">
         <div className="flex items-center gap-2">
            <span className={cn("h-2 w-2 rounded-full", product.stock > 0 ? "bg-green-500" : "bg-red-500")} />
            <span>Stock: <strong>{product.stock > 0 ? product.stock : 'Sin stock'}</strong></span>
         </div>
         <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-blue-500" />
            <span>Envío a todo el Perú</span>
         </div>
         <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-yellow-500" />
            <span>Pago seguro (Yape/Plin)</span>
         </div>
         <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-purple-500" />
            <span>Garantía de tienda</span>
         </div>
      </div>

    </div>
  );
}