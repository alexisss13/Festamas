'use client'; // 👈 IMPORTANTE

import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { ProductWithCategory } from '@/actions/products';
import { useCartStore } from '@/store/cart'; // 👈 Importar store

interface ProductCardProps {
  product: ProductWithCategory;
}

export function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem); // 👈 Hook del carrito

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
    }).format(value);
  };

  // Función para manejar el click
  const handleAddToCart = () => {
    addItem({
      id: product.id,
      slug: product.slug,
      title: product.title,
      price: product.price,
      image: product.images[0] || '',
      quantity: 1,
    });
    // Aquí luego pondremos un Toast de confirmación
  };

  return (
    <Card className="group overflow-hidden border-none shadow-sm hover:shadow-md transition-shadow duration-300">
      <CardHeader className="p-0">
        <div className="relative aspect-square overflow-hidden bg-slate-100">
          {product.images[0] && (
            <Image
              src={product.images[0]}
              alt={product.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          )}
          {!product.images[0] && (
             <div className="flex h-full items-center justify-center text-slate-400">
               Sin imagen
             </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="p-4">
        <div className="mb-2 flex items-center justify-between">
          <Badge variant="secondary" className="text-xs font-normal">
            {product.category.name}
          </Badge>
        </div>
        <Link href={`/product/${product.slug}`} className="block group-hover:underline decoration-slate-400">
            <h3 className="font-semibold text-slate-900 line-clamp-1" title={product.title}>
              {product.title}
            </h3>
        </Link>
      </CardContent>

      <CardFooter className="flex items-center justify-between p-4 pt-0">
        <span className="text-lg font-bold text-slate-900">
          {formatPrice(product.price)}
        </span>
        {/* Botón conectado */}
        <Button size="sm" variant="default" onClick={handleAddToCart}>
          Agregar
        </Button>
      </CardFooter>
    </Card>
  );
}