'use client';

import { FileSpreadsheet, FileText, FileJson, Check } from 'lucide-react';
import { ExportFormat } from '@/lib/export';

interface FormatSelectorProps {
  selectedFormat: ExportFormat;
  onFormatChange: (format: ExportFormat) => void;
}

export function FormatSelector({ selectedFormat, onFormatChange }: FormatSelectorProps) {
  const formats = [
    { id: 'xlsx' as ExportFormat, icon: FileSpreadsheet, color: 'text-emerald-600', label: 'Excel' },
    { id: 'csv' as ExportFormat, icon: FileText, color: 'text-blue-600', label: 'CSV' },
    { id: 'pdf' as ExportFormat, icon: FileText, color: 'text-rose-600', label: 'PDF' },
    { id: 'json' as ExportFormat, icon: FileJson, color: 'text-amber-600', label: 'JSON' }
  ];

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-slate-800">Formato de Archivo</h3>
      <div className="grid grid-cols-2 gap-3">
        {formats.map((format) => {
          const Icon = format.icon;
          const isSelected = selectedFormat === format.id;
          return (
            <button
              key={format.id}
              onClick={() => onFormatChange(format.id)}
              className={`relative flex items-center gap-3 p-3 rounded-lg border transition-all text-left ${
                isSelected
                  ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                  : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <Icon className={`h-5 w-5 ${format.color} shrink-0`} />
              <span className="font-medium text-sm text-slate-700">{format.label}</span>
              {isSelected && (
                <Check className="h-4 w-4 text-primary absolute right-3" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}