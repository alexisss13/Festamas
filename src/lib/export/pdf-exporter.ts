import jsPDF from 'jspdf';
import { OrderForExport } from './types';
import { calculateTotals, generateFileName } from './transformers';
import { createCoverPage } from './pdf-pages/cover-page';
import { createDashboardPage } from './pdf-pages/dashboard-page';
import { createAnalysisPage } from './pdf-pages/analysis-page';
import { createDetailPage } from './pdf-pages/detail-page';
import { createMethodologyPage } from './pdf-pages/methodology-page';
import { addFooterToAllPages } from './pdf-pages/footer';

/**
 * Exporta las órdenes a un PDF con diseño corporativo profesional.
 * Estructura: 5 páginas
 * - Página 1: Portada (Vertical)
 * - Página 2: Resumen Ejecutivo (Vertical)
 * - Página 3: Análisis Detallado (Vertical)
 * - Página 4: Detalle de Transacciones (Horizontal)
 * - Página 5: Notas y Metodología (Vertical)
 */
export const exportToPDF = (orders: OrderForExport[], selectedColumns?: string[], base64Logo?: string, storeName?: string) => {
  const doc = new jsPDF('p', 'mm', 'a4'); // Inicia en vertical ('p' = portrait)
  const { totalGeneral } = calculateTotals(orders);
  
  // Página 1: Portada
  createCoverPage(doc, orders, { totalGeneral }, base64Logo, storeName);
  
  // Página 2: Resumen Ejecutivo
  doc.addPage('a4', 'portrait'); // Aseguramos que siga vertical
  createDashboardPage(doc, orders, { totalGeneral });
  
  // Página 3: Análisis Detallado
  doc.addPage('a4', 'portrait'); // Aseguramos que siga vertical
  createAnalysisPage(doc, orders, { totalGeneral });
  
  // Página 4: Detalle de Transacciones (¡AQUÍ ROTAMOS LA HOJA!)
  doc.addPage('a4', 'landscape'); 
  createDetailPage(doc, orders, totalGeneral, selectedColumns);
  
  // Página 5: Notas y Metodología (¡AQUÍ LA DEVOLVEMOS A VERTICAL!)
  doc.addPage('a4', 'portrait');
  createMethodologyPage(doc, orders);

  addFooterToAllPages(doc);

  // Guardar archivo
  const fileName = generateFileName('Reporte_Ventas', 'pdf', orders.length);
  doc.save(fileName);
  
  return { success: true, count: orders.length };
};