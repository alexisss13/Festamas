import { OrderForExport, TransformedOrderData } from './types';

// Función para transformar datos de pedidos a formato de exportación
export const transformOrderData = (orders: OrderForExport[], selectedColumns?: string[]): TransformedOrderData[] => {
  return orders.map(order => {
    const dniMatch = order.notes?.match(/DNI:\s*(\d+)/i);
    const dni = dniMatch ? dniMatch[1] : '-';
    const origen = order.receiptNumber ? 'POS' : 'WEB';
    
    const productsSummary = order.orderItems
      .map(item => `${item.quantity}x ${item.productName} (S/${(Number(item.price) || 0).toFixed(2)})`)
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

    const subtotal = (Number(order.totalAmount) || 0) - (Number(order.shippingCost) || 0);
    const orderDate = new Date(order.createdAt);
    const fecha = orderDate.toLocaleDateString('es-PE', { 
      year: 'numeric', month: '2-digit', day: '2-digit'
    });
    const hora = orderDate.toLocaleTimeString('es-PE', { 
      hour: '2-digit', minute: '2-digit'
    });

    const allData = {
      'N° Pedido': order.receiptNumber || order.id.split('-')[0].toUpperCase(),
      'Fecha': fecha,
      'Hora': hora,
      'Origen': origen,
      'Cliente': order.clientName,
      'DNI': dni,
      'Celular': order.clientPhone,
      'Método Entrega': deliveryLabel,
      'Dirección': order.shippingAddress || '-',
      'Productos': productsSummary,
      'Estado': statusLabel,
      'Pagado': order.isPaid ? 'SÍ' : 'NO',
      'Subtotal': subtotal,
      'Costo Envío': order.shippingCost,
      'Total': order.totalAmount,
    };

    // Si no hay columnas seleccionadas, devolver todo
    if (!selectedColumns || selectedColumns.length === 0) {
      return allData;
    }

    // Mapeo de IDs de columnas a nombres de campos
    const columnMap: Record<string, keyof TransformedOrderData> = {
      'receiptNumber': 'N° Pedido',
      'date': 'Fecha',
      'time': 'Hora',
      'origin': 'Origen',
      'client': 'Cliente',
      'dni': 'DNI',
      'phone': 'Celular',
      'delivery': 'Método Entrega',
      'address': 'Dirección',
      'products': 'Productos',
      'status': 'Estado',
      'paid': 'Pagado',
      'subtotal': 'Subtotal',
      'shipping': 'Costo Envío',
      'total': 'Total',
    };

    // Filtrar solo las columnas seleccionadas
    const filteredData: Partial<TransformedOrderData> = {};
    selectedColumns.forEach(colId => {
      const fieldName = columnMap[colId];
      if (fieldName && fieldName in allData) {
        (filteredData as Record<string, string | number>)[fieldName] = allData[fieldName];
      }
    });

    return filteredData as TransformedOrderData;
  });
};

// Calcular totales
export const calculateTotals = (orders: OrderForExport[]) => {
  const totalSubtotal = orders.reduce((sum, order) => {
    const amount = Number(order.totalAmount) || 0;
    const shipping = Number(order.shippingCost) || 0;
    return sum + (amount - shipping);
  }, 0);
  const totalShipping = orders.reduce((sum, order) => sum + (Number(order.shippingCost) || 0), 0);
  const totalGeneral = orders.reduce((sum, order) => sum + (Number(order.totalAmount) || 0), 0);

  return { totalSubtotal, totalShipping, totalGeneral };
};

// Generar nombre de archivo
export const generateFileName = (prefix: string, extension: string, count: number): string => {
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];
  const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '');
  return `${prefix}_${dateStr}_${timeStr}_${count}registros.${extension}`;
};
