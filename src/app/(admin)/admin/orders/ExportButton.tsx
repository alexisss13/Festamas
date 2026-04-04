'use client';

import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export function ExportButton() {
  return (
    <Button
      asChild
      className="bg-primary hover:bg-primary/90 text-white border-0 h-10 w-full gap-2 px-5 flex items-center justify-center transition-colors cursor-pointer shadow-sm rounded-md font-semibold text-[13px]"
    >
      <Link href="/admin/orders/export">
        <Download className="h-4 w-4" />
        Exportar
      </Link>
    </Button>
  );
}
