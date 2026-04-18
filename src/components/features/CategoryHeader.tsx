'use client';

import Link from 'next/link';

interface Props {
  categoryName: string;
  hasFilters: boolean;
  currentPath: string;
}

export function CategoryHeader({ categoryName, hasFilters, currentPath }: Props) {
  return (
    <div className="mb-6">
      <h2 className="text-[16px] font-medium text-slate-900">Filtros</h2>
      {hasFilters && (
        <Link
          href={currentPath}
          className="text-[12px] text-slate-500 hover:text-slate-900 mt-1 underline inline-block transition-colors"
        >
          Limpiar todos
        </Link>
      )}
    </div>
  );
}
