import jsPDF from 'jspdf';
import { OrderForExport } from '../types';

const COLORS = {
  black: [0, 0, 0] as [number, number, number],
  darkGray: [60, 60, 60] as [number, number, number],
  lightGray: [180, 180, 180] as [number, number, number],
  brandAccent: [220, 38, 38] as [number, number, number], // Rojo original vibrante para marca
  mutedRed: [175, 90, 90] as [number, number, number],    // Rojo apagado para sutileza técnica
};

const formatCurrency = (amount: number) => 
  `S/ ${amount.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

/**
 * Dibuja una barra con patrón de hachurado técnico minimalista.
 * Configuración: Opacidad 22%, Espaciado 5.0, Grosor 0.12.
 */
const drawHatchedBar = (
  doc: jsPDF,
  x: number,
  y: number,
  width: number,
  height: number,
  color: [number, number, number]
) => {
  const hatchSpacing = 5.0; 

  // Estado de Gráficos: Opacidad al 22% para no competir con datos reales
  // @ts-ignore
  const gs = new (doc as any).GState({ opacity: 0.22 });
  doc.setGState(gs);

  doc.setDrawColor(...color);
  doc.setLineWidth(0.12); 
  
  // Contorno de la caja
  doc.rect(x, y, width, height, 'D');

  // Patrón diagonal rítmico
  for (let i = -height; i <= width; i += hatchSpacing) {
    const x1 = Math.max(x, x + i);
    const y1 = Math.min(y + height, y + (x1 - (x + i)));
    const x2 = Math.min(x + width, x + i + height);
    const y2 = y + (x2 - (x + i));

    if (x1 < x + width && x2 > x) {
      doc.line(x1, y1, x2, y2);
    }
  }

  // Restaurar estado original
  // @ts-ignore
  doc.setGState(new (doc as any).GState({ opacity: 1.0 }));
};

export const createDashboardPage = (
  doc: jsPDF,
  orders: OrderForExport[],
  totals: { totalGeneral: number }
) => {
  const pageWidth = doc.internal.pageSize.getWidth();
  const marginX = 25; 
  let yPos = 35; 
  
  // ==========================================
  // 1. HEADER (Identidad de Marca - Rojo Original)
  // ==========================================
  
  doc.setFillColor(...COLORS.brandAccent); // Restaurado al tono vibrante
  doc.rect(marginX, yPos - 12, 12, 1.5, 'F');

  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLORS.black);
  
  doc.text('Resumen', marginX, yPos);
  doc.text('General del reporte', marginX, yPos + 12);
  
  yPos += 22; 
  
  doc.setDrawColor(...COLORS.lightGray);
  doc.setLineWidth(0.2);
  doc.line(marginX, yPos, pageWidth - marginX, yPos);
  
  yPos += 15; 

  // ==========================================
  // 2. DISTRIBUCIÓN POR ESTADO
  // ==========================================
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLORS.darkGray);
  doc.text('DISTRIBUCIÓN POR ESTADO', marginX, yPos);
  
  yPos += 12; 
  
  const statusData = [
    { label: 'Pendientes', count: orders.filter(o => o.status === 'PENDING').length },
    { label: 'Pagados', count: orders.filter(o => o.status === 'PAID').length },
    { label: 'Entregados', count: orders.filter(o => o.status === 'DELIVERED').length },
    { label: 'Cancelados', count: orders.filter(o => o.status === 'CANCELLED').length },
  ];
  
  const labelWidth = 40;
  const maxBarWidth = 70; 
  const maxCountStatus = Math.max(...statusData.map(s => s.count), 1);
  
  statusData.forEach((status) => {
    const percentage = orders.length > 0 ? (status.count / orders.length) * 100 : 0;
    const barWidth = (status.count / maxCountStatus) * maxBarWidth;
    const rowColor = status.count === 0 ? COLORS.lightGray : COLORS.black;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...rowColor);
    doc.text(status.label, marginX, yPos);
    
    if (status.count > 0) {
      if (status.label === 'Pagados' || status.label === 'Entregados') {
        doc.setFillColor(...COLORS.black);
      } else {
        doc.setFillColor(120, 120, 120);
      }
      doc.rect(marginX + labelWidth, yPos - 3.5, barWidth, 4, 'F'); 
    } else {
      // Estado Cero con el tono sutil configurado
      drawHatchedBar(doc, marginX + labelWidth, yPos - 3.5, maxBarWidth, 4, COLORS.mutedRed);
    }
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...rowColor);
    doc.text(status.count.toString(), marginX + labelWidth + maxBarWidth + 10, yPos);

    doc.setFont('helvetica', 'normal');
    doc.text(`(${percentage.toFixed(1)}%)`, marginX + labelWidth + maxBarWidth + 20, yPos);
    
    yPos += 11; 
  });
  
  yPos += 15; 
  
  // ==========================================
  // 3. MÉTODO DE ENTREGA
  // ==========================================
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLORS.darkGray);
  doc.text('MÉTODO DE ENTREGA', marginX, yPos);
  
  yPos += 12; 
  
  const deliveryData = [
    { label: 'Recoger Tienda', count: orders.filter(o => o.deliveryMethod === 'PICKUP').length },
    { label: 'Delivery Local', count: orders.filter(o => o.deliveryMethod === 'DELIVERY').length },
    { label: 'Provincia', count: orders.filter(o => o.deliveryMethod === 'PROVINCE').length },
  ];
  
  const maxDeliveryCount = Math.max(...deliveryData.map(d => d.count), 1);
  
  deliveryData.forEach((delivery) => {
    const percentage = orders.length > 0 ? (delivery.count / orders.length) * 100 : 0;
    const barWidth = (delivery.count / maxDeliveryCount) * maxBarWidth;
    const rowColor = delivery.count === 0 ? COLORS.lightGray : COLORS.black;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...rowColor);
    doc.text(delivery.label, marginX, yPos);
    
    if (delivery.count > 0) {
      doc.setFillColor(...COLORS.black);
      doc.rect(marginX + labelWidth, yPos - 3.5, barWidth, 4, 'F');
    } else {
      drawHatchedBar(doc, marginX + labelWidth, yPos - 3.5, maxBarWidth, 4, COLORS.mutedRed);
    }
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...rowColor);
    doc.text(delivery.count.toString(), marginX + labelWidth + maxBarWidth + 10, yPos);

    doc.setFont('helvetica', 'normal');
    doc.text(`(${percentage.toFixed(1)}%)`, marginX + labelWidth + maxBarWidth + 20, yPos);
    
    yPos += 11; 
  });
  
  // --- SEPARADOR KPI SUPERIOR ---
  yPos += 8; 
  doc.setDrawColor(...COLORS.lightGray);
  doc.setLineWidth(0.2);
  doc.line(marginX, yPos, pageWidth - marginX, yPos);
  
  // Margen superior calibrado para KPIs
  yPos += 16; 

  // ==========================================
  // 4. KPIs PRINCIPALES
  // ==========================================
  
  const ticketPromedio = orders.length > 0 ? totals.totalGeneral / orders.length : 0;
  const col1X = marginX;
  const col2X = marginX + 55;
  const col3X = col2X + 65;
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLORS.darkGray); 
  doc.text('TOTAL PEDIDOS', col1X, yPos);
  doc.text('INGRESOS TOTALES', col2X, yPos);
  doc.text('TICKET PROMEDIO', col3X, yPos);
  
  yPos += 10; 
  doc.setFontSize(24);
  doc.setTextColor(...COLORS.black);
  doc.setFont('helvetica', 'normal');
  doc.text(orders.length.toString(), col1X, yPos);
  doc.text(formatCurrency(totals.totalGeneral), col2X, yPos);
  doc.text(formatCurrency(ticketPromedio), col3X, yPos);
  
  // Margen inferior calibrado para cerrar el bloque
  yPos += 12; 
  doc.setDrawColor(...COLORS.lightGray);
  doc.setLineWidth(0.2);
  doc.line(marginX, yPos, pageWidth - marginX, yPos);
  
  // ==========================================
  // 5. INSIGHT OPERATIVO
  // ==========================================
  
  yPos += 16; 
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLORS.darkGray);
  doc.text('INSIGHT OPERATIVO', marginX, yPos);
  
  yPos += 8;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...COLORS.black); 
  
  const paidOrders = orders.filter(o => o.isPaid).length;
  const paidPercentage = orders.length > 0 ? (paidOrders / orders.length) * 100 : 0;
  const insightText = `El ${paidPercentage.toFixed(1)}% de las transacciones del período se encuentran pagadas exitosamente (${paidOrders} de ${orders.length} pedidos).`;
  
  const splitInsight = doc.splitTextToSize(insightText, pageWidth - (marginX * 2));
  doc.text(splitInsight, marginX, yPos, { lineHeightFactor: 1.6 });

};