'use client';

import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Type, Link as LinkIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BannerContentSectionProps {
  title: string;
  subtitle: string;
  link: string;
  onTitleChange: (value: string) => void;
  onSubtitleChange: (value: string) => void;
  onLinkChange: (value: string) => void;
  brandFocusClass: string;
}

export function BannerContentSection({
  title,
  subtitle,
  link,
  onTitleChange,
  onSubtitleChange,
  onLinkChange,
  brandFocusClass
}: BannerContentSectionProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="border-b border-slate-100 bg-slate-50/50 px-5 py-4 flex items-center gap-2">
        <Type className="h-4 w-4 text-primary" />
        <h2 className="font-semibold text-slate-800 text-sm">Contenido del Banner</h2>
      </div>
      <div className="p-5 space-y-6">
        
        {/* TÍTULO */}
        <div className="flex flex-col gap-3">
          <Label htmlFor="title" className="text-[13px] font-medium text-slate-500">
            Título Principal
          </Label>
          <Input 
            id="title" 
            placeholder="Ej: ¡Verano de Locura!"
            value={title} 
            onChange={(e) => onTitleChange(e.target.value)} 
            className={cn(
              "h-10 bg-white transition-all",
              "focus:ring-2 focus:ring-slate-200 focus:ring-offset-0 focus:border-slate-300",
              "focus-visible:ring-2 focus-visible:ring-slate-200 focus-visible:ring-offset-0 focus-visible:border-slate-300",
              title ? "border-slate-300 shadow-sm" : "border-slate-200"
            )}
          />
        </div>

        {/* SUBTÍTULO */}
        <div className="flex flex-col gap-3">
          <Label htmlFor="subtitle" className="text-[13px] font-medium text-slate-500">
            Subtítulo <span className="text-xs text-slate-400 font-normal">(Opcional)</span>
          </Label>
          <Textarea 
            id="subtitle" 
            placeholder="Ej: Descuentos de hasta el 50% en toda la tienda..."
            value={subtitle} 
            onChange={(e) => onSubtitleChange(e.target.value)} 
            className={cn(
              "min-h-[90px] resize-none bg-white transition-all",
              "focus:ring-2 focus:ring-slate-200 focus:ring-offset-0 focus:border-slate-300",
              "focus-visible:ring-2 focus-visible:ring-slate-200 focus-visible:ring-offset-0 focus-visible:border-slate-300",
              subtitle ? "border-slate-300 shadow-sm" : "border-slate-200"
            )}
          />
        </div>

        {/* ENLACE */}
        <div className="flex flex-col gap-3">
          <Label htmlFor="link" className="text-[13px] font-medium text-slate-500">
            Enlace del Botón
          </Label>
          <div className="relative">
            <LinkIcon className={cn(
              "absolute left-3 top-2.5 h-4 w-4 transition-colors",
              link ? "text-slate-600" : "text-slate-400"
            )} />
            <Input 
              id="link" 
              value={link} 
              onChange={(e) => onLinkChange(e.target.value)} 
              className={cn(
                "h-10 pl-9 bg-white transition-all",
                "focus:ring-2 focus:ring-slate-200 focus:ring-offset-0 focus:border-slate-300",
                "focus-visible:ring-2 focus-visible:ring-slate-200 focus-visible:ring-offset-0 focus-visible:border-slate-300",
                link ? "border-slate-300 shadow-sm" : "border-slate-200"
              )}
              placeholder="/category/juguetes" 
            />
          </div>
        </div>
        
      </div>
    </div>
  );
}
