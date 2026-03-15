'use client';

import { useState } from 'react';
import { Overview } from './Overview';
import { LogisticsChart } from './LogisticsChart';
import { Button } from '@/components/ui/button';
import { TrendingUp, Truck } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SalesOverviewProps {
  chartData: { name: string; total: number }[];
  logistics: { name: string; pickup: number; delivery: number }[];
}

export function SalesOverview({ chartData, logistics }: SalesOverviewProps) {
  const [view, setView] = useState<'sales' | 'logistics'>('sales');

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end gap-2">
        <Button
          variant={view === 'sales' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setView('sales')}
          className={cn(
            "h-8 text-xs gap-1.5",
            view === 'sales' && "shadow-sm"
          )}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          Ventas
        </Button>
        <Button
          variant={view === 'logistics' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setView('logistics')}
          className={cn(
            "h-8 text-xs gap-1.5",
            view === 'logistics' && "shadow-sm"
          )}
        >
          <Truck className="w-3.5 h-3.5" />
          Logística
        </Button>
      </div>

      {view === 'sales' ? (
        <Overview data={chartData} />
      ) : (
        <LogisticsChart data={logistics} />
      )}
    </div>
  );
}
