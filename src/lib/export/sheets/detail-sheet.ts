import * as XLSX from 'xlsx-js-style';
import { OrderForExport } from '../types';

interface Totals {
  totalSubtotal: number;
  totalShipping: number;
  totalGeneral: number;
}

export const createDetailSheet = (orders: OrderForExport[], totals: Totals, selectedColumns?: string[]) => {
  const { totalSubtotal, totalShipping, totalGeneral } = totals;
  
  // Mapeo de IDs de columnas a nombres de campos
  const columnMap: Record<string, string> = {
    'receiptNumber': 'N° Pedido',
    'date': 'Fecha',
    'time': 'Hora',
    'origin': 'Origen',
    'client': 'Cliente',
    'dni': 'DNI',
    'phone': 'Celular',
    'delivery': 'Método Entrega',
    'address': 'Dirección',
    'products': 'Productos',
    'status': 'Estado',
    'paid': 'Pagado',
    'subtotal': 'Subtotal',
    'shipping': 'Costo Envío',
    'total': 'Total',
  };

  // Determinar qué columnas mostrar
  const columnsToShow = selectedColumns && selectedColumns.length > 0
    ? selectedColumns.map(id => columnMap[id]).filter(Boolean)
    : Object.values(columnMap);
  
  const dataToExport = orders.map(order => {
    const products = order.orderItems
      .map(item => `${item.quantity}x ${item.product.title} (S/${Number(item.price).toFixed(2)})`)
      .join(', ');
    
    const dniMatch = order.notes?.match(/DNI:\s*(\d+)/);
    const dni = dniMatch ? dniMatch[1] : '';
    
    const allData: Record<string, any> = {
      'N° Pedido': order.receiptNumber || `#${order.id}`,
      'Fecha': new Date(order.createdAt).toLocaleDateString('es-PE'),
      'Hora': new Date(order.createdAt).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }),
      'Origen': order.isPOS ? 'POS' : 'WEB',
      'Cliente': order.clientName,
      'DNI': dni,
      'Celular': order.clientPhone,
      'Método Entrega': order.deliveryMethod === 'PICKUP' ? 'Recoger' : order.deliveryMethod === 'DELIVERY' ? 'Delivery' : 'Provincia',
      'Dirección': order.address || '-',
      'Productos': products,
      'Estado': order.status === 'PENDING' ? 'Pendiente' : order.status === 'PAID' ? 'Pagado' : order.status === 'DELIVERED' ? 'Entregado' : 'Cancelado',
      'Pagado': order.isPaid ? 'Sí' : 'No',
      'Subtotal': (Number(order.totalAmount) || 0) - (Number(order.shippingCost) || 0),
      'Costo Envío': Number(order.shippingCost) || 0,
      'Total': Number(order.totalAmount) || 0,
    };

    // Filtrar solo las columnas seleccionadas
    const filteredData: Record<string, any> = {};
    columnsToShow.forEach(col => {
      if (col in allData) {
        filteredData[col] = allData[col];
      }
    });

    return filteredData;
  });

  const worksheet = XLSX.utils.json_to_sheet(dataToExport);
  
  const totalCols = columnsToShow.length;
  const lastDataRow = dataToExport.length + 1;
  const totalRow = lastDataRow + 1;
  
  // Agregar fila de totales
  const totalRowData: Record<string, any> = {};
  columnsToShow.forEach((col, index) => {
    if (col === 'Subtotal' || col === 'Costo Envío' || col === 'Total') {
      const colLetter = XLSX.utils.encode_col(index);
      worksheet[`${colLetter}${totalRow}`] = { 
        t: 'n', 
        f: `SUM(${colLetter}2:${colLetter}${lastDataRow})`,
        s: {}
      };
    } else if (index === columnsToShow.length - 4 || (index === 0 && !columnsToShow.includes('Subtotal'))) {
      const colLetter = XLSX.utils.encode_col(index);
      worksheet[`${colLetter}${totalRow}`] = { t: 's', v: 'TOTAL GENERAL', s: {} };
    } else {
      const colLetter = XLSX.utils.encode_col(index);
      worksheet[`${colLetter}${totalRow}`] = { t: 's', v: '', s: {} };
    }
  });
  
  // Actualizar el rango de la hoja
  const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
  range.e.r = totalRow - 1;
  range.e.c = totalCols - 1;
  worksheet['!ref'] = XLSX.utils.encode_range(range);
  
  // Anchos de columna dinámicos
  const wscols = columnsToShow.map(col => {
    if (col === 'Productos') return { wch: 60 };
    if (col === 'Dirección') return { wch: 30 };
    if (col === 'Cliente') return { wch: 25 };
    if (col === 'Método Entrega') return { wch: 18 };
    if (col === 'N° Pedido' || 'Fecha' || 'DNI' || 'Celular' || 'Subtotal' || 'Costo Envío' || 'Total') return { wch: 12 };
    return { wch: 10 };
  });
  worksheet['!cols'] = wscols;
  
  worksheet['!autofilter'] = { ref: `A1:${XLSX.utils.encode_col(totalCols - 1)}${lastDataRow}` };

  const totalRows = totalRow;
  
  // --- ESTILOS CORPORATIVOS ---

  // 1. Estilos para encabezados (Fila 0 en lógica, Fila 1 en Excel)
  for (let col = 0; col < totalCols; col++) {
    const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
    if (!worksheet[cellAddress]) continue;
    
    worksheet[cellAddress].s = {
      font: { bold: true, color: { rgb: "000000" }, sz: 11, name: "Calibri" },
      fill: { fgColor: { rgb: "F2F2F2" } },
      alignment: { horizontal: "center", vertical: "center", wrapText: false },
      border: {
        top: { style: "thin", color: { rgb: "000000" } },
        bottom: { style: "thin", color: { rgb: "000000" } }
      }
    };
  }

  // 2. Estilos para filas de datos
  for (let row = 1; row <= totalRow - 1; row++) {
    const isLastRow = row === totalRow - 1;
    
    for (let col = 0; col < totalCols; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
      if (!worksheet[cellAddress]) continue;

      const colName = columnsToShow[col];
      const isMoneyCol = colName === 'Subtotal' || colName === 'Costo Envío' || colName === 'Total';

      if (isLastRow) {
        // --- FILA DE TOTALES ---
        worksheet[cellAddress].s = {
          font: { bold: true, sz: 11, name: "Calibri", color: { rgb: "000000" } },
          fill: { fgColor: { rgb: "F2F2F2" } },
          alignment: { 
            horizontal: isMoneyCol ? "right" : "left",
            vertical: "center" 
          },
          border: {
            top: { style: "medium", color: { rgb: "000000" } },
            bottom: { style: "double", color: { rgb: "000000" } }
          }
        };
        
        if (isMoneyCol && typeof worksheet[cellAddress].v === 'number') {
          worksheet[cellAddress].z = '"S/ "#,##0.00';
        }
      } else {
        // --- FILAS DE DATOS NORMALES ---
        worksheet[cellAddress].s = {
          font: { sz: 10, name: "Calibri", color: { rgb: "000000" } },
          fill: { fgColor: { rgb: "FFFFFF" } },
          alignment: { 
            horizontal: isMoneyCol ? "right" : "left", 
            vertical: "center",
            wrapText: false
          },
          border: {
            bottom: { style: "hair", color: { rgb: "BFBFBF" } }
          }
        };
        
        if (isMoneyCol && typeof worksheet[cellAddress].v === 'number') {
          worksheet[cellAddress].z = '"S/ "#,##0.00';
        }
      }
    }
  }

  worksheet['!rows'] = [
    { hpt: 25 },
    ...Array(lastDataRow - 1).fill({ hpt: 20 }),
    { hpt: 25 }
  ];

  // Data validation removed for dynamic columns
  
  return worksheet;
};