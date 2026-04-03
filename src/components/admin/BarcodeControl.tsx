'use client';

import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  barcode: string;
  title: string;
  price: number;
  wholesalePrice?: number;
  wholesaleMinCount?: number | null;
  discountPercentage?: number;
  variant?: 'default' | 'outline';
  className?: string;
}

export function BarcodeControl({ 
  barcode, 
  title, 
  price, 
  wholesalePrice, 
  wholesaleMinCount, 
  discountPercentage,
  variant = 'default',
  className 
}: Props) {
  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const finalPrice = discountPercentage 
      ? price * (1 - discountPercentage / 100) 
      : price;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Etiqueta - ${title}</title>
          <style>
            @page { margin: 0; }
            body { 
              margin: 0; 
              padding: 20px; 
              font-family: Arial, sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
            }
            .label {
              border: 2px solid #000;
              padding: 15px;
              max-width: 300px;
              text-align: center;
            }
            .title { font-size: 14px; font-weight: bold; margin-bottom: 10px; }
            .price { font-size: 24px; font-weight: bold; color: #e11d48; margin: 10px 0; }
            .barcode { margin: 10px 0; }
          </style>
        </head>
        <body>
          <div class="label">
            <div class="title">${title}</div>
            <div class="price">S/ ${finalPrice.toFixed(2)}</div>
            <div class="barcode">
              <svg id="barcode"></svg>
            </div>
            <div style="font-size: 12px; margin-top: 5px;">${barcode}</div>
          </div>
          <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"></script>
          <script>
            JsBarcode("#barcode", "${barcode}", {
              format: "CODE128",
              width: 2,
              height: 50,
              displayValue: false
            });
            setTimeout(() => {
              window.print();
              window.close();
            }, 500);
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <Button
      type="button"
      variant={variant}
      size="icon"
      onClick={handlePrint}
      className={cn(className)}
      title="Imprimir etiqueta"
    >
      <Printer className="h-4 w-4" />
    </Button>
  );
}
