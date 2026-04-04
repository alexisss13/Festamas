import * as XLSX from 'xlsx-js-style';
import { OrderForExport } from '../types';

// ─── Helpers de estilo limpios ─────────────────────────────────────────────
const setStyle = (ws: XLSX.WorkSheet, addr: string, s: object) => {
  if (!ws[addr]) ws[addr] = { t: 's', v: '' };
  ws[addr].s = s;
};

const setNumFmt = (ws: XLSX.WorkSheet, addr: string, z: string) => {
  if (ws[addr]) ws[addr].z = z;
};

// ─── Sheet principal ───────────────────────────────────────────────────────
export const createDeliverySheet = (orders: OrderForExport[]) => {
  // Calcular estadísticas operativas
  const stats: Record<string, { count: number; total: number }> = {
    'Recoger en tienda': { count: 0, total: 0 },
    'Delivery local': { count: 0, total: 0 },
    'Envío a provincia': { count: 0, total: 0 },
  };

  orders.forEach(order => {
    const m = order.deliveryMethod === 'PICKUP' ? 'Recoger en tienda'
            : order.deliveryMethod === 'DELIVERY' ? 'Delivery local'
            : 'Envío a provincia';
    stats[m].count++;
    stats[m].total += Number(order.totalAmount) || 0;
  });

  const totalOrders = orders.length;
  const totalAmount = orders.reduce((s, o) => s + (Number(o.totalAmount) || 0), 0);
  const totalAvg = totalOrders > 0 ? totalAmount / totalOrders : 0;

  const fmtAmt = (n: number) => n.toLocaleString('es-PE', { minimumFractionDigits: 2 });

  // ─── Construcción de datos ───────────────────────────────────────────────
  const data: any[][] = [
    ['ANÁLISIS POR MÉTODO DE ENTREGA', '', '', '', ''],
    [`Generado el: ${new Date().toLocaleDateString('es-PE')}  ·  ${totalOrders} pedidos  ·  S/ ${fmtAmt(totalAmount)} en ventas`, '', '', '', ''],
    [],
    ['Método de Entrega', 'Pedidos', 'Ventas (S/)', 'Ticket Prom. (S/)', 'Participación']
  ];

  // Insertar filas de datos dinámicamente
  Object.entries(stats).forEach(([method, s]) => {
    const avg = s.count > 0 ? s.total / s.count : 0;
    const pct = totalOrders > 0 ? s.count / totalOrders : 0; // Calculado en decimal (0-1)
    data.push([method, s.count, s.total, avg, pct]);
  });

  // Fila de totales finales
  data.push(['TOTAL GENERAL', totalOrders, totalAmount, totalAvg, 1]); // 1 representa el 100%

  const ws = XLSX.utils.aoa_to_sheet(data);

  // ─── Dimensiones de cuadrícula ───────────────────────────────────────────
  ws['!cols'] = [
    { wch: 25 }, // A: Método
    { wch: 15 }, // B: Pedidos
    { wch: 20 }, // C: Ventas
    { wch: 20 }, // D: Ticket Prom.
    { wch: 15 }, // E: Participación
  ];

  ws['!rows'] = [
    { hpt: 30 }, // 1. Título
    { hpt: 20 }, // 2. Subtítulo dinámico
    { hpt: 15 }, // 3. Espacio
    { hpt: 25 }, // 4. Encabezados
    { hpt: 20 }, // 5. Dato: Recoger
    { hpt: 20 }, // 6. Dato: Delivery
    { hpt: 20 }, // 7. Dato: Provincia
    { hpt: 25 }, // 8. Totales
  ];

  ws['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 4 } }, // Título
    { s: { r: 1, c: 0 }, e: { r: 1, c: 4 } }, // Subtítulo
  ];

  const COLS = ['A', 'B', 'C', 'D', 'E'];

  // ─── ESTILOS CORPORATIVOS ────────────────────────────────────────────────

  // 1. Cabecera del documento (Filas 1 y 2)
  COLS.forEach(col => {
    setStyle(ws, `${col}1`, {
      font: { bold: true, sz: 16, color: { rgb: "000000" }, name: 'Calibri' },
      alignment: { horizontal: 'left', vertical: 'center' }
    });
    setStyle(ws, `${col}2`, {
      font: { sz: 10, color: { rgb: "595959" }, name: 'Calibri', italic: true },
      alignment: { horizontal: 'left', vertical: 'center' }
    });
  });

  // 2. Encabezados de la tabla (Fila 4)
  COLS.forEach((col, i) => {
    setStyle(ws, `${col}4`, {
      font: { bold: true, sz: 11, color: { rgb: "000000" }, name: 'Calibri' },
      fill: { fgColor: { rgb: "F2F2F2" } }, // Gris corporativo
      alignment: { horizontal: i === 0 ? 'left' : 'right', vertical: 'center' },
      border: {
        top: { style: 'thin', color: { rgb: "000000" } },
        bottom: { style: 'thin', color: { rgb: "000000" } }
      }
    });
  });

  // 3. Filas de datos (Filas 5, 6 y 7)
  [5, 6, 7].forEach(row => {
    COLS.forEach((col, i) => {
      const addr = `${col}${row}`;
      setStyle(ws, addr, {
        font: { sz: 10, name: 'Calibri', color: { rgb: "000000" } },
        fill: { fgColor: { rgb: "FFFFFF" } },
        alignment: { horizontal: i === 0 ? 'left' : 'right', vertical: 'center' },
        border: { bottom: { style: 'hair', color: { rgb: "BFBFBF" } } } // Separador extra fino
      });
      
      // Aplicación de formatos numéricos correctos
      if (typeof ws[addr].v === 'number') {
        if (col === 'B') setNumFmt(ws, addr, '#,##0');
        if (col === 'C' || col === 'D') setNumFmt(ws, addr, '"S/ "#,##0.00');
        if (col === 'E') setNumFmt(ws, addr, '0.00%');
      }
    });
  });

  // 4. Fila de Totales Generales (Fila 8)
  COLS.forEach((col, i) => {
    const addr = `${col}8`;
    setStyle(ws, addr, {
      font: { bold: true, sz: 11, color: { rgb: "000000" }, name: 'Calibri' },
      fill: { fgColor: { rgb: "F2F2F2" } },
      alignment: { horizontal: i === 0 ? 'right' : 'right', vertical: 'center' },
      border: {
        top: { style: 'medium', color: { rgb: "000000" } },    // Línea fuerte arriba
        bottom: { style: 'double', color: { rgb: "000000" } } // Línea doble abajo
      }
    });
    
    // Formatos para los totales
    if (typeof ws[addr].v === 'number') {
      if (col === 'B') setNumFmt(ws, addr, '#,##0');
      if (col === 'C' || col === 'D') setNumFmt(ws, addr, '"S/ "#,##0.00');
      if (col === 'E') setNumFmt(ws, addr, '0.00%');
    }
  });

  return ws;
};