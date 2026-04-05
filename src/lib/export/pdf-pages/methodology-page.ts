import jsPDF from 'jspdf';
import { OrderForExport } from '../types';

const COLORS = {
  black: [0, 0, 0] as [number, number, number],
  deepGray: [50, 50, 50] as [number, number, number],
  lightGray: [180, 180, 180] as [number, number, number],
  brandAccent: [220, 38, 38] as [number, number, number], // Rojo vibrante original
};

export const createMethodologyPage = (
  doc: jsPDF,
  orders: OrderForExport[]
) => {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const marginX = 25;
  const leftColX = marginX;        // Columna de navegación (números)
  const rightColX = marginX + 35;  // Eje de contenido principal
  const contentWidth = pageWidth - rightColX - marginX;
  
  let yPos = 35; 

  // ==========================================
  // 1. HEADER (Formato Original: Cascada Suiza)
  // ==========================================
  
  doc.setFillColor(...COLORS.brandAccent);
  doc.rect(marginX, yPos - 12, 12, 1.5, 'F'); // Rectángulo original de 12x1.5

  doc.setFontSize(28); // Tamaño original de 28pt
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLORS.black);
  
  doc.text('Anexo', marginX, yPos);
  doc.text('Metodológico', marginX, yPos + 12);
  
  yPos += 22; 
  
  doc.setDrawColor(...COLORS.lightGray);
  doc.setLineWidth(0.2);
  doc.line(marginX, yPos, pageWidth - marginX, yPos);
  
  yPos += 20; 

  // ==========================================
  // 2. SECCIÓN 01: CONTEXTO (Eje Asimétrico)
  // ==========================================
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLORS.black);
  doc.text('01', leftColX, yPos);

  doc.setFontSize(10);
  doc.text('CONTEXTO OPERATIVO', rightColX, yPos - 4);
  
  doc.setFontSize(10.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...COLORS.deepGray);
  
  const contextText = `Este reporte consolida ${orders.length} transacciones validadas bajo protocolos de auditoría interna. Cada métrica presentada ha sido calculada en tiempo real para asegurar que el presente documento refleje fielmente el estado operativo del negocio en el periodo seleccionado.`;
  
  const splitContext = doc.splitTextToSize(contextText, contentWidth);
  doc.text(splitContext, rightColX, yPos + 4, { lineHeightFactor: 1.6 });
  
  yPos += (splitContext.length * 7) + 25; 

  // ==========================================
  // 3. SECCIÓN 02: DICCIONARIO
  // ==========================================
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLORS.black);
  doc.text('02', leftColX, yPos);

  doc.setFontSize(10);
  doc.text('DICCIONARIO DE DATOS', rightColX, yPos - 4);
  
  yPos += 6;

  const definitions = [
    { key: 'Total Pedidos', value: 'Volumen neto de órdenes procesadas.' },
    { key: 'Ingresos Totales', value: 'Valor total de ventas (Bruto + Logística).' },
    { key: 'Ticket Promedio', value: 'Relación ingreso por unidad transaccionada.' },
    { key: 'Conversión', value: 'Porcentaje de efectividad en flujo de pagos.' },
  ];

  definitions.forEach((item) => {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...COLORS.black);
    doc.text(item.key, rightColX, yPos);
    
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...COLORS.deepGray);
    doc.text(`—  ${item.value}`, rightColX + 38, yPos); // Tabulación limpia con guion largo
    
    yPos += 9;
  });
  
  yPos += 20;

  // ==========================================
  // 4. SECCIÓN 03: CONSIDERACIONES
  // ==========================================
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLORS.black);
  doc.text('03', leftColX, yPos);

  doc.setFontSize(10);
  doc.text('CONSIDERACIONES TÉCNICAS', rightColX, yPos - 4);
  
  yPos += 6;

  const notes = [
    'Los montos monetarios incluyen dos decimales de precisión.',
    'Los pedidos cancelados son excluidos de las sumatorias finales.',
    'La información logística se calcula por método de despacho.'
  ];

  notes.forEach((note) => {
    doc.setFontSize(10.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...COLORS.deepGray);
    
    const noteLines = doc.splitTextToSize(note, contentWidth);
    doc.text(noteLines, rightColX, yPos, { lineHeightFactor: 1.4 });
    yPos += (noteLines.length * 6) + 3;
  });

  // ==========================================
  // 5. PIE DE PÁGINA (Anclaje Final)
  // ==========================================
  
  yPos = pageHeight - 40;

  doc.setDrawColor(...COLORS.black);
  doc.setLineWidth(0.5);
  doc.line(marginX, yPos, pageWidth - marginX, yPos);
  
  yPos += 12;
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLORS.black);
  doc.text('Control de Gestión y Finanzas', rightColX, yPos);
  
  yPos += 6;
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...COLORS.deepGray);
  doc.text('Documento de carácter confidencial para uso interno.', rightColX, yPos);
  
  doc.setFontSize(8);
  doc.text('MET_V1_2026', pageWidth - marginX - 25, yPos);

};