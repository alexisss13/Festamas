'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { X, Star, Tag, Package } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  className?: string;
  brandColor: string;
  availableTags: string[];
}

export function CategoryFilters({ className, brandColor, availableTags }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const MAX_PRICE_LIMIT = 500; 

  const [minPrice, setMinPrice] = useState(searchParams.get('min') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('max') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');
  const [activeTag, setActiveTag] = useState(searchParams.get('tag') || '');
  const [onlyDiscount, setOnlyDiscount] = useState(searchParams.get('discount') === 'true');
  const [onlyStock, setOnlyStock] = useState(searchParams.get('stock') === 'true');
  
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

  const applyFilters = ({ newTag, newSort }: { newTag?: string | null, newSort?: string } = {}) => {
    const params = new URLSearchParams(searchParams.toString());
    
    const tagToApply = newTag !== undefined ? newTag : activeTag;
    if (tagToApply) params.set('tag', tagToApply);
    else params.delete('tag');

    const sortToApply = newSort || sort;
    if (sortToApply) params.set('sort', sortToApply);

    if (minPrice) params.set('min', minPrice); else params.delete('min');
    if (maxPrice) params.set('max', maxPrice); else params.delete('max');
    
    if (onlyDiscount) params.set('discount', 'true'); else params.delete('discount');
    if (onlyStock) params.set('stock', 'true'); else params.delete('stock');
    
    params.set('page', '1'); 
    router.push(`?${params.toString()}`);
  };

  const toggleTag = (tag: string) => {
    const newTag = activeTag === tag ? null : tag;
    setActiveTag(newTag || '');
    applyFilters({ newTag });
  };

  const handleReset = () => {
    setMinPrice('');
    setMaxPrice('');
    setActiveTag('');
    setSort('newest');
    setOnlyDiscount(false);
    setOnlyStock(false);
    setSliderValue([0, MAX_PRICE_LIMIT]);
    router.push('?');
  };

  useEffect(() => {
    setMinPrice(searchParams.get('min') || '');
    setMaxPrice(searchParams.get('max') || '');
    setSort(searchParams.get('sort') || 'newest');
    setActiveTag(searchParams.get('tag') || '');
    setOnlyDiscount(searchParams.get('discount') === 'true');
    setOnlyStock(searchParams.get('stock') === 'true');
  }, [searchParams]);

  return (
    <div className={cn("space-y-6", className)}>
      
      {/* Rango de Precio */}
      <div className="space-y-4 pb-6 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <Tag className="h-4 w-4 text-slate-600" />
          <h3 className="font-semibold text-slate-900 text-sm">Precio</h3>
        </div>
        
        <Slider
          defaultValue={[0, MAX_PRICE_LIMIT]}
          value={sliderValue}
          max={MAX_PRICE_LIMIT}
          step={5}
          minStepsBetweenThumbs={5}
          onValueChange={handleSliderChange}
          className="py-2"
        />

        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <span className="absolute left-3 top-2.5 text-slate-500 text-xs font-medium">S/</span>
            <Input 
              type="number" 
              className="pl-8 h-10 text-sm bg-white text-slate-700 border-slate-200 hover:border-slate-300 transition-colors" 
              value={minPrice} 
              onChange={(e) => {
                const val = e.target.value;
                if (Number(val) <= (Number(maxPrice) || MAX_PRICE_LIMIT)) setMinPrice(val);
              }}
              placeholder="0"
            />
          </div>
          <span className="text-slate-400 font-medium">—</span>
          <div className="relative flex-1">
            <span className="absolute left-3 top-2.5 text-slate-500 text-xs font-medium">S/</span>
            <Input 
              type="number" 
              className="pl-8 h-10 text-sm bg-white text-slate-700 border-slate-200 hover:border-slate-300 transition-colors" 
              value={maxPrice} 
              onChange={(e) => setMaxPrice(e.target.value)}
              placeholder={MAX_PRICE_LIMIT.toString()}
            />
          </div>
        </div>
      </div>

      {/* Ofertas y Disponibilidad */}
      <div className="space-y-3 pb-6 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <Star className="h-4 w-4 text-slate-600" />
          <h3 className="font-semibold text-slate-900 text-sm">Ofertas</h3>
        </div>
        
        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer group">
            <Checkbox 
              checked={onlyDiscount}
              onCheckedChange={(checked) => {
                setOnlyDiscount(checked as boolean);
              }}
              className="border-slate-300"
            />
            <span className="text-sm text-slate-700 group-hover:text-slate-900">
              Solo con descuento
            </span>
          </label>
        </div>
      </div>

      {/* Disponibilidad */}
      <div className="space-y-3 pb-6 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <Package className="h-4 w-4 text-slate-600" />
          <h3 className="font-semibold text-slate-900 text-sm">Disponibilidad</h3>
        </div>
        
        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer group">
            <Checkbox 
              checked={onlyStock}
              onCheckedChange={(checked) => {
                setOnlyStock(checked as boolean);
              }}
              className="border-slate-300"
            />
            <span className="text-sm text-slate-700 group-hover:text-slate-900">
              Solo con stock
            </span>
          </label>
        </div>
      </div>

      {/* Características (Tags) */}
      {availableTags.length > 0 && (
        <div className="space-y-3 pb-6 border-b border-slate-200">
          <h3 className="font-semibold text-slate-900 text-sm">Características</h3>
          <div className="flex flex-wrap gap-2">
            {availableTags.map((tag) => {
              const isActive = activeTag === tag;
              return (
                <Badge
                  key={tag}
                  variant={isActive ? "default" : "outline"}
                  className={cn(
                    "cursor-pointer px-3 py-1.5 text-xs font-medium capitalize transition-all",
                    isActive 
                      ? "text-white border-transparent shadow-sm hover:opacity-90" 
                      : "text-slate-700 border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                  )}
                  style={isActive ? { backgroundColor: brandColor } : {}}
                  onClick={() => toggleTag(tag)}
                >
                  {tag}
                  {isActive && <X className="ml-1.5 h-3 w-3" />}
                </Badge>
              )
            })}
          </div>
        </div>
      )}

      {/* Botones de Acción */}
      <div className="space-y-2 pt-2">
        <Button 
          className="w-full text-white font-semibold transition-all hover:brightness-110 shadow-sm h-10"
          style={{ backgroundColor: brandColor }}
          onClick={() => applyFilters()}
        >
          Aplicar filtros
        </Button>
        
        {(minPrice || maxPrice || activeTag || sort !== 'newest' || onlyDiscount || onlyStock) && (
          <Button 
            variant="ghost" 
            className="w-full text-slate-600 hover:text-slate-900 hover:bg-slate-50 h-9 text-sm"
            onClick={handleReset}
          >
            Limpiar filtros
          </Button>
        )}
      </div>
    </div>
  );
}