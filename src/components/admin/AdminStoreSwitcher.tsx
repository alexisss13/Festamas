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
import { ChevronDown, Check, AlertTriangle, Trash2, X, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';
import { setAdminBranch } from '@/actions/admin-settings';
import { usePOSStore } from '@/store/pos-store';
import { toast } from 'sonner';

interface Props {
  activeBranch: any;
  branches: any[];
  isCollapsed?: boolean;
  isGlobalModule?: boolean;
}

export const AdminStoreSwitcher = ({ activeBranch, branches, isCollapsed, isGlobalModule = false }: Props) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [branch, setBranch] = useState(activeBranch);
  
  const [modalOpen, setModalOpen] = useState(false);
  const [targetBranch, setTargetBranch] = useState<any | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  const { cart, clearCart, clearCustomer } = usePOSStore();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const logoFestamas = activeBranch?.logos?.isotipo ?? activeBranch?.logos?.imagotipo ?? '/images/IconoFestamas2.png';
  const brandName = activeBranch?.name || "Tienda";

  const handleSwitchRequest = (newBranch: any) => {
    if (newBranch.id === branch?.id) return; 

    if (cart.length > 0) {
      setTargetBranch(newBranch); 
      setModalOpen(true);             
    } else {
      executeSwitch(newBranch);
    }
  };

  const executeSwitch = (newBranch: any) => {
    setBranch(newBranch);
    startTransition(async () => {
      try {
        await setAdminBranch(newBranch.id);
        router.refresh();
      } catch (error) {
        console.error(error);
        toast.error('Error al cambiar de tienda');
      }
    });
  };

  const handleConfirmSwitch = () => {
    if (targetBranch) {
      clearCart();     
      clearCustomer(); 
      setModalOpen(false);
      executeSwitch(targetBranch); 
    }
  };

  if (!isMounted) return null;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            disabled={isPending || isGlobalModule}
            className={cn(
              "w-full transition-all duration-300 group relative", 
              isCollapsed 
                ? "h-12 px-0 justify-center border-transparent hover:bg-slate-50" 
                : "justify-between h-14 px-3 border border-slate-200 shadow-sm bg-white hover:bg-slate-50 hover:border-primary/40",
              isPending && "opacity-60 cursor-wait",
              isGlobalModule && "cursor-default hover:bg-white hover:border-slate-200"
            )}
          >
            {/* Loading indicator sutil */}
            {isPending && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent animate-shimmer" 
                   style={{ backgroundSize: '200% 100%' }} />
            )}
            
            <div className={cn("flex items-center gap-3 overflow-hidden relative z-10", isCollapsed && "justify-center w-full")}>
              {/* LOGO O ICONO */}
              <div className={cn(
                  "flex items-center justify-center shrink-0 transition-all duration-300",
                  isCollapsed ? "w-8 h-8" : "w-8 h-8",
                  isPending && "animate-pulse"
              )}>
                  {isGlobalModule ? (
                    <Globe className="text-slate-600" style={{ width: '24px', height: '24px' }} />
                  ) : (
                    <div className="relative w-full h-full">
                      <Image 
                          src={logoFestamas}
                          alt="Logo" 
                          fill 
                          sizes="32px"
                          className="object-contain" 
                      />
                    </div>
                  )}
              </div>
              
              {/* TEXTO */}
              {!isCollapsed && (
                <div className="flex flex-col items-start leading-tight">
                  <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">
                    {isPending ? 'Cambiando...' : (isGlobalModule ? 'Administración' : 'Panel de Control')}
                  </span>
                  <span className={cn(
                    "font-bold text-sm truncate",
                    isGlobalModule ? "text-slate-700" : "text-primary"
                  )}>
                    {isGlobalModule ? "Sistema Global" : brandName}
                  </span>
                </div>
              )}
            </div>
            
            {!isCollapsed && !isGlobalModule && <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 ml-2 transition-colors group-hover:text-primary/50 relative z-10" />}
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
          {branches.map((b: any) => {
            const isActive = b.id === branch?.id;
            return (
              <DropdownMenuItem 
                  key={b.id}
                  onClick={() => handleSwitchRequest(b)} 
                  className={cn("gap-3 cursor-pointer p-2 mb-1 rounded-lg focus:bg-slate-50 transition-colors", isActive && "bg-slate-50")}
              >
                <div className="flex items-center justify-center w-8 h-8 shrink-0">
                    <div className="relative w-full h-full">
                        <Image src={b.logoUrl || '/images/default-store.png'} alt={b.name} fill sizes="32px" className="object-contain" />
                    </div>
                </div>
                <div className="flex flex-col flex-1">
                    <span className={cn("font-bold text-sm", isActive ? "text-primary" : "text-slate-700")}>{b.name}</span>
                    <span className="text-[10px] text-slate-500">{b.ecommerceCode || 'Tienda'}</span>
                </div>
                {isActive && <Check className="w-4 h-4 text-primary" />}
              </DropdownMenuItem>
            );
          })}

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