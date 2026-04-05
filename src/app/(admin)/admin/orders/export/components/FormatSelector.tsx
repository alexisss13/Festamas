'use client';

import { FileSpreadsheet, FileText, FileJson, FileDown } from 'lucide-react';
import { ExportFormat } from '@/lib/export';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface FormatSelectorProps {
  selectedFormat: ExportFormat;
  onFormatChange: (format: ExportFormat) => void;
}

export function FormatSelector({ selectedFormat, onFormatChange }: FormatSelectorProps) {
  const formats = [
    { id: 'xlsx' as ExportFormat, icon: FileSpreadsheet, color: 'text-emerald-600', label: 'Excel' },
    { id: 'csv' as ExportFormat, icon: FileText, color: 'text-blue-600', label: 'CSV' },
    { id: 'pdf' as ExportFormat, icon: FileDown, color: 'text-rose-600', label: 'PDF' },
    { id: 'json' as ExportFormat, icon: FileJson, color: 'text-amber-600', label: 'JSON' }
  ];

  return (
    <div className="flex flex-col gap-3">
      <Label className="text-[13px] font-medium text-slate-500">
        Formato de Archivo
      </Label>
      
      {/* Cuadrícula 2x2 */}
      <div className="grid grid-cols-2 gap-3">
        {formats.map((format) => {
          const Icon = format.icon;
          const isSelected = selectedFormat === format.id;
          
          return (
            <button
              key={format.id}
              onClick={() => onFormatChange(format.id)}
              className={cn(
                "flex items-center justify-center gap-2.5 px-3 py-3 rounded-lg border transition-all duration-200",
                isSelected 
                  ? "bg-slate-50 border-slate-400 shadow-sm" // Borde intermedio, sin "ring" extra
                  : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50"
              )}
            >
              <Icon 
                className={cn(
                  "h-4 w-4 shrink-0 transition-colors", 
                  isSelected ? format.color : "text-slate-400"
                )} 
              />
              <span 
                className={cn(
                  "text-sm font-medium transition-colors",
                  isSelected ? "text-slate-900" : "text-slate-600"
                )}
              >
                {format.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}