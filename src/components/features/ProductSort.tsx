'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function ProductSort() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Leemos el valor actual de la URL o por defecto 'newest'
  const currentSort = searchParams.get('sort') || 'newest';

  const handleSortChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('sort', value);
    
    // Actualizamos la URL sin recargar toda la página (Server Component se refresca solo)
    router.push(`?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-slate-500 hidden sm:inline-block">Ordenar por:</span>
      <Select value={currentSort} onValueChange={handleSortChange}>
        <SelectTrigger className="w-[180px] bg-white">
          <SelectValue placeholder="Lo más nuevo" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="newest">Lo más nuevo</SelectItem>
          <SelectItem value="price_asc">Precio: Menor a Mayor</SelectItem>
          <SelectItem value="price_desc">Precio: Mayor a Menor</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}