'use client';

import { useUIStore } from '@/store/ui';
import { ProductCard } from './ProductCard';
import { PackageOpen } from 'lucide-react';

interface Props {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  products: any[]; // Usamos any para evitar conflictos con Decimal de Prisma
}

export function ProductGrid({ products }: Props) {
  const { currentDivision } = useUIStore();

  // 🛡️ FILTRO MAESTRO: Solo dejamos pasar los productos de la tienda actual
  // Asegúrate que en tu BD la división sea exactamente 'JUGUETERIA' o 'FIESTAS'
  const displayProducts = products.filter(p => p.division === currentDivision);

  if (displayProducts.length === 0) {
    return (
      <div className="col-span-full py-20 flex flex-col items-center justify-center text-slate-400">
        <PackageOpen className="w-16 h-16 mb-4 opacity-50" />
        <p className="text-lg font-medium">No hay productos en esta sección.</p>
        <p className="text-sm">Prueba cambiando de tienda o categoría.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {displayProducts.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}