'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge'; // 👈 Usamos Badges
import { X } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface Props {
  className?: string;
  brandColor: string;
  availableTags: string[]; // 👈 Recibimos la lista de tags reales
}

export function CategoryFilters({ className, brandColor, availableTags }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const MAX_PRICE_LIMIT = 500; 

  const [minPrice, setMinPrice] = useState(searchParams.get('min') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('max') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');
  const [activeTag, setActiveTag] = useState(searchParams.get('tag') || ''); // Tag seleccionado
  
  const [sliderValue, setSliderValue] = useState([0, MAX_PRICE_LIMIT]);

  const handleSliderChange = (value: number[]) => {
    setSliderValue(value);
    setMinPrice(value[0].toString());
    setMaxPrice(value[1].toString());
  };

  useEffect(() => {
    const min = minPrice ? parseInt(minPrice) : 0;
    const max = maxPrice ? parseInt(maxPrice) : MAX_PRICE_LIMIT;
    setSliderValue([min, max]);
  }, [minPrice, maxPrice]);

  // 🛡️ Lógica Central de Filtros
  const applyFilters = ({ newTag, newSort }: { newTag?: string | null, newSort?: string } = {}) => {
    const params = new URLSearchParams(searchParams.toString());
    
    // 1. Tag (Si viene null explícito es para borrarlo)
    const tagToApply = newTag !== undefined ? newTag : activeTag;
    if (tagToApply) params.set('tag', tagToApply);
    else params.delete('tag');

    // 2. Sort
    const sortToApply = newSort || sort;
    if (sortToApply) params.set('sort', sortToApply);

    // 3. Precios
    if (minPrice) params.set('min', minPrice); else params.delete('min');
    if (maxPrice) params.set('max', maxPrice); else params.delete('max');
    
    params.set('page', '1'); 
    router.push(`?${params.toString()}`);
  };

  const toggleTag = (tag: string) => {
    const newTag = activeTag === tag ? null : tag; // Si ya está activo, lo quitamos (null)
    setActiveTag(newTag || '');
    applyFilters({ newTag });
  };

  const handleReset = () => {
    setMinPrice('');
    setMaxPrice('');
    setActiveTag('');
    setSort('newest');
    setSliderValue([0, MAX_PRICE_LIMIT]);
    router.push('?');
  };

  // Sincronizar URL -> Estado
  useEffect(() => {
    setMinPrice(searchParams.get('min') || '');
    setMaxPrice(searchParams.get('max') || '');
    setSort(searchParams.get('sort') || 'newest');
    setActiveTag(searchParams.get('tag') || '');
  }, [searchParams]);

  return (
    <div className={cn("space-y-8", className)}>
      
      {/* 1. Ordenar */}
      <div className="space-y-3">
        <h3 className="font-bold text-slate-700 text-sm uppercase tracking-wide">Ordenar</h3>
        <Select 
            value={sort} 
            onValueChange={(val) => { 
                setSort(val); 
                applyFilters({ newSort: val }); 
            }}
        >
          <SelectTrigger className="w-full bg-white border-slate-200 text-slate-700">
            <SelectValue placeholder="Seleccionar" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Lo más nuevo</SelectItem>
            <SelectItem value="price_asc">Precio: Bajo a Alto</SelectItem>
            <SelectItem value="price_desc">Precio: Alto a Bajo</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* 2. Filtros por Características (Tags) */}
      {availableTags.length > 0 && (
        <div className="space-y-3">
            <h3 className="font-bold text-slate-700 text-sm uppercase tracking-wide">Características</h3>
            <div className="flex flex-wrap gap-2">
                {availableTags.map((tag) => {
                    const isActive = activeTag === tag;
                    return (
                        <Badge
                            key={tag}
                            variant={isActive ? "default" : "outline"}
                            className={cn(
                                "cursor-pointer px-3 py-1.5 text-xs capitalize transition-all",
                                isActive 
                                    ? "text-white border-transparent hover:opacity-90" 
                                    : "text-slate-600 border-slate-200 bg-white hover:border-slate-400 hover:text-slate-900"
                            )}
                            style={isActive ? { backgroundColor: brandColor } : {}}
                            onClick={() => toggleTag(tag)}
                        >
                            {tag}
                            {isActive && <X className="ml-1 h-3 w-3" />}
                        </Badge>
                    )
                })}
            </div>
        </div>
      )}

      {/* 3. Precio */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-700 text-sm uppercase tracking-wide">Precio</h3>
            <span className="text-xs text-slate-400 font-medium">Max: S/ {MAX_PRICE_LIMIT}</span>
        </div>
        
        <Slider
            defaultValue={[0, MAX_PRICE_LIMIT]}
            value={sliderValue}
            max={MAX_PRICE_LIMIT}
            step={1}
            minStepsBetweenThumbs={1}
            onValueChange={handleSliderChange}
            className="py-2"
        />

        <div className="flex items-center gap-3">
            <div className="relative w-full">
                <span className="absolute left-3 top-2.5 text-slate-400 text-xs">S/</span>
                <Input 
                    type="number" 
                    className="pl-7 h-9 text-sm bg-white text-slate-700 border-slate-200" 
                    value={minPrice} 
                    onChange={(e) => {
                        const val = e.target.value;
                        if (Number(val) <= (Number(maxPrice) || MAX_PRICE_LIMIT)) setMinPrice(val);
                    }}
                    placeholder="0"
                />
            </div>
            <span className="text-slate-300">-</span>
            <div className="relative w-full">
                <span className="absolute left-3 top-2.5 text-slate-400 text-xs">S/</span>
                <Input 
                    type="number" 
                    className="pl-7 h-9 text-sm bg-white text-slate-700 border-slate-200" 
                    value={maxPrice} 
                    onChange={(e) => setMaxPrice(e.target.value)}
                    placeholder={MAX_PRICE_LIMIT.toString()}
                />
            </div>
        </div>
      </div>

      {/* Botones */}
      <div className="space-y-3 pt-4 border-t border-slate-100">
        <Button 
            className="w-full text-white font-bold transition-all hover:brightness-110 shadow-md"
            style={{ backgroundColor: brandColor }}
            onClick={() => applyFilters()}
        >
            Aplicar Filtros
        </Button>
        
        {(minPrice || maxPrice || activeTag || sort !== 'newest') && (
            <Button 
                variant="ghost" 
                className="w-full text-slate-500 hover:text-slate-900 hover:bg-slate-50 h-8 text-xs uppercase tracking-wider"
                onClick={handleReset}
            >
                Limpiar todo
            </Button>
        )}
      </div>
    </div>
  );
}