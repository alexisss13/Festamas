import * as XLSX from 'xlsx-js-style';
import { OrderForExport } from './types';
import { transformOrderData, calculateTotals, generateFileName } from './transformers';

export const exportToCSV = (orders: OrderForExport[]) => {
  const dataToExport = transformOrderData(orders);
  const { totalSubtotal, totalShipping, totalGeneral } = calculateTotals(orders);

  dataToExport.push({
    'N° Pedido': '',
    'Fecha': '',
    'Hora': '',
    'Origen': '',
    'Cliente': '',
    'DNI': '',
    'Celular': '',
    'Método Entrega': '',
    'Dirección': '',
    'Productos': 'TOTALES',
    'Estado': '',
    'Pagado': '',
    'Subtotal': totalSubtotal,
    'Costo Envío': totalShipping,
    'Total': totalGeneral,
  });

  const worksheet = XLSX.utils.json_to_sheet(dataToExport);
  const csv = XLSX.utils.sheet_to_csv(worksheet);

  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  const fileName = generateFileName('Pedidos', 'csv', orders.length);
  
  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  return { success: true, count: orders.length };
};
