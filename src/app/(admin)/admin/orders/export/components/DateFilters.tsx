'use client';

import { useRef } from 'react';
import { Label } from '@/components/ui/label';
import { CalendarIcon, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DateFiltersProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
}

export function DateFilters({ startDate, endDate, onStartDateChange, onEndDateChange }: DateFiltersProps) {
  const startDateRef = useRef<HTMLInputElement>(null);
  const endDateRef = useRef<HTMLInputElement>(null);
  
  const formatDateToYMD = (date: Date) => {
    const offset = date.getTimezoneOffset();
    const adjustedDate = new Date(date.getTime() - (offset * 60 * 1000));
    return adjustedDate.toISOString().split('T')[0];
  };

  const displayDate = (dateStr: string) => {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  };

  const handlePreset = (preset: 'all' | 'today' | 'week' | 'month') => {
    if (preset === 'all') {
      onStartDateChange('');
      onEndDateChange('');
      return;
    }

    const end = new Date();
    const start = new Date();

    if (preset === 'week') start.setDate(end.getDate() - 7);
    if (preset === 'month') start.setDate(1);

    onStartDateChange(formatDateToYMD(start));
    onEndDateChange(formatDateToYMD(end));
  };

  const isPresetActive = (preset: 'all' | 'today' | 'week' | 'month') => {
    if (preset === 'all') return !startDate && !endDate;
    if (!startDate || !endDate) return false;
    
    const end = new Date();
    const start = new Date();
    if (preset === 'week') start.setDate(end.getDate() - 7);
    if (preset === 'month') start.setDate(1);
    
    return startDate === formatDateToYMD(start) && endDate === formatDateToYMD(end);
  };

  return (
    <div className="flex flex-col gap-3">
      <Label className="text-[13px] font-medium text-slate-500">
        Periodo de Exportación
      </Label>
      
      <div className="flex flex-wrap items-center gap-3 w-full">
        
        {/* 1. Botones Rápidos */}
        <div className="inline-flex items-center p-1 bg-slate-50/80 rounded-lg border border-slate-200/60 w-full sm:w-auto overflow-x-auto scrollbar-hide">
          {(['all', 'today', 'week', 'month'] as const).map((preset) => {
            const labels = { all: 'Todo', today: 'Hoy', week: '7 Días', month: 'Este mes' };
            const active = isPresetActive(preset);
            return (
              <button
                key={preset}
                onClick={() => handlePreset(preset)}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200 whitespace-nowrap",
                  active 
                    ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200/50" 
                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-200/50"
                )}
              >
                {labels[preset]}
              </button>
            );
          })}
        </div>

        <div className="hidden sm:block h-6 w-px bg-slate-200 shrink-0" /> 

        {/* 2. Selector de Rango */}
        <div className="flex items-center h-10 px-3 bg-white border border-slate-200 rounded-lg shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all w-full sm:w-auto">
          
          <CalendarIcon className="w-4 h-4 text-slate-400 mr-3 shrink-0" />
          
          {/* Falso input: Fecha Inicial */}
          <div 
            className="relative flex items-center justify-center min-w-[85px] cursor-pointer hover:text-slate-900"
            onClick={() => startDateRef.current?.showPicker()}
          >
            <input
              ref={startDateRef}
              type="date"
              value={startDate}
              onChange={(e) => onStartDateChange(e.target.value)}
              className="absolute opacity-0 w-0 h-0 pointer-events-none"
            />
            <span className={cn("text-[13.5px] font-medium transition-colors", !startDate ? "text-slate-400" : "text-slate-600")}>
              {startDate ? displayDate(startDate) : "dd/mm/yyyy"}
            </span>
          </div>

          <ArrowRight className="w-3.5 h-3.5 text-slate-300 mx-3 shrink-0" />

          {/* Falso input: Fecha Final */}
          <div 
            className="relative flex items-center justify-center min-w-[85px] cursor-pointer hover:text-slate-900"
            onClick={() => endDateRef.current?.showPicker()}
          >
            <input
              ref={endDateRef}
              type="date"
              value={endDate}
              onChange={(e) => onEndDateChange(e.target.value)}
              className="absolute opacity-0 w-0 h-0 pointer-events-none"
            />
            <span className={cn("text-[13.5px] font-medium transition-colors", !endDate ? "text-slate-400" : "text-slate-600")}>
              {endDate ? displayDate(endDate) : "dd/mm/yyyy"}
            </span>
          </div>

        </div>

      </div>
    </div>
  );
}