'use client';

import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';
import { useEffect } from 'react';

export default function PrintButton() {
  
  // Opcional: Auto-imprimir al cargar
  useEffect(() => {
    // Pequeño delay para asegurar que carguen las imágenes
    const timer = setTimeout(() => {
        window.print();
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Button onClick={() => window.print()} className="shadow-xl bg-slate-900 text-white hover:bg-slate-800">
      <Printer className="mr-2 h-4 w-4" /> Imprimir / Guardar PDF
    </Button>
  );
}