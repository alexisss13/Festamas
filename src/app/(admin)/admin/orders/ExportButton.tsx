'use client';

import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import * as XLSX from 'xlsx';
import { toast } from 'sonner';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function ExportButton({ orders }: { orders: any[] }) {
  
  const handleExport = () => {
    try {
      // 1. Formatear datos para Excel (Flat Object)
      const dataToExport = orders.map(order => ({
        ID: order.id.split('-')[0].toUpperCase(),
        Fecha: new Date(order.createdAt).toLocaleDateString('es-PE'),
        Cliente: order.clientName,
        Telefono: order.clientPhone,
        Estado: order.status,
        Pagado: order.isPaid ? 'SI' : 'NO',
        Total: Number(order.totalAmount),
        Items: order.orderItems.length
      }));

      // 2. Crear hoja de trabajo
      const worksheet = XLSX.utils.json_to_sheet(dataToExport);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Ventas");

      // 3. Descargar archivo
      XLSX.writeFile(workbook, `Reporte_Ventas_${new Date().toISOString().split('T')[0]}.xlsx`);
      
      toast.success("Reporte descargado correctamente");
    } catch (error) {
      console.error(error);
      toast.error("Error al generar el Excel");
    }
  };

  return (
    <Button variant="outline" onClick={handleExport} className="gap-2">
      <Download className="h-4 w-4" />
      Exportar Excel
    </Button>
  );
}