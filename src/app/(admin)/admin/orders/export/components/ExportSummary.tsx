'use client';

import { Label } from '@/components/ui/label';
import { Database, LayoutGrid, Coins } from 'lucide-react';

interface ExportSummaryProps {
  totalOrders: number;
  filteredOrders: number;
  selectedColumns: number;
  totalAmount: number;
}

export function ExportSummary({ totalOrders, filteredOrders, selectedColumns, totalAmount }: ExportSummaryProps) {
  return (
    <div className="flex flex-col gap-4">
      <Label className="text-[13px] font-medium text-slate-500">
        Resumen de Exportación
      </Label>

      {/* Contenedor sin bordes, puro texto alineado */}
      <div className="flex flex-col gap-3 px-1">
        
        {/* Contexto */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Database className="w-4 h-4 text-primary" />
            <span className="text-sm text-slate-500">Total en sistema</span>
          </div>
          <span className="text-sm font-medium text-slate-700">{totalOrders}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <LayoutGrid className="w-4 h-4 text-primary" />
            <span className="text-sm text-slate-500">Columnas incluidas</span>
          </div>
          <span className="text-sm font-medium text-slate-700">{selectedColumns}</span>
        </div>

        {/* Separador sutil en lugar de un cambio de fondo */}
        <div className="h-px bg-slate-100 my-1 w-full" />

        {/* Resultado: Valor económico */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Coins className="w-4 h-4 text-slate-600" />
            <span className="text-sm font-medium text-slate-700">Valor total</span>
          </div>
          <span className="text-sm font-bold text-slate-900">
            S/ {totalAmount.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
          </span>
        </div>

      </div>
    </div>
  );
}