import * as XLSX from 'xlsx-js-style';
import { OrderForExport } from '../types';

interface Totals {
  totalSubtotal: number;
  totalShipping: number;
  totalGeneral: number;
}

export const createDetailSheet = (orders: OrderForExport[], totals: Totals) => {
  const { totalSubtotal, totalShipping, totalGeneral } = totals;
  
  const dataToExport = orders.map(order => {
    const products = order.orderItems
      .map(item => `${item.quantity}x ${item.product.title} (S/${Number(item.price).toFixed(2)})`)
      .join(', ');
    
    const dniMatch = order.notes?.match(/DNI:\s*(\d+)/);
    const dni = dniMatch ? dniMatch[1] : '';
    
    return {
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
  });

  const worksheet = XLSX.utils.json_to_sheet(dataToExport);
  
  // ─── FÓRMULAS DINÁMICAS PARA TOTALES ─────────────────────────────────────
  const lastDataRow = dataToExport.length + 1; // +1 porque la fila 1 es el header
  const totalRow = lastDataRow + 1;
  
  // Agregar fila de totales con fórmulas
  worksheet[`A${totalRow}`] = { t: 's', v: '' };
  worksheet[`B${totalRow}`] = { t: 's', v: '' };
  worksheet[`C${totalRow}`] = { t: 's', v: '' };
  worksheet[`D${totalRow}`] = { t: 's', v: '' };
  worksheet[`E${totalRow}`] = { t: 's', v: '' };
  worksheet[`F${totalRow}`] = { t: 's', v: '' };
  worksheet[`G${totalRow}`] = { t: 's', v: '' };
  worksheet[`H${totalRow}`] = { t: 's', v: '' };
  worksheet[`I${totalRow}`] = { t: 's', v: '' };
  worksheet[`J${totalRow}`] = { t: 's', v: 'TOTAL GENERAL', s: {} };
  worksheet[`K${totalRow}`] = { t: 's', v: '' };
  worksheet[`L${totalRow}`] = { t: 's', v: '' };
  
  // Fórmulas SUM para los totales
  worksheet[`M${totalRow}`] = { t: 'n', f: `SUM(M2:M${lastDataRow})`, s: {} };
  worksheet[`N${totalRow}`] = { t: 'n', f: `SUM(N2:N${lastDataRow})`, s: {} };
  worksheet[`O${totalRow}`] = { t: 'n', f: `SUM(O2:O${lastDataRow})`, s: {} };
  
  // Actualizar el rango de la hoja
  const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
  range.e.r = totalRow - 1; // Ajustar el rango para incluir la fila de totales
  worksheet['!ref'] = XLSX.utils.encode_range(range);
  
  const wscols = [
    { wch: 12 }, { wch: 12 }, { wch: 8 }, { wch: 8 }, { wch: 25 },
    { wch: 12 }, { wch: 12 }, { wch: 18 }, { wch: 30 }, { wch: 60 },
    { wch: 10 }, { wch: 8 }, { wch: 12 }, { wch: 12 }, { wch: 12 }
  ];
  worksheet['!cols'] = wscols;
  
  // OMITIR AUTOFILTRO EN LA FILA DE TOTALES
  // El rango original (range.e.r) incluye la fila de totales, lo cual rompe el filtro.
  // Restamos 1 al rango para que el filtro solo aplique a los datos reales.
  worksheet['!autofilter'] = { ref: `A1:${XLSX.utils.encode_col(range.e.c)}${lastDataRow}` };

  const totalRows = totalRow; // Total de filas incluyendo header y totales
  const totalCols = 15;
  
  // --- ESTILOS CORPORATIVOS ---

  // 1. Estilos para encabezados (Fila 0 en lógica, Fila 1 en Excel)
  for (let col = 0; col < totalCols; col++) {
    const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
    if (!worksheet[cellAddress]) continue;
    
    worksheet[cellAddress].s = {
      font: { bold: true, color: { rgb: "000000" }, sz: 11, name: "Calibri" }, // Texto Negro
      fill: { fgColor: { rgb: "F2F2F2" } }, // Gris corporativo (igual al resumen ejecutivo)
      alignment: { horizontal: "center", vertical: "center", wrapText: false },
      border: {
        top: { style: "thin", color: { rgb: "000000" } }, // Borde negro arriba
        bottom: { style: "thin", color: { rgb: "000000" } } // Borde negro abajo
        // Eliminamos bordes laterales para un look más limpio
      }
    };
  }

  // 2. Estilos para filas de datos
  // Recorremos desde la fila 1 hasta el final
  for (let row = 1; row <= totalRow - 1; row++) {
    const isLastRow = row === totalRow - 1; // La última fila ahora es la de totales
    
    for (let col = 0; col < totalCols; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
      if (!worksheet[cellAddress]) continue;

      if (isLastRow) {
        // --- FILA DE TOTALES ---
        worksheet[cellAddress].s = {
          font: { bold: true, sz: 11, name: "Calibri", color: { rgb: "000000" } },
          fill: { fgColor: { rgb: "F2F2F2" } }, // Gris claro en vez de azul oscuro
          alignment: { 
            horizontal: col >= 12 ? "right" : (col === 9 ? "right" : "left"), // Alineamos 'TOTAL GENERAL' a la derecha
            vertical: "center" 
          },
          border: {
            top: { style: "medium", color: { rgb: "000000" } }, // Línea gruesa para separar totales
            bottom: { style: "double", color: { rgb: "000000" } } // Línea doble al final del documento
          }
        };
        
        // Formato moneda
        if (col >= 12 && col <= 14 && typeof worksheet[cellAddress].v === 'number') {
          worksheet[cellAddress].z = '"S/ "#,##0.00';
        }
      } else {
        // --- FILAS DE DATOS NORMALES ---
        worksheet[cellAddress].s = {
          font: { sz: 10, name: "Calibri", color: { rgb: "000000" } },
          fill: { fgColor: { rgb: "FFFFFF" } }, // Todo blanco, sin bandas celestes
          alignment: { 
            horizontal: col >= 12 ? "right" : "left", 
            vertical: "center",
            wrapText: false
          },
          border: {
            bottom: { style: "hair", color: { rgb: "BFBFBF" } } // Solo separador horizontal muy fino
          }
        };
        
        // Formato moneda
        if (col >= 12 && col <= 14 && typeof worksheet[cellAddress].v === 'number') {
          worksheet[cellAddress].z = '"S/ "#,##0.00';
        }
      }
    }
  }

  // Alturas de fila proporcionales
  worksheet['!rows'] = [
    { hpt: 25 }, // Header un poco más alto
    ...Array(lastDataRow - 1).fill({ hpt: 20 }), // Filas de datos
    { hpt: 25 } // Fila de totales
  ];

  // ─── VALIDACIÓN DE DATOS ──────────────────────────────────────────────────
  // Agregar validaciones solo si hay datos (más de 1 fila = header + al menos 1 dato)
  if (lastDataRow > 1) {
    
    // Inicializar array de validaciones
    if (!worksheet['!dataValidation']) {
      worksheet['!dataValidation'] = [];
    }
    
    // Lista desplegable para Estado (columna K, filas 2 hasta última fila de datos)
    worksheet['!dataValidation'].push({
      type: 'list',
      allowBlank: false,
      sqref: `K2:K${lastDataRow}`,
      formulas: ['"Pendiente,Pagado,Entregado,Cancelado"'],
      promptTitle: 'Estado del Pedido',
      prompt: 'Selecciona el estado del pedido',
      errorTitle: 'Valor inválido',
      error: 'Debes seleccionar un estado válido de la lista',
      errorStyle: 'stop',
      showDropDown: true
    });
    
    // Lista desplegable para Pagado (columna L, filas 2 hasta última fila de datos)
    worksheet['!dataValidation'].push({
      type: 'list',
      allowBlank: false,
      sqref: `L2:L${lastDataRow}`,
      formulas: ['"Sí,No"'],
      promptTitle: 'Estado de Pago',
      prompt: 'Indica si el pedido está pagado',
      errorTitle: 'Valor inválido',
      error: 'Debes seleccionar Sí o No',
      errorStyle: 'stop',
      showDropDown: true
    });
    
    // Lista desplegable para Método Entrega (columna H, filas 2 hasta última fila de datos)
    worksheet['!dataValidation'].push({
      type: 'list',
      allowBlank: false,
      sqref: `H2:H${lastDataRow}`,
      formulas: ['"Recoger,Delivery,Provincia"'],
      promptTitle: 'Método de Entrega',
      prompt: 'Selecciona el método de entrega',
      errorTitle: 'Valor inválido',
      error: 'Debes seleccionar un método válido de la lista',
      errorStyle: 'stop',
      showDropDown: true
    });
    
    // Validación numérica para Subtotal (columna M)
    worksheet['!dataValidation'].push({
      type: 'decimal',
      operator: 'greaterThanOrEqual',
      allowBlank: false,
      sqref: `M2:M${lastDataRow}`,
      formulas: ['0'],
      promptTitle: 'Subtotal',
      prompt: 'Ingresa un valor numérico mayor o igual a 0',
      errorTitle: 'Valor inválido',
      error: 'El subtotal debe ser un número mayor o igual a 0',
      errorStyle: 'stop'
    });
    
    // Validación numérica para Costo Envío (columna N)
    worksheet['!dataValidation'].push({
      type: 'decimal',
      operator: 'greaterThanOrEqual',
      allowBlank: false,
      sqref: `N2:N${lastDataRow}`,
      formulas: ['0'],
      promptTitle: 'Costo de Envío',
      prompt: 'Ingresa un valor numérico mayor o igual a 0',
      errorTitle: 'Valor inválido',
      error: 'El costo de envío debe ser un número mayor o igual a 0',
      errorStyle: 'stop'
    });
    
    // Validación numérica para Total (columna O)
    worksheet['!dataValidation'].push({
      type: 'decimal',
      operator: 'greaterThanOrEqual',
      allowBlank: false,
      sqref: `O2:O${lastDataRow}`,
      formulas: ['0'],
      promptTitle: 'Total',
      prompt: 'Ingresa un valor numérico mayor o igual a 0',
      errorTitle: 'Valor inválido',
      error: 'El total debe ser un número mayor o igual a 0',
      errorStyle: 'stop'
    });
    
    // Validación de formato para Celular (columna G) - 9 dígitos
    worksheet['!dataValidation'].push({
      type: 'textLength',
      operator: 'equal',
      allowBlank: true,
      sqref: `G2:G${lastDataRow}`,
      formulas: ['9'],
      promptTitle: 'Número de Celular',
      prompt: 'Ingresa un número de celular de 9 dígitos',
      errorTitle: 'Formato inválido',
      error: 'El celular debe tener exactamente 9 dígitos',
      errorStyle: 'warning'
    });
    
    // Validación de formato para DNI (columna F) - 8 dígitos
    worksheet['!dataValidation'].push({
      type: 'textLength',
      operator: 'equal',
      allowBlank: true,
      sqref: `F2:F${lastDataRow}`,
      formulas: ['8'],
      promptTitle: 'DNI',
      prompt: 'Ingresa un DNI de 8 dígitos',
      errorTitle: 'Formato inválido',
      error: 'El DNI debe tener exactamente 8 dígitos',
      errorStyle: 'warning'
    });
  }

  return worksheet;
};