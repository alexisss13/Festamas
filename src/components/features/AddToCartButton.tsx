'use client';

import { useCartStore, CartProduct } from '@/store/cart';
import { useUIStore } from '@/store/ui'; 
import { Product } from '@prisma/client';
import { Button } from '@/components/ui/button'; 
import { Minus, Plus, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

interface Props {
  product: Product & {
    stock: number;
    price: number;
    wholesalePrice?: number | null; 
    discountPercentage?: number;
  };
  disabled?: boolean;
  className?: string;
}

export function AddToCartButton({ product, disabled, className }: Props) {
  // Conectamos con el Zustand Store
  const cart = useCartStore(state => state.cart);
  const addProductToCart = useCartStore(state => state.addProductToCart);
  const updateProductQuantity = useCartStore(state => state.updateProductQuantity);
  const removeProduct = useCartStore(state => state.removeProduct);
  

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Buscamos si el producto YA ESTÁ en el carrito
  const productInCart = cart.find(item => item.id === product.id);
  const quantityInCart = productInCart?.quantity || 0;
  const isAdded = quantityInCart > 0;

  const outlineStyles = "bg-transparent border-2 border-primary text-primary hover:!bg-primary hover:!text-white";

  // --- ACCIONES ---

  const handleInitialAdd = (e: React.MouseEvent) => {
    e.preventDefault(); 
    e.stopPropagation();

    const cartProduct: CartProduct = {
      id: product.id,
      slug: product.slug,
      title: product.title,
      price: Number(product.price), 
      quantity: 1,
      image: product.images[0] || '/placeholder.jpg',
      stock: product.stock,

      wholesalePrice: product.wholesalePrice ? Number(product.wholesalePrice) : null,
      wholesaleMinCount: product.wholesaleMinCount || null,
      discountPercentage: product.discountPercentage || 0,
    };

    addProductToCart(cartProduct);
    toast.success(`${product.title} agregado al carrito`);
  };

  const handleIncrement = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (quantityInCart < product.stock) {
        updateProductQuantity(product.id, quantityInCart + 1);
    } else {
        toast.error("Stock máximo alcanzado");
    }
  };

  const handleDecrement = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (quantityInCart > 1) {
        updateProductQuantity(product.id, quantityInCart - 1);
    } else {
        removeProduct(product.id);
        toast.info("Producto removido del carrito");
    }
  };

  if (!mounted) {
    return <Button disabled variant="outline" className="w-full opacity-50 border-slate-200 h-10">Cargando...</Button>;
  }

  // --- VISTA 2: EL PRODUCTO YA ESTÁ EN EL CARRITO (CONTROLES + / -) ---
  if (isAdded) {
      return (
          <div className={cn("flex items-center justify-between w-full h-10", className)}>
              
              {/* Botón Minus/Trash */}
              <Button 
                variant="outline" 
                size="icon"
                onClick={handleDecrement}
                className={cn(
                    "h-10 w-10 rounded-xl transition-all active:scale-95",
                    // Si es 1 (Basurero) usamos gris/rojo, si es resta (-) usamos el color de la tienda
                    quantityInCart === 1 
                        ? "bg-transparent border-2 border-slate-300 text-slate-500 hover:!bg-red-50 hover:!text-red-500 hover:!border-red-200"
                        : outlineStyles
                )}
              >
                  {quantityInCart === 1 ? <Trash2 className="h-4 w-4" /> : <Minus className="h-4 w-4" strokeWidth={2.5} />}
              </Button>
              
              <span className="font-bold text-[14px] text-slate-800 flex-1 text-center select-none">
                  {quantityInCart}
              </span>

              {/* Botón Plus */}
              <Button 
                variant="outline" 
                size="icon"
                onClick={handleIncrement}
                disabled={quantityInCart >= product.stock}
                className={cn("h-10 w-10 rounded-xl transition-all active:scale-95", outlineStyles)}
              >
                  <Plus className="h-4 w-4" strokeWidth={2.5} />
              </Button>
          </div>
      );
  }

  // --- VISTA 1: EL PRODUCTO NO ESTÁ EN EL CARRITO (BOTÓN "AGREGAR") ---
  return (
    <Button 
      onClick={handleInitialAdd}
      disabled={disabled}
      className={cn(
        "w-full h-10 font-bold rounded-xl shadow-sm hover:shadow-md transition-all duration-300 active:scale-95", 
        outlineStyles, 
        className
      )} 
    >
      <span className="text-[13px] tracking-wide uppercase">Agregar</span>
    </Button>
  );
}