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
  DialogTitle, 
  DialogDescription, 
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
  
  const [modalOpen, setModalOpen] = useState(false);
  const [targetDivision, setTargetDivision] = useState<Division | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  const { cart, clearCart, clearCustomer } = usePOSStore();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const isFestamas = division === 'JUGUETERIA';
  const logoFestamas = '/images/IconoFestamas2.png';
  const logoFiestasYa = '/images/IconoFiestasYa2.png';

  const brandName = isFestamas ? "Festamas" : "FiestasYa";

  const handleSwitchRequest = (newDivision: Division) => {
    if (newDivision === division) return; 

    if (cart.length > 0) {
      setTargetDivision(newDivision); 
      setModalOpen(true);             
    } else {
      executeSwitch(newDivision);
    }
  };

  const executeSwitch = (newDivision: Division) => {
    setDivision(newDivision);
    startTransition(async () => {
      try {
        await setAdminDivision(newDivision);
        router.refresh();
      } catch (error) {
        console.error(error);
        toast.error('Error al cambiar de tienda');
      }
    });
  };

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
              "w-full transition-all duration-300 group relative", 
              isCollapsed 
                ? "h-12 px-0 justify-center border-transparent hover:bg-slate-50" 
                : "justify-between h-14 px-3 border border-slate-200 shadow-sm bg-white hover:bg-slate-50 hover:border-primary/40",
              isPending && "opacity-60 cursor-wait"
            )}
          >
            {/* Loading indicator sutil */}
            {isPending && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent animate-shimmer" 
                   style={{ backgroundSize: '200% 100%' }} />
            )}
            
            <div className={cn("flex items-center gap-3 overflow-hidden relative z-10", isCollapsed && "justify-center w-full")}>
              {/* LOGO */}
              <div className={cn(
                  "flex items-center justify-center shrink-0 transition-all duration-300",
                  isCollapsed ? "w-8 h-8" : "w-8 h-8",
                  isPending && "animate-pulse"
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
                    {isPending ? 'Cambiando...' : 'Panel de Control'}
                  </span>
                  <span className="font-bold text-sm truncate text-primary">
                    {brandName}
                  </span>
                </div>
              )}
            </div>
            
            {!isCollapsed && <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 ml-2 transition-colors group-hover:text-primary/50 relative z-10" />}
          </Button>
        </DropdownMenuTrigger>

        {/* 👇 AQUÍ HACEMOS LA MAGIA DEL ANCHO DINÁMICO */}
        <DropdownMenuContent 
            className={cn(
              "p-1 border-slate-200 shadow-lg rounded-xl",
              // Si está colapsado es fijo (240px), si está abierto toma EXACTAMENTE el ancho del botón
              isCollapsed ? "w-[240px]" : "w-[var(--radix-dropdown-menu-trigger-width)]"
            )}
            align="start" 
            side={isCollapsed ? "right" : "bottom"}
        >
          
          <DropdownMenuItem onClick={() => handleSwitchRequest('JUGUETERIA')} className={cn("gap-3 cursor-pointer p-2 mb-1 rounded-lg focus:bg-slate-50 transition-colors", isFestamas && "bg-slate-50")}>
            <div className="flex items-center justify-center w-8 h-8 shrink-0">
                <div className="relative w-full h-full"><Image src={logoFestamas} alt="Festamas" fill className="object-contain" /></div>
            </div>
            <div className="flex flex-col flex-1">
                <span className={cn("font-bold text-sm", isFestamas ? "text-primary" : "text-slate-700")}>Festamas</span>
                <span className="text-[10px] text-slate-500">Juguetes y Diversión</span>
            </div>
            {isFestamas && <Check className="w-4 h-4 text-primary" />}
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={() => handleSwitchRequest('FIESTAS')} className={cn("gap-3 cursor-pointer p-2 rounded-lg focus:bg-slate-50 transition-colors", !isFestamas && "bg-slate-50")}>
            <div className="flex items-center justify-center w-8 h-8 shrink-0">
              <div className="relative w-full h-full"><Image src={logoFiestasYa} alt="FiestasYa" fill className="object-contain" /></div>
            </div>
            <div className="flex flex-col flex-1">
                <span className={cn("font-bold text-sm", !isFestamas ? "text-primary" : "text-slate-700")}>FiestasYa</span>
                <span className="text-[10px] text-slate-500">Decoración y Piñatas</span>
            </div>
            {!isFestamas && <Check className="w-4 h-4 text-primary" />}
          </DropdownMenuItem>

        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-[420px] p-0 overflow-hidden gap-0 border-none shadow-2xl">
            <div className="p-6 flex flex-col items-center justify-center text-primary-foreground bg-primary transition-colors">
                <div className="h-12 w-12 bg-white/20 rounded-full flex items-center justify-center mb-3 backdrop-blur-sm shadow-inner">
                    <AlertTriangle className="h-6 w-6 text-white" />
                </div>
                <DialogTitle className="text-xl font-bold text-center text-white">¡Atención!</DialogTitle>
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
                    <Button 
                        onClick={handleConfirmSwitch}
                        className="w-full h-11 font-bold shadow-md text-primary-foreground transition-colors bg-primary hover:bg-primary/90"
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