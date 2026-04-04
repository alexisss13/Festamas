import { OrderForExport, TransformedOrderData } from './types';

// Función para transformar datos de pedidos a formato de exportación
export const transformOrderData = (orders: OrderForExport[]): TransformedOrderData[] => {
  return orders.map(order => {
    const dniMatch = order.notes?.match(/DNI:\s*(\d+)/i);
    const dni = dniMatch ? dniMatch[1] : '-';
    const origen = order.receiptNumber ? 'POS' : 'WEB';
    
    const productsSummary = order.orderItems
      .map(item => `${item.quantity}x ${item.product.title} (S/${(Number(item.price) || 0).toFixed(2)})`)
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

    return {
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
