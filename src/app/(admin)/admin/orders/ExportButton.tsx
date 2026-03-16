'use client';

import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import * as XLSX from 'xlsx';
import { toast } from 'sonner';

// Definimos una interfaz flexible para lo que recibimos
interface OrderForExport {
  id: string;
  clientName: string;
  clientPhone: string;
  status: string;
  isPaid: boolean;
  totalAmount: number;
  createdAt: Date | string;
  deliveryMethod: string;
  shippingAddress?: string | null;
  shippingCost: number;
  orderItems: {
    quantity: number;
    product: {
      title: string;
    };
  }[];
}

interface ExportButtonProps {
  orders: OrderForExport[];
}

export function ExportButton({ orders }: ExportButtonProps) {
  
  const handleExport = () => {
    try {
      if (!orders || orders.length === 0) {
        toast.error("No hay pedidos para exportar.");
        return;
      }

      // 1. Transformación de Datos (Data Mapping)
      // Convertimos el objeto complejo de la BD a filas planas para Excel
      const dataToExport = orders.map(order => {
        // Formato de items: "2x Globo Rojo, 1x Vela"
        const productsSummary = order.orderItems
          .map(item => `${item.quantity}x ${item.product.title}`)
          .join(', ');

        const deliveryLabel = {
            'PICKUP': 'Recojo en Tienda',
            'DELIVERY': 'Delivery Local',
            'PROVINCE': 'Envío a Provincia'
        }[order.deliveryMethod] || order.deliveryMethod;

        const statusLabel = {
            'PENDING': 'Pendiente',
            'PAID': 'Pagado',
            'DELIVERED': 'Entregado',
            'CANCELLED': 'Cancelado'
        }[order.status] || order.status;

        return {
          'ID Pedido': order.id.split('-')[0].toUpperCase(),
          'Fecha': new Date(order.createdAt).toLocaleDateString('es-PE', { 
              year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' 
          }),
          'Cliente': order.clientName,
          'Celular': order.clientPhone,
          'Método Entrega': deliveryLabel,
          'Dirección': order.shippingAddress || '-',
          'Productos': productsSummary, // 👈 Aquí está la magia
          'Estado': statusLabel,
          'Pagado': order.isPaid ? 'SÍ' : 'NO',
          'Costo Envío': order.shippingCost,
          'Total Venta': order.totalAmount,
        };
      });

      // 2. Crear Libro y Hoja
      const worksheet = XLSX.utils.json_to_sheet(dataToExport);
      
      // Ajustar ancho de columnas automáticamente (Opcional pero pro)
      const wscols = [
        { wch: 10 }, // ID
        { wch: 20 }, // Fecha
        { wch: 25 }, // Cliente
        { wch: 12 }, // Celular
        { wch: 20 }, // Entrega
        { wch: 30 }, // Dirección
        { wch: 50 }, // Productos (Ancho)
        { wch: 10 }, // Estado
        { wch: 8 },  // Pagado
        { wch: 10 }, // Envío
        { wch: 10 }, // Total
      ];
      worksheet['!cols'] = wscols;

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Reporte Ventas");

      // 3. Descargar
      const dateStr = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      XLSX.writeFile(workbook, `FiestasYa_Ventas_${dateStr}.xlsx`);
      
      toast.success("Reporte generado con éxito 📈");
    } catch (error) {
      console.error("Error exportando:", error);
      toast.error("Error al generar el Excel");
    }
  };

  return (
    <Button
      variant="outline"
      onClick={handleExport}
      className="gap-2 bg-primary/5 hover:bg-primary/10 text-primary border-primary/30 hover:border-primary/50 font-medium h-9 transition-colors"
    >
      <Download className="h-4 w-4" />
      Exportar a Excel
    </Button>
  );
}