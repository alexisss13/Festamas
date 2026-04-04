'use client';

interface ExportSummaryProps {
  totalOrders: number;
  filteredOrders: number;
  selectedColumns: number;
  totalAmount: number;
}

export function ExportSummary({ totalOrders, filteredOrders, selectedColumns, totalAmount }: ExportSummaryProps) {
  return (
    <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
      <h3 className="text-sm font-semibold text-slate-800 mb-3">Resumen de Exportación</h3>
      
      <div className="space-y-2.5 text-sm">
        <div className="flex justify-between items-center text-slate-600">
          <span>Total en base de datos</span>
          <span className="font-medium">{totalOrders}</span>
        </div>
        <div className="flex justify-between items-center text-slate-600">
          <span>Columnas seleccionadas</span>
          <span className="font-medium">{selectedColumns}</span>
        </div>
        
        <div className="pt-2.5 mt-2.5 border-t border-slate-200 flex justify-between items-center">
          <span className="font-medium text-slate-700">Registros a exportar</span>
          <span className="font-bold text-primary">{filteredOrders}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="font-medium text-slate-700">Valor proyectado</span>
          <span className="font-bold text-slate-900">
            S/ {totalAmount.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>
    </div>
  );
}