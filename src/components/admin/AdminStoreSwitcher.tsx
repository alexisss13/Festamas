'use client';

import { useState, useTransition, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter 
} from '@/components/ui/dialog';
import { ChevronDown, Check, AlertTriangle, Trash2, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { setAdminDivision } from '@/actions/admin-settings';
import { Division } from '@prisma/client';
import { usePOSStore } from '@/store/pos-store';
import { toast } from 'sonner';

interface Props {
  currentDivision: Division;
  isCollapsed?: boolean;
}

export const AdminStoreSwitcher = ({ currentDivision, isCollapsed }: Props) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [division, setDivision] = useState<Division>(currentDivision);
  
  // Estados para el Modal de Conflicto
  const [modalOpen, setModalOpen] = useState(false);
  const [targetDivision, setTargetDivision] = useState<Division | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  // Hook al carrito
  const { cart, clearCart, clearCustomer } = usePOSStore();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const isFestamas = division === 'JUGUETERIA';
  const logoFestamas = '/images/IconoFestamas.png';
  const logoFiestasYa = '/images/IconoFiestasYa.png';

  // 🎨 Lógica de colores dinámica (Marca ACTUAL)
  const brandColor = isFestamas ? "bg-festamas-primary" : "bg-fiestasya-accent";
  // 👇 NUEVO: Color específico para el botón (con hover)
  const buttonBg = isFestamas 
    ? "bg-festamas-primary hover:bg-festamas-primary/90" 
    : "bg-fiestasya-accent hover:bg-fiestasya-accent/90";
    
  const brandName = isFestamas ? "Festamas" : "FiestasYa";

  // 1. Intento de cambio (Interceptado)
  const handleSwitchRequest = (newDivision: Division) => {
    if (newDivision === division) return; 

    // Si hay items en el carrito... ¡ALTO! ✋
    if (cart.length > 0) {
      setTargetDivision(newDivision); 
      setModalOpen(true);             
    } else {
      executeSwitch(newDivision);
    }
  };

  // 2. Ejecución real del cambio
  const executeSwitch = (newDivision: Division) => {
    setDivision(newDivision);
    startTransition(async () => {
      try {
        await setAdminDivision(newDivision);
        router.refresh();
        toast.success(`Cambiando a ${newDivision === 'JUGUETERIA' ? 'Festamas' : 'FiestasYa'}...`);
      } catch (error) {
        console.error(error);
        toast.error('Error al cambiar de tienda');
      }
    });
  };

  // 3. Confirmación
  const handleConfirmSwitch = () => {
    if (targetDivision) {
      clearCart();     
      clearCustomer(); 
      setModalOpen(false);
      executeSwitch(targetDivision); 
    }
  };

  if (!isMounted) return null;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            disabled={isPending}
            className={cn(
              "w-full transition-all duration-300",
              isCollapsed ? "h-12 px-0 justify-center" : "justify-between h-14 px-3 border shadow-sm bg-white hover:bg-slate-50 text-slate-900 border-slate-200"
            )}
          >
            <div className={cn("flex items-center gap-3 overflow-hidden", isCollapsed && "justify-center w-full")}>
              {/* 🖼️ LOGO */}
              <div className={cn(
                  "flex items-center justify-center rounded-md shrink-0 p-1 transition-colors",
                  isCollapsed ? "w-8 h-8" : "w-8 h-8",
                  isFestamas ? "bg-festamas-primary/10" : "bg-fiestasya-accent/10"
              )}>
                  <div className="relative w-full h-full">
                      <Image 
                          src={isFestamas ? logoFestamas : logoFiestasYa} 
                          alt="Logo" 
                          fill 
                          className="object-contain" 
                      />
                  </div>
              </div>
              
              {/* TEXTO */}
              {!isCollapsed && (
                <div className="flex flex-col items-start leading-tight">
                  <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">
                    Panel de Control
                  </span>
                  <span className={cn(
                      "font-bold text-sm truncate transition-colors",
                      isFestamas ? "text-festamas-primary" : "text-fiestasya-accent"
                  )}>
                    {isFestamas ? 'Festamas' : 'FiestasYa'}
                  </span>
                </div>
              )}
            </div>
            
            {!isCollapsed && <ChevronDown className="w-4 h-4 text-slate-400 opacity-50 shrink-0 ml-2" />}
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent className="w-[240px] p-1" align="start" side={isCollapsed ? "right" : "bottom"}>
          <DropdownMenuItem onClick={() => handleSwitchRequest('JUGUETERIA')} className={cn("gap-3 cursor-pointer p-2 mb-1 rounded-md focus:bg-slate-50", isFestamas && "bg-slate-50")}>
            <div className="flex items-center justify-center w-8 h-8 rounded-md bg-festamas-primary/10 border border-festamas-primary/20 p-1">
                <div className="relative w-full h-full"><Image src={logoFestamas} alt="Festamas" fill className="object-contain" /></div>
            </div>
            <div className="flex flex-col flex-1">
                <span className="font-bold text-sm text-slate-700">Festamas</span>
                <span className="text-[10px] text-slate-500">Juguetes y Diversión</span>
            </div>
            {isFestamas && <Check className="w-4 h-4 text-festamas-primary" />}
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={() => handleSwitchRequest('FIESTAS')} className={cn("gap-3 cursor-pointer p-2 rounded-md focus:bg-slate-50", !isFestamas && "bg-slate-50")}>
            <div className="flex items-center justify-center w-8 h-8 rounded-md bg-fiestasya-accent/10 border border-fiestasya-accent/20 p-1">
              <div className="relative w-full h-full"><Image src={logoFiestasYa} alt="FiestasYa" fill className="object-contain" /></div>
            </div>
            <div className="flex flex-col flex-1">
                <span className="font-bold text-sm text-slate-700">FiestasYa</span>
                <span className="text-[10px] text-slate-500">Decoración y Piñatas</span>
            </div>
            {!isFestamas && <Check className="w-4 h-4 text-fiestasya-accent" />}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* 🛑 MODAL INTERCEPTOR (Stop Inmediato) */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-[420px] p-0 overflow-hidden gap-0 border-none shadow-2xl">
            {/* Header con el color de la tienda ACTUAL */}
            <div className={cn("p-6 flex flex-col items-center justify-center text-white", brandColor)}>
                <div className="h-12 w-12 bg-white/20 rounded-full flex items-center justify-center mb-3 backdrop-blur-sm shadow-inner">
                    <AlertTriangle className="h-6 w-6 text-white" />
                </div>
                <DialogTitle className="text-xl font-bold text-center">¡Atención!</DialogTitle>
                <DialogDescription className="text-white/90 text-center mt-2 font-medium">
                    Tienes productos de <strong>{brandName}</strong> en el carrito.
                </DialogDescription>
            </div>
            
            <div className="p-6 bg-white space-y-4">
                <p className="text-sm text-slate-500 text-center leading-relaxed">
                    Si cambias de tienda, el carrito actual se perderá. <br/>
                    ¿Estás seguro de que quieres continuar?
                </p>

                <div className="flex flex-col gap-2">
                    {/* 👇 BOTÓN PERSONALIZADO CON COLOR DE MARCA */}
                    <Button 
                        onClick={handleConfirmSwitch}
                        className={cn("w-full h-11 font-bold shadow-md text-white transition-colors", buttonBg)}
                    >
                        <Trash2 className="mr-2 h-4 w-4" /> 
                        Vaciar Carrito y Cambiar
                    </Button>
                    
                    <Button 
                        variant="outline" 
                        onClick={() => setModalOpen(false)}
                        className="w-full h-11 border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                    >
                        <X className="mr-2 h-4 w-4" />
                        Cancelar (Quedarme aquí)
                    </Button>
                </div>
            </div>
        </DialogContent>
      </Dialog>
    </>
  );
};