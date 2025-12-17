'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { ChevronDown, Check } from 'lucide-react';
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
  const logoFestamas = '/images/IconoFestamas.png';
  const logoFiestasYa = '/images/IconoFiestasYa.png';

  const handleSwitch = (newDivision: Division) => {
    setDivision(newDivision);
    startTransition(async () => {
      await setAdminDivision(newDivision);
      router.refresh();
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          disabled={isPending}
          className="w-full justify-between h-14 px-3 border shadow-sm transition-all mb-6 bg-white hover:bg-slate-50 text-slate-900 border-slate-200"
        >
          <div className="flex items-center gap-3 overflow-hidden">
            {/* 🖼️ USANDO CLASES DE MARCA DINÁMICAS */}
            <div className={cn(
                "flex items-center justify-center w-8 h-8 rounded-md shrink-0 p-1 transition-colors",
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
          </div>
          <ChevronDown className="w-4 h-4 text-slate-400 opacity-50 shrink-0 ml-2" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-[240px] p-1" align="start">
        {/* OPCIÓN FESTAMAS */}
        <DropdownMenuItem 
          onClick={() => handleSwitch('JUGUETERIA')}
          className={cn(
            "gap-3 cursor-pointer p-2 mb-1 rounded-md focus:bg-slate-50",
            isFestamas && "bg-slate-50"
          )}
        >
          <div className="flex items-center justify-center w-8 h-8 rounded-md bg-festamas-primary/10 border border-festamas-primary/20 p-1">
             <div className="relative w-full h-full">
                <Image src={logoFestamas} alt="Festamas" fill className="object-contain" />
             </div>
          </div>
          <div className="flex flex-col flex-1">
             <span className="font-bold text-sm text-slate-700">Festamas</span>
             <span className="text-[10px] text-slate-500">Juguetes y Diversión</span>
          </div>
          {isFestamas && <Check className="w-4 h-4 text-festamas-primary" />}
        </DropdownMenuItem>
        
        {/* OPCIÓN FIESTASYA */}
        <DropdownMenuItem 
          onClick={() => handleSwitch('FIESTAS')}
          className={cn(
            "gap-3 cursor-pointer p-2 rounded-md focus:bg-slate-50",
            !isFestamas && "bg-slate-50"
          )}
        >
          <div className="flex items-center justify-center w-8 h-8 rounded-md bg-fiestasya-accent/10 border border-fiestasya-accent/20 p-1">
            <div className="relative w-full h-full">
                <Image src={logoFiestasYa} alt="FiestasYa" fill className="object-contain" />
            </div>
          </div>
          <div className="flex flex-col flex-1">
             <span className="font-bold text-sm text-slate-700">FiestasYa</span>
             <span className="text-[10px] text-slate-500">Decoración y Piñatas</span>
          </div>
          {!isFestamas && <Check className="w-4 h-4 text-fiestasya-accent" />}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};