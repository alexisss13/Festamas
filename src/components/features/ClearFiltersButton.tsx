'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

interface Props {
  currentPath: string;
}

export function ClearFiltersButton({ currentPath }: Props) {
  const router = useRouter();

  return (
    <Button 
      onClick={() => router.push(currentPath)} 
      variant="outline"
      className="border-slate-300 hover:bg-slate-50"
    >
      Limpiar filtros
    </Button>
  );
}
