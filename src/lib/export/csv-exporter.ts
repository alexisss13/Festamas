import * as XLSX from 'xlsx-js-style';
import { OrderForExport } from './types';
import { transformOrderData, calculateTotals, generateFileName } from './transformers';

export const exportToCSV = (orders: OrderForExport[], selectedColumns?: string[]) => {
  const dataToExport = transformOrderData(orders, selectedColumns);
  const { totalSubtotal, totalShipping, totalGeneral } = calculateTotals(orders);

  // Crear fila de totales solo con las columnas seleccionadas
  const totalsRow: any = {};
  const firstRow = dataToExport[0] || {};
  Object.keys(firstRow).forEach(key => {
    if (key === 'Productos') {
      totalsRow[key] = 'TOTALES';
    } else if (key === 'Subtotal') {
      totalsRow[key] = totalSubtotal;
    } else if (key === 'Costo Envío') {
      totalsRow[key] = totalShipping;
    } else if (key === 'Total') {
      totalsRow[key] = totalGeneral;
    } else {
      totalsRow[key] = '';
    }
  });

  dataToExport.push(totalsRow);

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
