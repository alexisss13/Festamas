import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { OrderForExport } from '../types';

// Paleta Suiza estricta
const COLORS = {
  black: [0, 0, 0] as [number, number, number],
  darkGray: [60, 60, 60] as [number, number, number],
  lightGray: [200, 200, 200] as [number, number, number],
  accent: [220, 38, 38] as [number, number, number], // Acento rojo
};

const COLUMN_MAP: Record<string, string> = {
  'receiptNumber': 'N° Pedido',
  'date': 'Fecha',
  'time': 'Hora',
  'origin': 'Origen',
  'client': 'Cliente',
  'dni': 'DNI',
  'phone': 'Celular',
  'delivery': 'Entrega',
  'address': 'Dirección',
  'products': 'Productos',
  'status': 'Estado',
  'paid': 'Pagado',
  'subtotal': 'Subtotal',
  'shipping': 'Envío',
  'total': 'Total',
};

// Anchos recalibrados EXACTOS para 247mm (Ancho A4 Landscape menos márgenes)
const COLUMN_WIDTHS: Record<string, number> = {
  'receiptNumber': 18,
  'date': 13,     
  'time': 11,
  'origin': 11,
  'client': 21,   
  'dni': 14,      
  'phone': 20,    
  'delivery': 13, 
  'address': 25,
  'products': 38, 
  'status': 16,
  'paid': 12,
  'subtotal': 15,
  'shipping': 13,
  'total': 15,
};

const formatCurrency = (amount: number) => `S/ ${amount.toFixed(2)}`;

const getDeliveryLabel = (method: string) => ({
  'PICKUP': 'Recoger',
  'DELIVERY': 'Delivery',
  'PROVINCE': 'Provincia'
}[method] || method);

const getStatusLabel = (status: string) => ({
  'PENDING': 'Pendiente',
  'PAID': 'Pagado',
  'DELIVERED': 'Entregado',
  'CANCELLED': 'Cancelado'
}[status] || status);

const extractDNI = (notes?: string | null) => {
  const match = notes?.match(/DNI:\s*(\d+)/i);
  return match ? match[1] : '-';
};

export const createDetailPage = (
  doc: jsPDF,
  orders: OrderForExport[],
  totalGeneral: number,
  selectedColumns?: string[]
) => {
  const pageWidth = doc.internal.pageSize.getWidth();
  const marginX = 25; 
  let yPos = 35;
  
  // ==========================================
  // 1. HEADER DE PÁGINA (Una sola línea)
  // ==========================================
  
  doc.setFillColor(...COLORS.accent);
  doc.rect(marginX, yPos - 12, 12, 1.5, 'F');

  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLORS.black);
  
  doc.text('Registro Transaccional', marginX, yPos);
  
  // <-- MODIFICADO: Reducido drásticamente para pegar la línea al título
  yPos += 8; 
  
  doc.setDrawColor(...COLORS.lightGray);
  doc.setLineWidth(0.2);
  doc.line(marginX, yPos, pageWidth - marginX, yPos);
  
  // La tabla empieza casi inmediatamente después de la línea
  yPos += 4; 
  
  // ==========================================
  // 2. PREPARACIÓN DE DATOS DE LA TABLA
  // ==========================================
  
  const columnsToShow = selectedColumns && selectedColumns.length > 0
    ? selectedColumns
    : Object.keys(COLUMN_MAP);

  const headers = columnsToShow.map(id => COLUMN_MAP[id] || id);

  const tableData = orders.map(order => {
    const orderDate = new Date(order.createdAt);
    
    const productsText = order.orderItems.length > 3
      ? `${order.orderItems.slice(0, 3).map(item => `${item.quantity}x ${item.productName}`).join(', ')}... (+${order.orderItems.length - 3})`
      : order.orderItems.map(item => `${item.quantity}x ${item.productName}`).join(', ');
    
    const allData: Record<string, string> = {
      'receiptNumber': order.receiptNumber || `#${order.id.substring(0, 8)}`,
      'date': orderDate.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: '2-digit' }),
      'time': orderDate.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }),
      'origin': order.receiptNumber ? 'POS' : 'WEB',
      'client': order.clientName,
      'dni': extractDNI(order.notes),
      'phone': order.clientPhone,
      'delivery': getDeliveryLabel(order.deliveryMethod),
      'address': order.shippingAddress || '-',
      'products': productsText,
      'status': getStatusLabel(order.status),
      'paid': order.isPaid ? 'Sí' : 'No',
      'subtotal': formatCurrency((Number(order.totalAmount) || 0) - (Number(order.shippingCost) || 0)),
      'shipping': formatCurrency(Number(order.shippingCost) || 0),
      'total': formatCurrency(Number(order.totalAmount) || 0)
    };

    return columnsToShow.map(id => allData[id] || '-');
  });

  // Fila de totales
  const totalShipping = orders.reduce((s, o) => s + (Number(o.shippingCost) || 0), 0);
  const totalSubtotal = totalGeneral - totalShipping;
  
  const totalRowData = columnsToShow.map((id) => {
    if (id === 'total') return formatCurrency(totalGeneral);
    if (id === 'subtotal') return formatCurrency(totalSubtotal);
    if (id === 'shipping') return formatCurrency(totalShipping);
    if (id === 'client') return 'TOTALES';
    return '';
  });
  
  tableData.push(totalRowData);

  // Calcular anchos de columna dinámicamente
  const availableWidth = pageWidth - (marginX * 2); 
  const totalRequestedWidth = columnsToShow.reduce((sum, id) => sum + (COLUMN_WIDTHS[id] || 20), 0);
  
  const scaleFactor = totalRequestedWidth > availableWidth ? availableWidth / totalRequestedWidth : 1;
  
  const columnStyles: Record<number, any> = {};
  columnsToShow.forEach((id, index) => {
    const width = (COLUMN_WIDTHS[id] || 20) * scaleFactor;
    const isMoneyCol = id === 'subtotal' || id === 'shipping' || id === 'total';
    const isCenterCol = id === 'receiptNumber' || id === 'date' || id === 'time' || id === 'origin' || id === 'status' || id === 'paid';
    
    columnStyles[index] = {
      cellWidth: width,
      halign: isMoneyCol ? 'right' : (isCenterCol ? 'center' : 'left'),
    };
  });

  // ==========================================
  // 3. RENDERIZADO DE TABLA (Estilo Editorial)
  // ==========================================

  autoTable(doc, {
    head: [headers],
    body: tableData,
    startY: yPos,
    margin: { left: marginX, right: marginX },
    theme: 'plain', 
    styles: {
      font: 'helvetica',
      fontSize: 7.5,
      cellPadding: { top: 3, right: 1.5, bottom: 3, left: 1.5 },
      textColor: COLORS.darkGray,
      overflow: 'linebreak',
      cellWidth: 'wrap',
      minCellHeight: 8,
      valign: 'middle',
    },
    headStyles: {
      fillColor: false, 
      textColor: COLORS.black,
      fontStyle: 'bold',
      halign: 'center',
      fontSize: 7.5,
      cellPadding: { top: 3, right: 1, bottom: 4, left: 1 }, 
      lineWidth: { top: 0, bottom: 0.6 }, 
      lineColor: COLORS.black,
    },
    bodyStyles: {
      lineWidth: { bottom: 0.1 }, 
      lineColor: COLORS.lightGray,
    },
    columnStyles: columnStyles,
    didParseCell: function(data) {
      if (data.row.index === tableData.length - 1) {
        data.cell.styles.fontStyle = 'bold';
        data.cell.styles.textColor = COLORS.black;
        data.cell.styles.lineWidth = { top: 0.6, bottom: 0 }; 
        data.cell.styles.lineColor = COLORS.black;
      }
    },
  });
};
