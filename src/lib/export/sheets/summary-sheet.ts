import * as XLSX from 'xlsx-js-style';
import { OrderForExport } from '../types';

interface Totals {
  totalSubtotal: number;
  totalShipping: number;
  totalGeneral: number;
}

export const createSummarySheet = (orders: OrderForExport[], totals: Totals) => {
  const { totalSubtotal, totalShipping, totalGeneral } = totals;
  
  // Calcular estadísticas operativas
  const statusStats = {
    'Pendientes': orders.filter(o => o.status === 'PENDING').length,
    'Pagados': orders.filter(o => o.status === 'PAID').length,
    'Entregados': orders.filter(o => o.status === 'DELIVERED').length,
    'Cancelados': orders.filter(o => o.status === 'CANCELLED').length,
  };
  
  // Agrupar ventas por día
  const salesByDayWithCount: { [key: string]: { total: number; count: number } } = {};
  orders.forEach(order => {
    const dateObj = new Date(order.createdAt);
    const date = isNaN(dateObj.getTime()) ? 'Fecha Inválida' : dateObj.toLocaleDateString('es-PE');
    
    if (!salesByDayWithCount[date]) {
      salesByDayWithCount[date] = { total: 0, count: 0 };
    }
    salesByDayWithCount[date].total += (Number(order.totalAmount) || 0);
    salesByDayWithCount[date].count++;
  });
  
  const salesEntries = Object.entries(salesByDayWithCount)
    .sort((a, b) => {
      const dateA = a[0].split('/').reverse().join('-');
      const dateB = b[0].split('/').reverse().join('-');
      return dateA.localeCompare(dateB);
    });

  // --- LÓGICA DE ANCHO DINÁMICO ---
  const maxVolumenWidth = salesEntries.reduce((currentMax, [_, stats]) => {
    const valueStr = stats.count.toLocaleString('en-US'); 
    return valueStr.length > currentMax ? valueStr.length : currentMax;
  }, 'Volumen'.length); 

  // Construcción de la matriz de datos
  const data: any[] = [];
  
  // --- SECCIÓN SUPERIOR ---
  data.push(['RESUMEN EJECUTIVO DE VENTAS', '', '', '', '', '']);
  data.push(['Generado el: ' + new Date().toLocaleDateString('es-PE'), '', '', '', '', '']);
  data.push([]); 
  
  // --- KPIs GLOBALES ---
  data.push(['MÉTRICAS FINANCIERAS', '', '', 'ESTADO DE OPERACIONES', '', '']);
  data.push(['Total de Pedidos', orders.length, '', 'Pendientes', statusStats.Pendientes, '']);
  data.push(['Subtotal', totalSubtotal, '', 'Pagados', statusStats.Pagados, '']);
  data.push(['Costo de Envío', totalShipping, '', 'Entregados', statusStats.Entregados, '']);
  data.push(['Ingreso Total', totalGeneral, '', 'Cancelados', statusStats.Cancelados, '']);
  data.push(['Ticket Promedio', orders.length > 0 ? totalGeneral / orders.length : 0, '', '', '', '']); 
  data.push([]); 
  data.push([]);
  
  // --- TABLA DE DESGLOSE ---
  data.push(['DESGLOSE DIARIO', '', '', '', '', '']);
  data.push(['Fecha', 'Ingresos (S/)', 'Volumen', '', '', '']);
  
  salesEntries.forEach(([date, stats]) => {
    data.push([date, stats.total, stats.count, '', '', '']);
  });
  
  const worksheet = XLSX.utils.aoa_to_sheet(data);
  
  // --- ANCHOS DE COLUMNA APLICADOS ---
  worksheet['!cols'] = [
    { wch: 22 }, 
    { wch: 18 }, 
    { wch: maxVolumenWidth + 4 }, 
    { wch: 22 }, 
    { wch: 15 }, 
    { wch: 2 }   
  ];
  
  // --- UNIONES DE CELDAS (MERGES) ---
  worksheet['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 4 } }, 
    { s: { r: 1, c: 0 }, e: { r: 1, c: 4 } }, 
    { s: { r: 3, c: 0 }, e: { r: 3, c: 1 } }, 
    { s: { r: 3, c: 3 }, e: { r: 3, c: 4 } }, 
    { s: { r: 11, c: 0 }, e: { r: 11, c: 2 } } 
  ];
  
  // --- ESTILOS VISUALES PULIDOS ---
  if (worksheet['A1']) {
    worksheet['A1'].s = {
      font: { bold: true, sz: 16, color: { rgb: "000000" }, name: "Calibri" },
      alignment: { horizontal: "left", vertical: "center" }
    };
  }
  if (worksheet['A2']) {
    worksheet['A2'].s = {
      font: { italic: true, sz: 10, color: { rgb: "595959" }, name: "Calibri" },
      alignment: { horizontal: "left", vertical: "center" }
    };
  }
  
  // 1. Encabezados de Métricas y Operaciones (CON fondo gris)
  ['A4', 'B4', 'D4', 'E4'].forEach(cell => {
    if (worksheet[cell]) {
      worksheet[cell].s = {
        font: { bold: true, sz: 11, color: { rgb: "000000" }, name: "Calibri" },
        fill: { fgColor: { rgb: "F2F2F2" } }, 
        alignment: { horizontal: "left", vertical: "center" },
        border: { bottom: { style: "medium", color: { rgb: "000000" } } }
      };
    }
  });

  // 2. Encabezado de Desglose Diario (SIN fondo gris)
  ['A12', 'B12', 'C12'].forEach(cell => {
    if (worksheet[cell]) {
      worksheet[cell].s = {
        font: { bold: true, sz: 11, color: { rgb: "000000" }, name: "Calibri" },
        alignment: { horizontal: "left", vertical: "center" },
        border: { bottom: { style: "medium", color: { rgb: "000000" } } }
      };
    }
  });
  
  for (let row = 5; row <= 9; row++) {
    ['A', 'D'].forEach(col => {
      const cell = `${col}${row}`;
      if (worksheet[cell]) {
        worksheet[cell].s = {
          font: { sz: 11, name: "Calibri", color: { rgb: "404040" } },
          alignment: { horizontal: "left", vertical: "center" },
          border: { bottom: { style: "dotted", color: { rgb: "D9D9D9" } } }
        };
      }
    });

    ['B', 'E'].forEach((col) => {
      const cell = `${col}${row}`;
      if (worksheet[cell]) {
        worksheet[cell].s = {
          font: { sz: 11, bold: true, name: "Calibri", color: { rgb: "000000" } },
          alignment: { horizontal: "right", vertical: "center" },
          border: { bottom: { style: "dotted", color: { rgb: "D9D9D9" } } }
        };
        if (typeof worksheet[cell].v === 'number') {
          if (col === 'B') worksheet[cell].z = row === 5 ? '#,##0' : '"S/ "#,##0.00';
          if (col === 'E') worksheet[cell].z = '#,##0';
        }
      }
    });
  }
  
  ['A13', 'B13', 'C13'].forEach((cell, idx) => {
    if (worksheet[cell]) {
      worksheet[cell].s = {
        font: { bold: true, sz: 10, color: { rgb: "000000" }, name: "Calibri" },
        fill: { fgColor: { rgb: "F2F2F2" } }, 
        alignment: { horizontal: idx === 0 ? "left" : "right", vertical: "center" },
        border: { 
          top: { style: "thin", color: { rgb: "000000" } },
          bottom: { style: "thin", color: { rgb: "000000" } } 
        }
      };
    }
  });
  
  for (let row = 14; row <= 13 + salesEntries.length; row++) {
    ['A', 'B', 'C'].forEach((col, colIndex) => {
      const cellAddress = `${col}${row}`;
      if (worksheet[cellAddress]) {
        worksheet[cellAddress].s = {
          font: { sz: 10, name: "Calibri", color: { rgb: "000000" } },
          alignment: { horizontal: colIndex === 0 ? "left" : "right", vertical: "center" },
          border: { bottom: { style: "hair", color: { rgb: "BFBFBF" } } } 
        };
        if (typeof worksheet[cellAddress].v === 'number') {
          if (col === 'B') worksheet[cellAddress].z = '"S/ "#,##0.00';
          if (col === 'C') worksheet[cellAddress].z = '#,##0';
        }
      }
    });
  }
  
  worksheet['!rows'] = [
    { hpt: 30 }, 
    { hpt: 20 }, 
    { hpt: 15 }, 
    { hpt: 25 }, 
    ...Array(5).fill({ hpt: 22 }), 
    { hpt: 15 }, 
    { hpt: 15 }, 
    { hpt: 25 }, 
    { hpt: 20 }, 
    ...Array(salesEntries.length).fill({ hpt: 20 }) 
  ];
  
  return worksheet;
};