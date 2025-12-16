'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  totalPages: number;
  currentPage: number;
  brandColor?: string;
}

export function Pagination({ totalPages, currentPage, brandColor = '#000' }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const createPageUrl = (pageNumber: number | string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', pageNumber.toString());
    return `?${params.toString()}`;
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-2 mt-12">
      <Button
        variant="outline"
        size="icon"
        disabled={currentPage <= 1}
        onClick={() => router.push(createPageUrl(currentPage - 1))}
        className="h-10 w-10 border-slate-200"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <div className="flex items-center gap-1">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <Button
            key={page}
            variant={page === currentPage ? 'default' : 'ghost'}
            onClick={() => router.push(createPageUrl(page))}
            className={cn(
                "h-10 w-10 font-bold transition-all",
                page === currentPage ? "text-white hover:opacity-90" : "text-slate-600 hover:bg-slate-100"
            )}
            style={page === currentPage ? { backgroundColor: brandColor } : {}}
          >
            {page}
          </Button>
        ))}
      </div>

      <Button
        variant="outline"
        size="icon"
        disabled={currentPage >= totalPages}
        onClick={() => router.push(createPageUrl(currentPage + 1))}
        className="h-10 w-10 border-slate-200"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}