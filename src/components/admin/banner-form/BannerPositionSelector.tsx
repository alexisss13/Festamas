'use client';

import { Label } from '@/components/ui/label';
import { LayoutGrid } from 'lucide-react';
import { BannerPosition } from '@prisma/client';
import { cn } from '@/lib/utils';

interface BannerPositionSelectorProps {
  position: BannerPosition;
  activeBranchName: string;
  onPositionChange: (position: BannerPosition) => void;
  loading?: boolean;
  onCancel?: () => void;
  brandButtonClass?: string;
}

export function BannerPositionSelector({
  position,
  activeBranchName,
  onPositionChange,
  loading,
  onCancel,
  brandButtonClass
}: BannerPositionSelectorProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="border-b border-slate-100 bg-slate-50/50 px-5 py-4 flex items-center gap-2">
        <LayoutGrid className="h-4 w-4 text-primary" />
        <h2 className="font-semibold text-slate-800 text-sm">Ubicación</h2>
      </div>
      <div className="p-5 space-y-4">
        <Label className="text-[13px] font-medium text-slate-500">
          Tipo de Banner
        </Label>
        
        {/* Opciones */}
        <div className="space-y-2">
          {positionOptions.map((option) => {
            const isSelected = position === option.value;
            
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => onPositionChange(option.value)}
                className={cn(
                  "w-full flex items-center justify-between px-4 py-3 rounded-lg border transition-colors text-left",
                  isSelected 
                    ? "bg-slate-50 border-slate-300" 
                    : "bg-white border-slate-200 hover:border-slate-300"
                )}
              >
                <div>
                  <div className={cn(
                    "text-sm font-medium",
                    isSelected ? "text-slate-900" : "text-slate-700"
                  )}>
                    {option.label}
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    {option.description}
                  </div>
                </div>
                {isSelected && (
                  <div className="w-2 h-2 rounded-full bg-primary" />
                )}
              </button>
            );
          })}
        </div>

        {/* Info de tienda */}
        <div className="pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500">Tienda</span>
            <span className="font-medium text-slate-700">{activeBranchName}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

const positionOptions = [
  { 
    value: 'TOP_BAR' as BannerPosition, 
    label: 'Cintillo Superior', 
    description: 'Barra 30-60px' 
  },
  { 
    value: 'MAIN_HERO' as BannerPosition, 
    label: 'Hero Principal', 
    description: 'Banner carrusel' 
  }
];
