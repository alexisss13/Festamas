'use client';

import { Barcode, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import JsBarcode from 'jsbarcode';
import { toast } from 'sonner';

interface Props {
  barcode: string | null;
  title: string;
  price: number;
  className?: string;
  variant?: 'ghost' | 'outline' | 'secondary' | 'default';
}

export const BarcodeControl = ({ barcode, title, price, className, variant = 'ghost' }: Props) => {
  
  if (!barcode) return null;

  const cleanFileName = (text: string) => text.toLowerCase().replace(/[^a-z0-9]/g, '-').substring(0, 30);

  // =========================================================================
  // 🖼️ FUNCIÓN ÚNICA: DESCARGAR PNG (Título + Barras + Número + Precio)
  // =========================================================================
  const handleDownload = () => {
    try {
        // 1. Crear canvas temporal para el código de barras (con el número incluido)
        const tempCanvas = document.createElement('canvas');
        JsBarcode(tempCanvas, barcode, {
            format: "CODE128",
            width: 2,
            height: 50,          // Altura de las barras
            displayValue: true,  // 👇 Muestra el número "human-readable" abajo
            fontSize: 14,
            fontOptions: "bold",
            textMargin: 5,
            margin: 10,
            background: "#ffffff"
        });

        // 2. Configurar dimensiones para el canvas final (Etiqueta completa)
        const titleFontSize = 14;
        const priceFontSize = 22; // Precio más grande
        const padding = 15;
        
        const headerHeight = 30; // Espacio para el título
        const footerHeight = 35; // Espacio para el precio

        const finalCanvas = document.createElement('canvas');
        const ctx = finalCanvas.getContext('2d');
        
        if (!ctx) return;

        // El ancho será el del código de barras + margen, o mínimo 250px para que el texto quepa
        const finalWidth = Math.max(tempCanvas.width, 280);
        const finalHeight = tempCanvas.height + headerHeight + footerHeight + (padding * 2);

        finalCanvas.width = finalWidth;
        finalCanvas.height = finalHeight;

        // 3. Pintar fondo blanco (importante para PNG)
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, finalWidth, finalHeight);

        // 4. Dibujamos el TÍTULO (Arriba)
        ctx.font = `bold ${titleFontSize}px Arial, sans-serif`;
        ctx.fillStyle = '#000000';
        ctx.textAlign = 'center';
        
        // Truncar texto si es muy largo para que no se salga
        const displayTitle = title.length > 32 ? title.substring(0, 30) + '...' : title;
        ctx.fillText(displayTitle, finalWidth / 2, padding + 15);

        // 5. Pegamos el Código de Barras (Centrado en el medio)
        // El tempCanvas ya incluye márgenes blancos y el número abajo
        const xPos = (finalWidth - tempCanvas.width) / 2;
        ctx.drawImage(tempCanvas, xPos, headerHeight + padding);

        // 6. Dibujamos el PRECIO (Abajo del todo)
        ctx.font = `bold ${priceFontSize}px Arial, sans-serif`;
        ctx.fillStyle = '#000000'; // O un color gris oscuro #333
        ctx.fillText(`S/ ${price.toFixed(2)}`, finalWidth / 2, finalHeight - padding);

        // 7. Descargar
        const url = finalCanvas.toDataURL("image/png");
        const link = document.createElement('a');
        link.href = url;
        link.download = `etiqueta-${cleanFileName(title)}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast.success("Etiqueta descargada");

    } catch (error) {
        console.error("Error generando etiqueta:", error);
        toast.error("Error al generar la imagen");
    }
  };

  return (
    <Button 
        type="button"
        variant={variant} 
        size="icon" 
        onClick={handleDownload}
        className={cn("text-slate-400 hover:text-slate-900 shrink-0", className)}
        title="Descargar Etiqueta (PNG)"
    >
        {/* Icono de barras que te gustaba + pequeña flecha de descarga implícita */}
        <div className="relative">
            <Barcode className="h-5 w-5" />
            <div className="absolute -bottom-1 -right-1 rounded-full w-2 h-2 border border-white"></div>
        </div>
    </Button>
  );
};