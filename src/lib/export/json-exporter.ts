import { OrderForExport } from './types';
import { generateFileName } from './transformers';

export const exportToJSON = (orders: OrderForExport[]) => {
  // Exportar datos completos en formato JSON
  const jsonData = orders.map(order => ({
    id: order.id,
    receiptNumber: order.receiptNumber,
    fecha: new Date(order.createdAt).toISOString(),
    origen: order.receiptNumber ? 'POS' : 'WEB',
    cliente: {
      nombre: order.clientName,
      telefono: order.clientPhone,
      dni: order.notes?.match(/DNI:\s*(\d+)/i)?.[1] || null
    },
    entrega: {
      metodo: order.deliveryMethod,
      direccion: order.shippingAddress,
      costo: order.shippingCost
    },
    productos: order.orderItems.map(item => ({
      titulo: item.product.title,
      cantidad: item.quantity,
      precioUnitario: item.price,
      subtotal: item.quantity * item.price
    })),
    estado: order.status,
    pagado: order.isPaid,
    subtotal: order.totalAmount - order.shippingCost,
    costoEnvio: order.shippingCost,
    total: order.totalAmount,
    notas: order.notes
  }));

  const jsonString = JSON.stringify(jsonData, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  const fileName = generateFileName('Pedidos', 'json', orders.length);
  
  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  return { success: true, count: orders.length };
};
