import * as XLSX from 'xlsx-js-style';
import { OrderForExport } from '../types';

export const createProductsSheet = (orders: OrderForExport[]) => {
  // Calcular productos más vendidos
  const productSales: { [key: string]: { quantity: number; total: number } } = {};
  orders.forEach(order => {
    order.orderItems.forEach(item => {
      const productName = item.productName;
      if (!productSales[productName]) {
        productSales[productName] = { quantity: 0, total: 0 };
      }
      productSales[productName].quantity += item.quantity;
      productSales[productName].total += item.quantity * Number(item.price);
    });
  });
  
  const topProducts = Object.entries(productSales)
    .sort((a, b) => b[1].quantity - a[1].quantity)
    .slice(0, 30);
  
  // --- LÓGICA DE ANCHO DINÁMICO ---
  // Calculamos el nombre de producto más largo para ajustar la columna B
  const maxProductWidth = topProducts.reduce((max, [name]) => {
    return name.length > max ? name.length : max;
  }, 20); // Mínimo 20 caracteres
  const finalProductWidth = Math.min(maxProductWidth + 4, 70); // Tope máximo de 70 para no exagerar
  
  // Crear datos
  const data: any[] = [];
  
  // Título y fecha (Sobrio y formal)
  data.push(['REPORTE DE PRODUCTOS MÁS VENDIDOS', '', '', '']);
  data.push(['Generado el: ' + new Date().toLocaleDateString('es-PE'), '', '', '']);
  data.push([]);
  
  // Headers limpios
  data.push(['Ranking', 'Producto', 'Cantidad Vendida', 'Ingreso Total (S/)']);
  
  // Datos (sin emojis, ranking numérico limpio)
  topProducts.forEach(([product, stats], index) => {
    data.push([
      index + 1, 
      product, 
      stats.quantity, 
      stats.total
    ]);
  });
  
  // Fila de totales
  const totalQuantity = topProducts.reduce((sum, [, stats]) => sum + stats.quantity, 0);
  const totalAmount = topProducts.reduce((sum, [, stats]) => sum + stats.total, 0);
  data.push([]);
  data.push(['', 'TOTAL GENERAL', totalQuantity, totalAmount]);
  
  const worksheet = XLSX.utils.aoa_to_sheet(data);
  
  // Anchos de columna aplicados
  worksheet['!cols'] = [
    { wch: 10 }, // Col A: Ranking
    { wch: finalProductWidth }, // Col B: Producto (Dinámico)
    { wch: 18 }, // Col C: Cantidad
    { wch: 22 }  // Col D: Ingreso Total
  ];
  
  // Merge del título y subtítulo
  worksheet['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 3 } }, // Título
    { s: { r: 1, c: 0 }, e: { r: 1, c: 3 } }  // Fecha
  ];
  
  // --- ESTILOS CORPORATIVOS ---
  
  // 1. Título principal (A1) y Fecha (A2)
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
  
  // 2. Headers (Fila 4)
  ['A4', 'B4', 'C4', 'D4'].forEach((cell, idx) => {
    if (worksheet[cell]) {
      worksheet[cell].s = {
        font: { bold: true, sz: 11, color: { rgb: "000000" }, name: "Calibri" },
        fill: { fgColor: { rgb: "F2F2F2" } }, // Gris corporativo
        alignment: { horizontal: idx === 1 ? "left" : (idx === 0 ? "center" : "right"), vertical: "center" },
        border: {
          top: { style: "thin", color: { rgb: "000000" } },
          bottom: { style: "thin", color: { rgb: "000000" } }
        }
      };
    }
  });
  
  // 3. Datos (Desde fila 5)
  for (let row = 5; row <= 4 + topProducts.length; row++) {
    // Para destacar sutilmente el Top 3 sin usar colores chillones, los pondremos en negrita
    const isTop3 = row <= 7; 
    
    ['A', 'B', 'C', 'D'].forEach((col, colIndex) => {
      const cellAddress = `${col}${row}`;
      if (worksheet[cellAddress]) {
        worksheet[cellAddress].s = {
          font: { 
            sz: 10, 
            name: "Calibri", 
            bold: isTop3 || colIndex === 0, // Ranking y Top 3 en negrita
            color: { rgb: "000000" }
          },
          fill: { fgColor: { rgb: "FFFFFF" } },
          alignment: { 
            horizontal: colIndex === 1 ? "left" : (colIndex === 0 ? "center" : "right"), 
            vertical: "center" 
          },
          border: {
            bottom: { style: "hair", color: { rgb: "BFBFBF" } } // Línea separadora extra fina
          }
        };
        
        if (col === 'C' && typeof worksheet[cellAddress].v === 'number') {
          worksheet[cellAddress].z = '#,##0';
        }
        if (col === 'D' && typeof worksheet[cellAddress].v === 'number') {
          worksheet[cellAddress].z = '"S/ "#,##0.00';
        }
      }
    });
  }
  
  // 4. Fila de totales
  const totalRow = 4 + topProducts.length + 2;
  ['A', 'B', 'C', 'D'].forEach((col, colIndex) => {
    const cellAddress = `${col}${totalRow}`;
    if (worksheet[cellAddress]) {
      worksheet[cellAddress].s = {
        font: { bold: true, sz: 11, color: { rgb: "000000" }, name: "Calibri" },
        fill: { fgColor: { rgb: "F2F2F2" } },
        alignment: { 
          horizontal: colIndex === 1 ? "right" : "right", // "TOTAL GENERAL" alineado a la derecha
          vertical: "center" 
        },
        border: {
          top: { style: "medium", color: { rgb: "000000" } }, // Línea gruesa separadora
          bottom: { style: "double", color: { rgb: "000000" } } // Línea doble final
        }
      };
      
      if (col === 'C' && typeof worksheet[cellAddress].v === 'number') {
        worksheet[cellAddress].z = '#,##0';
      }
      if (col === 'D' && typeof worksheet[cellAddress].v === 'number') {
        worksheet[cellAddress].z = '"S/ "#,##0.00';
      }
    }
  });
  
  // Alturas de fila proporcionales
  worksheet['!rows'] = [
    { hpt: 30 }, // 1. Título
    { hpt: 20 }, // 2. Fecha
    { hpt: 15 }, // 3. Espacio
    { hpt: 25 }, // 4. Headers
    ...topProducts.map((_, index) => ({ hpt: index < 3 ? 24 : 20 })), // Datos (top 3 un milímetro más altos)
    { hpt: 15 }, // Espacio
    { hpt: 25 }  // Totales
  ];
  
  return worksheet;
};
