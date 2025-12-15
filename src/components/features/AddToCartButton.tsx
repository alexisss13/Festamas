'use client';

import { useCartStore } from '@/store/cart';
import { Product } from '@prisma/client';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { toast } from 'sonner';

interface Props {
  product: Product;
  disabled?: boolean;
  className?: string; // 👈 Agregamos esta prop
}

export function AddToCartButton({ product, disabled, className }: Props) {
  const addProductToCart = useCartStore(state => state.addProductToCart);
  const [added, setAdded] = useState(false);

  const handleAddToCart = () => {
    // Simulamos un objeto CartProduct simple
    const cartProduct = {
      id: product.id,
      slug: product.slug,
      title: product.title,
      price: Number(product.price),
      quantity: 1,
      image: product.images[0],
      stock: product.stock, // Asegúrate de que tu store acepte esto
      // Si tu store requiere más campos, agrégalos aquí
    };

    addProductToCart(cartProduct as any); // Casteo 'any' temporal para evitar líos de tipos con el store
    
    setAdded(true);
    toast.success('Producto agregado al carrito');
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <Button 
      onClick={handleAddToCart}
      disabled={disabled}
      className={cn("w-full font-bold transition-all duration-300", className)} // 👈 Usamos cn para mezclar clases
    >
      {added ? (
        "¡Agregado!"
      ) : (
        <>
          <ShoppingCart className="mr-2 h-4 w-4" /> Agregar
        </>
      )}
    </Button>
  );
}