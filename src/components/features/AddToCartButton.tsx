'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/store/cart';
import { toast } from 'sonner';
import { ShoppingCart } from 'lucide-react';

interface Product {
  id: string;
  slug: string;
  title: string;
  price: number;
  images: string[];
  stock: number;
}

export function AddToCartButton({ product }: { product: Product }) {
  const router = useRouter();
  const addItem = useCartStore((state) => state.addItem);
  const [quantity, setQuantity] = useState(1);

  const isOutOfStock = product.stock <= 0;

  const handleAddToCart = () => {
    if (isOutOfStock) return;

    addItem({
      id: product.id,
      slug: product.slug,
      title: product.title,
      price: Number(product.price),
      image: product.images[0] || '',
      quantity: quantity,
    });

    toast.success('Producto agregado al carrito');
  };

  return (
    <div className="flex flex-col gap-4 sm:flex-row w-full sm:w-auto">
      <Button 
        size="lg" 
        className="text-lg w-full sm:w-auto bg-slate-900 hover:bg-slate-800"
        onClick={handleAddToCart}
        disabled={isOutOfStock}
      >
        <ShoppingCart className="mr-2 h-5 w-5" />
        {isOutOfStock ? 'Agotado' : 'Agregar al Carrito'}
      </Button>
      
      <Button 
        variant="outline" 
        size="lg"
        onClick={() => router.back()} // Vuelve a donde estaba
      >
        Seguir viendo
      </Button>
    </div>
  );
}