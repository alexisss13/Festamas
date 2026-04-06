import { OrderForExport } from './types';
import { generateFileName } from './transformers';

export const exportToJSON = (orders: OrderForExport[], selectedColumns?: string[]) => {
  // Mapeo de columnas
  const columnMap: Record<string, string> = {
    'receiptNumber': 'receiptNumber',
    'date': 'fecha',
    'time': 'hora',
    'origin': 'origen',
    'client': 'cliente',
    'dni': 'dni',
    'phone': 'telefono',
    'delivery': 'metodoEntrega',
    'address': 'direccion',
    'products': 'productos',
    'status': 'estado',
    'paid': 'pagado',
    'subtotal': 'subtotal',
    'shipping': 'costoEnvio',
    'total': 'total',
  };

  // Determinar columnas a exportar
  const columnsToExport = selectedColumns && selectedColumns.length > 0
    ? selectedColumns
    : Object.keys(columnMap);

  // Exportar datos completos en formato JSON
  const jsonData = orders.map(order => {
    const allData: Record<string, any> = {
      receiptNumber: order.receiptNumber,
      fecha: new Date(order.createdAt).toISOString(),
      hora: new Date(order.createdAt).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }),
      origen: order.receiptNumber ? 'POS' : 'WEB',
      cliente: order.clientName,
      dni: order.notes?.match(/DNI:\s*(\d+)/i)?.[1] || null,
      telefono: order.clientPhone,
      metodoEntrega: order.deliveryMethod,
      direccion: order.shippingAddress,
      productos: order.orderItems.map(item => ({
        titulo: item.productName,
        cantidad: item.quantity,
        precioUnitario: item.price,
        subtotal: item.quantity * item.price
      })),
      estado: order.status,
      pagado: order.isPaid,
      subtotal: order.totalAmount - order.shippingCost,
      costoEnvio: order.shippingCost,
      total: order.totalAmount,
    };

    // Filtrar solo las columnas seleccionadas
    const filteredData: Record<string, any> = {};
    columnsToExport.forEach(colId => {
      const fieldName = columnMap[colId];
      if (fieldName && fieldName in allData) {
        filteredData[fieldName] = allData[fieldName];
      }
    });

    return filteredData;
  });

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
