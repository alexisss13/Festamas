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
      <h2 className="text-lg font-bold text-slate-900">Filtros</h2>
      {hasFilters && (
        <Link
          href={currentPath}
          className="text-sm text-slate-600 hover:text-slate-900 mt-1 underline inline-block"
        >
          Limpiar todos
        </Link>
      )}
    </div>
  );
}
