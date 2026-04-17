'use client';

import { useRouter, useSearchParams } from 'next/navigation';

interface Props {
  brandColor: string;
}

export function CategorySort({ brandColor }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sort = searchParams.get('sort') || 'newest';

  const handleSortChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('sort', value);
    params.set('page', '1');
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-slate-600 hidden sm:block">Ordenar por:</span>
      <select
        value={sort}
        onChange={(e) => handleSortChange(e.target.value)}
        className="text-sm border border-slate-300 rounded-lg px-3 py-2 bg-white hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-offset-1 transition-colors"
        style={{ 
          // @ts-ignore
          '--tw-ring-color': brandColor 
        }}
      >
        <option value="newest">Más recientes</option>
        <option value="price_asc">Menor precio</option>
        <option value="price_desc">Mayor precio</option>
        <option value="popular">Más populares</option>
      </select>
    </div>
  );
}
