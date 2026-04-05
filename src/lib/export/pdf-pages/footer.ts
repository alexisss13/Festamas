import jsPDF from 'jspdf';

const COLORS = {
  subtleGray: [130, 130, 130] as [number, number, number], // Gris suave y elegante
};

export const addFooterToAllPages = (doc: jsPDF) => {
  const pageCount = (doc as any).internal.getNumberOfPages();
  
  // Empezar desde la página 2 (saltar portada)
  for (let i = 2; i <= pageCount; i++) {
    doc.setPage(i);
    
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const marginX = 25; // Manteniendo la cuadrícula
    
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal'); // Sin negrita, muy sutil
    doc.setTextColor(...COLORS.subtleGray); // Gris elegante
    
    const currentPage = i - 1;
    const totalPages = pageCount - 1;
    
    const currentStr = currentPage.toString().padStart(2, '0');
    const totalStr = totalPages.toString().padStart(2, '0');
    
    // Regresa el "PÁG." pero manteniendo la elegancia visual
    doc.text(`PÁG. ${currentStr} / ${totalStr}`, pageWidth - marginX, pageHeight - 15, { align: 'right' });
  }
};