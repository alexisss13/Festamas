import * as XLSX from 'xlsx-js-style';
import { OrderForExport } from './types';
import { calculateTotals, generateFileName } from './transformers';
import { createSummarySheet } from './sheets/summary-sheet';
import { createDetailSheet } from './sheets/detail-sheet';
import { createProductsSheet } from './sheets/products-sheet';
import { createDeliverySheet } from './sheets/delivery-sheet';

export const exportToExcel = (orders: OrderForExport[], selectedColumns?: string[]) => {
  const { totalSubtotal, totalShipping, totalGeneral } = calculateTotals(orders);

  const workbook = XLSX.utils.book_new();
  workbook.Props = {
    Title: "Reporte de Pedidos",
    Subject: "Ventas",
    Author: "FiestasYa",
    CreatedDate: new Date()
  };
  
  // Crear las 4 hojas
  const summarySheet = createSummarySheet(orders, { totalSubtotal, totalShipping, totalGeneral });
  const detailSheet = createDetailSheet(orders, { totalSubtotal, totalShipping, totalGeneral }, selectedColumns);
  const productsSheet = createProductsSheet(orders);
  const deliverySheet = createDeliverySheet(orders);
  
  // Agregar hojas al workbook
  XLSX.utils.book_append_sheet(workbook, summarySheet, "Resumen Ejecutivo");
  XLSX.utils.book_append_sheet(workbook, detailSheet, "Detalle de Pedidos");
  XLSX.utils.book_append_sheet(workbook, productsSheet, "Top Productos");
  XLSX.utils.book_append_sheet(workbook, deliverySheet, "Análisis Entrega");

  const fileName = generateFileName('Pedidos', 'xlsx', orders.length);

  XLSX.writeFile(workbook, fileName, { 
    bookType: 'xlsx',
    cellStyles: true,
    type: 'binary',
    compression: true // Compresión habilitada
  });
  
  return { success: true, total: totalGeneral, count: orders.length };
};
