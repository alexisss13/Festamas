import jsPDF from 'jspdf';
import { OrderForExport } from '../types';

const COLORS = {
  black: [0, 0, 0] as [number, number, number],
  darkGray: [60, 60, 60] as [number, number, number],
  lightGray: [180, 180, 180] as [number, number, number],
  accent: [220, 38, 38] as [number, number, number], // Acento rojo
};

export const createCoverPage = (
  doc: jsPDF,
  orders: OrderForExport[],
  totals: { totalGeneral: number },
  base64Logo?: string,
  storeName?: string
) => {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const marginX = 25;
  
  const now = new Date();
  const dateStr = now.toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric' });
  const year = now.getFullYear().toString();

  // ==========================================
  // 1. HEADER (Cabecera Compacta)
  // ==========================================
  
  doc.setFillColor(...COLORS.black);
  doc.rect(0, 0, pageWidth, 3, 'F'); 

  let headerY = 15;
  
  if (base64Logo) {
    doc.addImage(base64Logo, 'PNG', marginX, headerY, 12, 12);
  }

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLORS.black);
  doc.text(storeName?.toUpperCase() || 'DOCUMENTO OFICIAL', marginX + 18, headerY + 8);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...COLORS.darkGray);
  const refMonth = (now.getMonth() + 1).toString().padStart(2, '0');
  doc.text(`REF: REP-${year}-${refMonth}`, pageWidth - marginX, headerY + 8, { align: 'right' });

  doc.setDrawColor(...COLORS.lightGray);
  doc.setLineWidth(0.2);
  doc.line(marginX, headerY + 18, pageWidth - marginX, headerY + 18);

  // ==========================================
  // 2. CUERPO PRINCIPAL (Estilo Editorial)
  // ==========================================
  
  let yPos = 100;

  // Acento: Línea fina horizontal roja
  doc.setFillColor(...COLORS.accent);
  doc.rect(marginX, yPos - 20, 18, 1.5, 'F');

  // Tipografía Masiva
  doc.setFontSize(38);
  doc.setTextColor(...COLORS.black);
  doc.setFont('helvetica', 'bold');
  doc.text('Reporte de', marginX, yPos);
  doc.text('Resultados', marginX, yPos + 15);

  yPos += 35; 
  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...COLORS.darkGray);
  doc.text('Análisis comercial y financiero del período.', marginX, yPos);

  // ==========================================
  // 3. PÁRRAFO DE RESUMEN (Márgenes amplios, Alto interlineado)
  // ==========================================
  yPos += 18; // Vuelve al margen superior amplio original
  
  const summaryText = "Este reporte consolida el rendimiento comercial del período, detallando el volumen de transacciones e ingresos. Su objetivo es facilitar la evaluación rápida de la salud operativa del negocio, sirviendo como base sólida para la toma de decisiones estratégicas financieras futuras.";

  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);

  const textMaxWidth = pageWidth - (marginX * 2) - 15; 
  const splitText = doc.splitTextToSize(summaryText, textMaxWidth);
  const strictThreeLines = splitText.slice(0, 3); 

  // AUMENTO DE INTERLINEADO: lineHeightFactor ahora está en 2.2
  doc.text(strictThreeLines, marginX, yPos, { lineHeightFactor: 2.2 });

  // Margen inferior: cálculo ajustado para el nuevo interlineado y restaurando el espacio extra
  yPos += (strictThreeLines.length * 8) + 15; 

  doc.setDrawColor(...COLORS.lightGray);
  doc.setLineWidth(0.2);
  doc.line(marginX, yPos, pageWidth - marginX, yPos);

  // ==========================================
  // 4. DATOS DE LAS MÉTRICAS MASIVAS
  // ==========================================
  yPos += 25; // Vuelve al espacio amplio antes de los números
  
  // Calcular métricas estratégicas
  const ticketPromedio = orders.length > 0 ? totals.totalGeneral / orders.length : 0;
  const paidOrders = orders.filter(o => o.isPaid).length;
  const conversionRate = orders.length > 0 ? (paidOrders / orders.length) * 100 : 0;
  
  // Columna 1
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLORS.lightGray);
  doc.text('PERÍODO', marginX, yPos);
  
  doc.setFontSize(24);
  doc.setTextColor(...COLORS.black);
  doc.setFont('helvetica', 'normal');
  doc.text(year, marginX, yPos + 10);

  // Columna 2
  const col2X = marginX + 50;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLORS.lightGray);
  doc.text('TICKET PROMEDIO', col2X, yPos);
  
  doc.setFontSize(24);
  doc.setTextColor(...COLORS.black);
  doc.setFont('helvetica', 'normal');
  doc.text(`S/ ${ticketPromedio.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, col2X, yPos + 10);

  // Columna 3
  const col3X = col2X + 75;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLORS.lightGray);
  doc.text('TASA CONVERSIÓN', col3X, yPos);
  
  doc.setFontSize(24);
  doc.setTextColor(...COLORS.black);
  doc.setFont('helvetica', 'normal');
  doc.text(`${conversionRate.toFixed(1)}%`, col3X, yPos + 10);

  // ==========================================
  // 5. FOOTER (Pie de página estructurado)
  // ==========================================
  
  const footerY = pageHeight - 25;

  doc.setDrawColor(...COLORS.lightGray);
  doc.setLineWidth(0.2);
  doc.line(marginX, footerY, pageWidth - marginX, footerY);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...COLORS.darkGray);

  doc.text(`Generado: ${dateStr}`, marginX, footerY + 10);
  doc.text('Uso Interno Confidencial', pageWidth / 2, footerY + 10, { align: 'center' });
  doc.setFont('helvetica', 'bold');
  doc.text('PÁG. 01', pageWidth - marginX, footerY + 10, { align: 'right' });
};