'use client';

import { useCartStore, CartProduct } from '@/store/cart';
import { Product } from '@prisma/client';
import { Button } from '@/components/ui/button'; 
import { ShoppingCart, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

interface Props {
  // Extendemos el tipo Product para asegurar que TS reconozca los campos opcionales si Prisma los trae
  product: Product & {
    wholesalePrice?: any; // Puede venir como Decimal
    wholesaleMinCount?: number | null;
    discountPercentage?: number;
  };
  disabled?: boolean;
  className?: string;
}

export function AddToCartButton({ product, disabled, className }: Props) {
  const addProductToCart = useCartStore(state => state.addProductToCart);
  const [added, setAdded] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => setMounted(true), []);

  // Lógica de Tienda para Colores
  const isFestamas = product.division === 'JUGUETERIA' || !product.division;

  // 🔥 Estilos de botón Invertido (Outline)
  const outlineStyles = isFestamas 
    ? "bg-transparent border-2 border-[#fc4b65] text-[#fc4b65] hover:bg-[#fc4b65] hover:text-white"
    : "bg-transparent border-2 border-[#fb3099] text-[#fb3099] hover:bg-[#fb3099] hover:text-white";

  // 🔥 Estilos para cuando ya se agregó al carrito (Fondo sólido como feedback visual)
  const addedStyles = isFestamas
    ? "bg-[#fc4b65] border-2 border-[#fc4b65] text-white"
    : "bg-[#fb3099] border-2 border-[#fb3099] text-white";

  const handleAddToCart = (e: React.MouseEvent) => {
    // 🛡️ Prevenir navegación si el botón está dentro de un Link (muy común en Cards)
    e.preventDefault(); 
    e.stopPropagation();

    // 1. Mapeo Completo de Datos para el Store 🧠
    const cartProduct: CartProduct = {
      id: product.id,
      slug: product.slug,
      title: product.title,
      price: Number(product.price), // Precio base
      quantity: 1,
      image: product.images[0] || '/placeholder.jpg',
      stock: product.stock,
      division: product.division,
      
      wholesalePrice: product.wholesalePrice ? Number(product.wholesalePrice) : null,
      wholesaleMinCount: product.wholesaleMinCount || null,
      discountPercentage: product.discountPercentage || 0,
    };

    // 2. Enviamos al Store
    addProductToCart(cartProduct);
    
    // 3. Feedback Visual
    setAdded(true);
    toast.success(`${product.title} agregado al carrito`);
    setTimeout(() => setAdded(false), 2000);
  };

  if (!mounted) {
    return <Button disabled variant="outline" className="w-full opacity-50 border-slate-200">Cargando...</Button>;
  }

  return (
    <Button 
      onClick={handleAddToCart}
      disabled={disabled || added} // Evita el doble click mientras dice "¡Listo!"
      variant="outline" // Base outline de shadcn
      className={cn(
        "w-full font-bold transition-all duration-300 active:scale-95", 
        added ? addedStyles : outlineStyles, // Aplica el estilo normal o el de éxito
        className
      )} 
    >
      {added ? (
        <span className="flex items-center animate-in fade-in zoom-in duration-300">
             <Check className="mr-2 h-5 w-5" strokeWidth={3} /> ¡Listo!
        </span>
      ) : (
        <>
          <ShoppingCart className="mr-2 h-5 w-5" strokeWidth={2.5} /> 
          <span className="text-[13px] tracking-wide uppercase">Agregar</span>
        </>
      )}
    </Button>
  );
}