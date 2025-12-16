'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ShoppingBag, Trash2, Plus, Minus, Tag, Package } from 'lucide-react';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger,
  SheetClose 
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge'; 
import { useCartStore, getEffectivePrice } from '@/store/cart';
import { useUIStore } from '@/store/ui'; 
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface Props {
  children: React.ReactNode; 
}

export function CartSidebar({ children }: Props) {
  const { cart, removeProduct, updateProductQuantity, getSubtotalPrice } = useCartStore();
  const { currentDivision } = useUIStore(); 
  
  const [loaded, setLoaded] = useState(false);
  useEffect(() => setLoaded(true), []);

  const items = cart || [];
  const subTotal = getSubtotalPrice ? getSubtotalPrice() : 0;
  const isToys = currentDivision === 'JUGUETERIA';

  // --- 🎨 COLORES DINÁMICOS ---
  const themeColor = isToys ? 'text-[#fc4b65]' : 'text-[#ec4899]';
  const btnBg = isToys ? 'bg-[#fc4b65] hover:bg-[#e11d48]' : 'bg-[#ec4899] hover:bg-[#db2777]';
  const progressBg = isToys ? 'bg-rose-100' : 'bg-pink-100';

  const formatPrice = (value: number) =>
    new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
    }).format(value);

  if (!loaded) return <>{children}</>;

  return (
    <Sheet>
      <SheetTrigger asChild>
        {children}
      </SheetTrigger>
      
      <SheetContent className="flex w-full flex-col pl-6 pr-0 sm:max-w-md z-[100]">
        <SheetHeader className="px-1 text-left border-b pb-4">
          <SheetTitle className="flex items-center gap-2">
            <ShoppingBag className={cn("h-5 w-5", themeColor)} />
            Mi Carrito <span className="text-slate-400 font-normal text-sm">({items.length} items)</span>
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center space-y-4 pr-6">
            <div className={cn("p-6 rounded-full bg-slate-50", progressBg)}>
                <ShoppingBag className={cn("h-12 w-12 opacity-50", themeColor)} />
            </div>
            <div className="text-center">
                <span className="text-xl font-semibold text-slate-700 block">Tu carrito está vacío</span>
                <span className="text-sm text-slate-500">¡Explora nuestras ofertas y llénalo de alegría!</span>
            </div>
            <SheetClose asChild>
                <Button className={cn("mt-4 text-white font-bold px-8", btnBg)}>
                    Empezar a comprar
                </Button>
            </SheetClose>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto pr-6 custom-scrollbar">
              <div className="flex flex-col gap-6 py-6">
                {items.map((item) => {
                    const effectivePrice = getEffectivePrice(item);
                    
                    // Lógica segura para Mayorista
                    const isWholesaleApplied = (item.wholesalePrice ?? 0) > 0 
                        && (item.wholesaleMinCount ?? 0) > 0 
                        && item.quantity >= (item.wholesaleMinCount ?? 0);
                    
                    // Lógica segura para Descuento (Solo si > 0)
                    const discountVal = item.discountPercentage ?? 0;
                    const hasDiscount = discountVal > 0 && !isWholesaleApplied;
                    
                    // Precio original vs final
                    const showOriginalPrice = item.price > effectivePrice;

                    return (
                      <div key={item.id} className="flex gap-4 animate-in fade-in duration-300">
                        
                        <SheetClose asChild>
                            <Link href={`/product/${item.slug}`} className="relative h-24 w-24 min-w-[6rem] overflow-hidden rounded-xl border bg-white shadow-sm block group">
                                <Image
                                    src={item.image}
                                    alt={item.title}
                                    fill
                                    className="object-contain p-1 group-hover:scale-105 transition-transform duration-300"
                                />
                            </Link>
                        </SheetClose>

                        <div className="flex flex-1 flex-col justify-between">
                          <div className="flex flex-col">
                            <div className="flex justify-between items-start gap-2">
                                <SheetClose asChild>
                                    <Link href={`/product/${item.slug}`} className="line-clamp-2 text-sm font-medium text-slate-700 hover:text-primary transition-colors leading-tight">
                                        {item.title}
                                    </Link>
                                </SheetClose>
                                <button onClick={() => removeProduct(item.id)} className="text-slate-400 hover:text-red-500 transition-colors">
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>

                            {/* PRECIO UNITARIO + BADGES */}
                            <div className="flex flex-wrap items-center gap-2 mt-1">
                                {/* Precio Unitario */}
                                <span className="text-xs font-medium text-slate-500">
                                    {formatPrice(effectivePrice)} c/u
                                </span>

                                {/* Badge Mayorista */}
                                {isWholesaleApplied && (
                                    <Badge variant="secondary" className="bg-blue-50 text-blue-700 border border-blue-100 text-[9px] px-1.5 h-4 gap-1 rounded-sm shadow-none">
                                        Mayorista
                                    </Badge>
                                )}
                                
                                {/* Badge Descuento (Solo si > 0) */}
                                {hasDiscount && (
                                    <Badge variant="secondary" className="bg-red-50 text-red-600 border border-red-100 text-[9px] px-1.5 h-4 gap-1 rounded-sm shadow-none">
                                        -{discountVal}%
                                    </Badge>
                                )}
                            </div>
                          </div>
                          
                          <div className="flex items-end justify-between mt-2">
                            {/* CONTROLES */}
                            <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-1 rounded-lg border bg-white p-0.5 h-8 shadow-sm w-fit">
                                    <Button variant="ghost" size="icon" className="h-7 w-7 rounded-md hover:bg-slate-100" 
                                        disabled={item.quantity <= 1}
                                        onClick={() => updateProductQuantity(item.id, item.quantity - 1)}>
                                        <Minus className="h-3 w-3" />
                                    </Button>
                                    <span className="text-sm font-semibold w-6 text-center tabular-nums">{item.quantity}</span>
                                    <Button variant="ghost" size="icon" className="h-7 w-7 rounded-md hover:bg-slate-100" 
                                        onClick={() => updateProductQuantity(item.id, item.quantity + 1)}>
                                        <Plus className="h-3 w-3" />
                                    </Button>
                                </div>
                                
                                {/* AVISO: FALTA POCO */}
                                {item.wholesaleMinCount && !isWholesaleApplied && (
                                    <p className="text-[10px] text-blue-500 font-medium leading-none">
                                        Lleva {(item.wholesaleMinCount || 0) - item.quantity} más para precio mayorista
                                    </p>
                                )}
                            </div>

                            {/* TOTAL POR ITEM */}
                            <div className="text-right">
                                {showOriginalPrice && (
                                    <span className="block text-[10px] text-slate-400 line-through">
                                        {formatPrice(item.price * item.quantity)}
                                    </span>
                                )}
                                <span className={cn("font-bold text-base", themeColor)}>
                                    {formatPrice(effectivePrice * item.quantity)}
                                </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                })}
              </div>
            </div>

            {/* FOOTER */}
            <div className="pr-6 pt-4 pb-6 bg-white border-t">
              <div className="flex justify-between items-end mb-4">
                  <span className="text-sm font-medium text-slate-500">Total a Pagar</span>
                  <span className="text-xl font-bold text-slate-900">{formatPrice(subTotal)}</span>
              </div>
              
              <SheetClose asChild>
                  <Button asChild className={cn("w-full h-12 text-base font-bold shadow-md hover:shadow-lg transition-all", btnBg)}>
                      <Link href="/cart">
                          Continuar Compra
                      </Link>
                  </Button>
              </SheetClose>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}