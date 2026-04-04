import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { OrderForExport } from './types';
import { calculateTotals, generateFileName } from './transformers';

/**
 * Exporta las órdenes a un PDF con diseño Premium Corporate Dashboard.
 * @param orders Lista de órdenes a exportar.
 * @param base64Logo (Opcional) Logo en base64. Para fondos oscuros, preferible un logo en blanco/negativo.
 */
export const exportToPDF = (orders: OrderForExport[], base64Logo?: string) => {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const now = new Date();
  const dateString = now.toLocaleDateString('es-PE');
  const timeString = now.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
  
  // ═══════════════════════════════════════════════════════════════════════════
  // PÁGINA 1: PORTADA Y DASHBOARD EJECUTIVO
  // ═══════════════════════════════════════════════════════════════════════════
  
  // --- 1. CABECERA FULL BLEED (Borde a Borde) ---
  doc.setFillColor(15, 23, 42); // Slate 900
  doc.rect(0, 0, pageWidth, 45, 'F');
  
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255); 
  doc.text('REPORTE DE OPERACIONES', 20, 24);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184); // Slate 400
  doc.text(`Corte generado el ${dateString} a las ${timeString}`, 20, 32);
  
  if (base64Logo) {
    const logoWidth = 35; 
    const logoHeight = 12;
    doc.addImage(base64Logo, 'PNG', pageWidth - 20 - logoWidth, 18, logoWidth, logoHeight);
  }
  
  // --- Preparación de datos ---
  const { totalSubtotal, totalShipping, totalGeneral } = calculateTotals(orders);
  const ticketPromedio = orders.length > 0 ? totalGeneral / orders.length : 0;
  const totalOrders = orders.length;
  
  const statusStats = {
    'Pendientes': orders.filter(o => o.status === 'PENDING').length,
    'Pagados': orders.filter(o => o.status === 'PAID').length,
    'Entregados': orders.filter(o => o.status === 'DELIVERED').length,
    'Cancelados': orders.filter(o => o.status === 'CANCELLED').length,
  };
  
  const deliveryStats = {
    'Recoger en Tienda': orders.filter(o => o.deliveryMethod === 'PICKUP').length,
    'Delivery Local': orders.filter(o => o.deliveryMethod === 'DELIVERY').length,
    'Envío a Provincia': orders.filter(o => o.deliveryMethod === 'PROVINCE').length,
  };
  
  // --- 2. TARJETA DE KPIs GLOBALES ---
  let yPos = 60;
  
  doc.setFillColor(248, 250, 252); // Slate 50
  doc.setDrawColor(226, 232, 240); // Slate 200
  doc.setLineWidth(0.3);
  doc.roundedRect(20, yPos, pageWidth - 40, 35, 3, 3, 'FD'); 
  
  const stats = [
    { label: 'VOLUMEN DE PEDIDOS', value: totalOrders.toLocaleString('en-US') },
    { label: 'INGRESOS TOTALES', value: `S/ ${totalGeneral.toFixed(2)}` },
    { label: 'TICKET PROMEDIO', value: `S/ ${ticketPromedio.toFixed(2)}` },
  ];
  
  const colWidth = (pageWidth - 40) / 3;
  
  stats.forEach((stat, index) => {
    const startX = 20 + (colWidth * index);
    const centerX = startX + (colWidth / 2);
    
    if (index > 0) {
      doc.setDrawColor(226, 232, 240);
      doc.line(startX, yPos + 6, startX, yPos + 29);
    }
    
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100, 116, 139); // Slate 500
    doc.text(stat.label, centerX, yPos + 12, { align: 'center' });
    
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42); // Slate 900
    doc.text(stat.value, centerX, yPos + 25, { align: 'center' });
  });
  
  yPos += 55;
  
  // --- 3. SECCIÓN DE ANÁLISIS DETALLADO (GRÁFICOS DE BARRAS NATIVOS) ---
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('ANÁLISIS OPERATIVO', 20, yPos);
  
  doc.setDrawColor(226, 232, 240); // Línea sutil en lugar de negra fuerte
  doc.setLineWidth(0.5);
  doc.line(20, yPos + 4, pageWidth - 20, yPos + 4);
  
  yPos += 16;
  
  // Función auxiliar para dibujar mini-gráficos de barras (Progress Bars)
  const drawMiniChart = (x: number, y: number, title: string, data: Record<string, number>, total: number) => {
    let currY = y;
    const barMaxWidth = (pageWidth - 60) / 2; // Mitad de página descontando márgenes
    
    // Título de la columna
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(title.toUpperCase(), x, currY);
    
    currY += 8;
    
    Object.entries(data).forEach(([label, value]) => {
      const pct = total > 0 ? (value / total) * 100 : 0;
      
      // Etiqueta (Ej. "Pendientes")
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(71, 85, 105); // Slate 500
      doc.text(label, x, currY);
      
      // Valor y Porcentaje (Ej. "7 (70.0%)")
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(15, 23, 42);
      doc.text(`${value} (${pct.toFixed(1)}%)`, x + barMaxWidth, currY, { align: 'right' });
      
      currY += 3;
      
      // Fondo de la barra (Gris claro)
      doc.setFillColor(241, 245, 249); // Slate 100
      doc.roundedRect(x, currY, barMaxWidth, 4, 2, 2, 'F');
      
      // Relleno de la barra (Azul oscuro proporcional)
      if (pct > 0) {
        const fillWidth = (pct / 100) * barMaxWidth;
        doc.setFillColor(15, 23, 42); // Slate 900
        doc.roundedRect(x, currY, fillWidth, 4, 2, 2, 'F');
      }
      
      currY += 12; // Espaciado entre barras
    });
  };
  
  // Dibujamos ambos gráficos visuales en paralelo
  drawMiniChart(20, yPos, 'Por Estado de Orden', statusStats, totalOrders);
  drawMiniChart(pageWidth / 2 + 10, yPos, 'Por Método de Envío', deliveryStats, totalOrders);
  
  // --- 4. ÁREA DE FIRMAS FORMAL ---
  const signY = pageHeight - 45;
  
  doc.setDrawColor(148, 163, 184); // Slate 400
  doc.setLineWidth(0.2);
  
  // Bloque Firma 1
  doc.line(30, signY, 80, signY);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('EMITIDO POR', 55, signY + 5, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.text('Firma del Responsable', 55, signY + 9, { align: 'center' });
  
  // Bloque Firma 2
  doc.line(pageWidth - 80, signY, pageWidth - 30, signY);
  doc.setFont('helvetica', 'bold');
  doc.text('REVISADO Y APROBADO', pageWidth - 55, signY + 5, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.text('Sello o Firma de Gerencia', pageWidth - 55, signY + 9, { align: 'center' });
  
  // ═══════════════════════════════════════════════════════════════════════════
  // PÁGINA 2+: DETALLE DE PEDIDOS (Mantenemos la tabla limpia)
  // ═══════════════════════════════════════════════════════════════════════════
  
  doc.addPage();
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('BASE DE DATOS DE TRANSACCIONES', 20, 20);
  
  doc.setDrawColor(15, 23, 42);
  doc.setLineWidth(0.6);
  doc.line(20, 24, pageWidth - 20, 24);
  
  const tableData = orders.map(order => {
    const dniMatch = order.notes?.match(/DNI:\s*(\d+)/i);
    const dni = dniMatch ? dniMatch[1] : '-';
    
    const productsSummary = order.orderItems
      .map(item => `${item.quantity}x ${item.product.title}`)
      .join(', ');

    const deliveryLabel = {
      'PICKUP': 'Recoger',
      'DELIVERY': 'Delivery',
      'PROVINCE': 'Provincia'
    }[order.deliveryMethod] || order.deliveryMethod;

    const statusLabel = {
      'PENDING': 'Pendiente',
      'PAID': 'Pagado',
      'DELIVERED': 'Entregado',
      'CANCELLED': 'Cancelado'
    }[order.status] || order.status;

    const orderDate = new Date(order.createdAt);
    const fecha = orderDate.toLocaleDateString('es-PE', { 
      day: '2-digit', month: '2-digit', year: '2-digit'
    });

    return [
      order.receiptNumber || `#${order.id.substring(0, 8)}`,
      fecha,
      order.clientName,
      dni,
      deliveryLabel,
      productsSummary,
      statusLabel,
      order.isPaid ? 'Sí' : 'No',
      `S/ ${(Number(order.totalAmount) || 0).toFixed(2)}`
    ];
  });

  tableData.push([
    '', '', '', '', '', '', '', 'TOTAL:',
    `S/ ${totalGeneral.toFixed(2)}`
  ]);

  autoTable(doc, {
    head: [['N° Pedido', 'Fecha', 'Cliente', 'Documento', 'Entrega', 'Detalle de Productos', 'Estado', 'Pagado', 'Total']],
    body: tableData,
    startY: 30,
    margin: { left: 20, right: 20 }, 
    theme: 'plain', 
    styles: {
      fontSize: 7.5, 
      cellPadding: 2.5,
      textColor: [51, 65, 85]
    },
    headStyles: {
      fillColor: [241, 245, 249], 
      textColor: [15, 23, 42],       
      fontStyle: 'bold',
      halign: 'center',
      lineWidth: { top: 0, bottom: 0.5 },
      lineColor: [15, 23, 42]
    },
    bodyStyles: {
      lineWidth: { bottom: 0.1 }, 
      lineColor: [226, 232, 240]
    },
    columnStyles: {
      0: { cellWidth: 17, halign: 'center' },
      1: { cellWidth: 14, halign: 'center' },
      2: { cellWidth: 26 },
      3: { cellWidth: 15, halign: 'center' },
      4: { cellWidth: 15, halign: 'center' },
      6: { cellWidth: 14, halign: 'center' },
      7: { cellWidth: 11, halign: 'center' },
      8: { cellWidth: 16, halign: 'right' }
    },
    didParseCell: function(data) {
      if (data.row.index === tableData.length - 1) {
        data.cell.styles.fontStyle = 'bold';
        data.cell.styles.textColor = [15, 23, 42];
        data.cell.styles.fillColor = [241, 245, 249]; 
        data.cell.styles.lineWidth = { top: 0.5, bottom: 0.8 }; 
        data.cell.styles.lineColor = [15, 23, 42];
      }
    }
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // PIE DE PÁGINA GLOBAL
  // ═══════════════════════════════════════════════════════════════════════════
  const pageCount = (doc as any).internal.getNumberOfPages();
  
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(20, pageHeight - 15, pageWidth - 20, pageHeight - 15);
    
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(148, 163, 184);
    
    doc.text('Documento Financiero Confidencial', 20, pageHeight - 10);
    doc.text(`Página ${i} de ${pageCount}`, pageWidth - 20, pageHeight - 10, { align: 'right' });
  }

  const fileName = generateFileName('Reporte_Operaciones', 'pdf', orders.length);
  doc.save(fileName);
  
  return { success: true, count: orders.length };
};