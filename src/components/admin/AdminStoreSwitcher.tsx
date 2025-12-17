'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { ChevronDown, PartyPopper, Gamepad2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { setAdminDivision } from '@/actions/admin-settings';
import { Division } from '@prisma/client';

interface Props {
  currentDivision: Division;
}

export const AdminStoreSwitcher = ({ currentDivision }: Props) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [division, setDivision] = useState<Division>(currentDivision);

  const isFestamas = division === 'JUGUETERIA';

  const handleSwitch = (newDivision: Division) => {
    // Optimistic UI update
    setDivision(newDivision);
    
    startTransition(async () => {
      // Server Action
      await setAdminDivision(newDivision);
      // Refrescar toda la ruta para que los datos (productos/categorías) se recarguen con el nuevo filtro
      router.refresh();
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          disabled={isPending}
          className={cn(
            "w-full justify-between border-2 h-12 mb-4", // mb-4 para dar espacio en el sidebar
            isFestamas 
              ? "border-red-100 bg-red-50 text-red-700 hover:bg-red-100 hover:text-red-800" 
              : "border-fuchsia-100 bg-fuchsia-50 text-fuchsia-700 hover:bg-fuchsia-100 hover:text-fuchsia-800"
          )}
        >
          <div className="flex items-center gap-2">
            {isFestamas ? <Gamepad2 className="w-5 h-5" /> : <PartyPopper className="w-5 h-5" />}
            <div className="flex flex-col items-start leading-none">
              <span className="text-[10px] uppercase font-bold opacity-70">Viendo:</span>
              <span className="font-bold text-sm">{isFestamas ? 'Festamas' : 'FiestasYa'}</span>
            </div>
          </div>
          <ChevronDown className="w-4 h-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[220px]" align="start">
        <DropdownMenuItem 
          onClick={() => handleSwitch('JUGUETERIA')}
          className="gap-2 cursor-pointer p-3"
        >
          <div className="p-2 bg-red-100 rounded-md">
             <Gamepad2 className="w-4 h-4 text-red-600" />
          </div>
          <div className="flex flex-col">
             <span className="font-bold">Festamas</span>
             <span className="text-xs text-muted-foreground">Admin Juguetes</span>
          </div>
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={() => handleSwitch('FIESTAS')}
          className="gap-2 cursor-pointer p-3"
        >
          <div className="p-2 bg-fuchsia-100 rounded-md">
            <PartyPopper className="w-4 h-4 text-fuchsia-600" />
          </div>
          <div className="flex flex-col">
             <span className="font-bold">FiestasYa</span>
             <span className="text-xs text-muted-foreground">Admin Decoración</span>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};