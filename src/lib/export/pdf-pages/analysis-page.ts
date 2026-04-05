import jsPDF from 'jspdf';
import { OrderForExport } from '../types';

const COLORS = {
  black: [0, 0, 0] as [number, number, number],
  darkGray: [60, 60, 60] as [number, number, number],
  midGray: [130, 130, 130] as [number, number, number], // Gris para contraste en barras
  lightGray: [180, 180, 180] as [number, number, number],
  accent: [220, 38, 38] as [number, number, number], // Acento rojo
};

const formatCurrency = (amount: number) => 
  `S/ ${amount.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export const createAnalysisPage = (
  doc: jsPDF,
  orders: OrderForExport[],
  totals: { totalGeneral: number }
) => {
  const pageWidth = doc.internal.pageSize.getWidth();
  const marginX = 25;
  let yPos = 35;
  
  // ==========================================
  // 1. HEADER DE PÁGINA 
  // ==========================================
  
  doc.setFillColor(...COLORS.accent);
  doc.rect(marginX, yPos - 12, 12, 1.5, 'F');

  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLORS.black);
  
  doc.text('Detalle', marginX, yPos);
  doc.text('Operativo del periodo', marginX, yPos + 12);
  
  yPos += 25; 
  
  doc.setDrawColor(...COLORS.lightGray);
  doc.setLineWidth(0.2);
  doc.line(marginX, yPos, pageWidth - marginX, yPos);
  
  yPos += 20; 
  
  // ==========================================
  // 2. ANÁLISIS TEMPORAL / ORIGEN
  // ==========================================
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLORS.darkGray); 
  doc.text('ORIGEN DE TRANSACCIONES', marginX, yPos);
  
  yPos += 14; 
  
  const posOrders = orders.filter(o => o.receiptNumber).length;
  const webOrders = orders.filter(o => !o.receiptNumber).length;
  const posPercentage = orders.length > 0 ? (posOrders / orders.length) * 100 : 0;
  const webPercentage = orders.length > 0 ? (webOrders / orders.length) * 100 : 0;
  
  const colHalfX = marginX + ((pageWidth - (marginX * 2)) / 2);

  // --- Columna 1: POS ---
  const posColor = posOrders === 0 ? COLORS.lightGray : COLORS.black;
  const posDescColor = posOrders === 0 ? COLORS.lightGray : COLORS.darkGray;

  doc.setFontSize(32);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...posColor);
  doc.text(`${posPercentage.toFixed(0)}%`, marginX, yPos);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...posDescColor);
  doc.text(`Punto de Venta (POS) — ${posOrders} orders`, marginX, yPos + 8);

  // --- Columna 2: WEB ---
  const webColor = webOrders === 0 ? COLORS.lightGray : COLORS.black;
  const webDescColor = webOrders === 0 ? COLORS.lightGray : COLORS.darkGray;

  doc.setFontSize(32);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...webColor);
  doc.text(`${webPercentage.toFixed(0)}%`, colHalfX, yPos);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...webDescColor);
  doc.text(`Tienda Online (WEB) — ${webOrders} orders`, colHalfX, yPos + 8);
  
  yPos += 35; 

  // ==========================================
  // 3. ESTRUCTURA DE INGRESOS
  // ==========================================
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLORS.darkGray); 
  doc.text('ESTRUCTURA DE INGRESOS', marginX, yPos);
  
  yPos += 10; 
  
  const totalShipping = orders.reduce((sum, o) => sum + (Number(o.shippingCost) || 0), 0);
  const totalSubtotal = totals.totalGeneral - totalShipping;
  const subtotalPercentage = totals.totalGeneral > 0 ? (totalSubtotal / totals.totalGeneral) * 100 : 0;
  const shippingPercentage = totals.totalGeneral > 0 ? (totalShipping / totals.totalGeneral) * 100 : 0;
  
  // A. Etiqueta y TOTAL GIGANTE 
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLORS.midGray); 
  doc.text('INGRESOS TOTALES', marginX, yPos); 
  
  yPos += 16; // <-- CORREGIDO: Aumentado para dar respiro al número gigante

  doc.setFontSize(32);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLORS.black);
  doc.text(formatCurrency(totals.totalGeneral), marginX, yPos);
  
  yPos += 10; 

  // B. LA BARRA DE PROPORCIÓN
  const fullBarWidth = pageWidth - (marginX * 2);
  const barHeight = 4; 
  
  const subWidth = totals.totalGeneral > 0 ? (totalSubtotal / totals.totalGeneral) * fullBarWidth : 0;
  const shipWidth = totals.totalGeneral > 0 ? (totalShipping / totals.totalGeneral) * fullBarWidth : 0;

  // Fondo (Estado 0)
  doc.setFillColor(240, 240, 240); 
  doc.rect(marginX, yPos, fullBarWidth, barHeight, 'F');

  // Segmento Productos
  if (subWidth > 0) {
    doc.setFillColor(...COLORS.black);
    doc.rect(marginX, yPos, subWidth, barHeight, 'F');
  }
  
  // Segmento Envíos
  if (shipWidth > 0) {
    doc.setFillColor(...COLORS.midGray);
    doc.rect(marginX + subWidth, yPos, shipWidth, barHeight, 'F');
  }

  yPos += 14; 

  // C. LEYENDA TIPOGRÁFICA
  
  // Columna 1: Productos
  const subTitleColor = totalSubtotal === 0 ? COLORS.lightGray : COLORS.black; 
  const subValueColor = totalSubtotal === 0 ? COLORS.lightGray : COLORS.black;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...subTitleColor);
  doc.text('SUBTOTAL PRODUCTOS', marginX, yPos);
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...subValueColor);
  doc.text(`${formatCurrency(totalSubtotal)}  —  ${subtotalPercentage.toFixed(1)}%`, marginX, yPos + 7);

  // Columna 2: Envíos
  const shipTitleColor = totalShipping === 0 ? COLORS.lightGray : COLORS.midGray; 
  const shipValueColor = totalShipping === 0 ? COLORS.lightGray : COLORS.black;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...shipTitleColor);
  doc.text('COSTOS DE ENVÍO', colHalfX, yPos);
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...shipValueColor);
  doc.text(`${formatCurrency(totalShipping)}  —  ${shippingPercentage.toFixed(1)}%`, colHalfX, yPos + 7);

  yPos += 35; 

  // ==========================================
  // 4. MÉTRICAS OPERATIVAS
  // ==========================================
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLORS.darkGray); 
  doc.text('INDICADORES DE RENDIMIENTO', marginX, yPos);
  
  yPos += 16; 
  
  const paidOrders = orders.filter(o => o.isPaid).length;
  const conversionRate = orders.length > 0 ? (paidOrders / orders.length) * 100 : 0;
  
  const pendingOrders = orders.filter(o => o.status === 'PENDING').length;
  const completedOrders = orders.filter(o => o.status === 'DELIVERED').length;
  
  const col1 = marginX;
  const col2 = marginX + 55;
  const col3 = col2 + 65;

  // Métrica 1: Tasa de Conversión
  const convColor = conversionRate === 0 ? COLORS.lightGray : COLORS.black;
  doc.setFontSize(24);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...convColor);
  doc.text(`${conversionRate.toFixed(1)}%`, col1, yPos);
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLORS.black);
  doc.text('CONVERSIÓN', col1, yPos + 8);
  
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...COLORS.darkGray);
  doc.text(`${paidOrders}/${orders.length} Pagados`, col1, yPos + 14);

  // Métrica 2: Completados
  const compColor = completedOrders === 0 ? COLORS.lightGray : COLORS.black;
  doc.setFontSize(24);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...compColor);
  doc.text(completedOrders.toString(), col2, yPos);
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLORS.black);
  doc.text('COMPLETADOS', col2, yPos + 8);
  
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...COLORS.darkGray);
  const compPct = orders.length > 0 ? ((completedOrders / orders.length) * 100).toFixed(1) : 0;
  doc.text(`${compPct}% del total`, col2, yPos + 14);

  // Métrica 3: Pendientes
  const pendColor = pendingOrders === 0 ? COLORS.lightGray : COLORS.black;
  doc.setFontSize(24);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...pendColor);
  doc.text(pendingOrders.toString(), col3, yPos);
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLORS.black);
  doc.text('PENDIENTES', col3, yPos + 8);
  
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...COLORS.darkGray);
  const pendPct = orders.length > 0 ? ((pendingOrders / orders.length) * 100).toFixed(1) : 0;
  doc.text(`${pendPct}% del total`, col3, yPos + 14);

};