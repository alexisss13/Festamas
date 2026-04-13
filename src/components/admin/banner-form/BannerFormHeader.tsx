'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface BannerFormHeaderProps {
  isEditing: boolean;
  isDirty: boolean;
}

export function BannerFormHeader({ isEditing, isDirty }: BannerFormHeaderProps) {
  return (
    <div className="border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-6 py-6">
        <Button variant="link" size="sm" asChild className="mb-4 -ml-2 text-slate-500 hover:text-slate-900 p-0 h-auto group">
          <Link href="/admin/banners" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            <span className="group-hover:underline">Volver a banners</span>
          </Link>
        </Button>
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              {isEditing ? 'Editar' : 'Crear'} <span className="text-primary">Banner</span>
            </h1>
            <p className="text-sm sm:text-base text-slate-500 mt-1 sm:mt-2">
              {isEditing 
                ? 'Actualiza el contenido promocional de tu tienda.' 
                : 'Configura un nuevo banner promocional para tu tienda.'}
            </p>
          </div>
          {isDirty && (
            <span className="text-xs text-amber-600 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-200 font-medium flex items-center gap-1.5 shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"/> Sin guardar
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
