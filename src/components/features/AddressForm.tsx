'use client';

import { useTransition, useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { setUserAddress } from '@/actions/address';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Loader2, Save, Check, ChevronsUpDown } from 'lucide-react';
import { Address } from '@prisma/client';
import { PeruMap } from '@/components/profile/PeruMap';
import { DISTRICTS_BY_REGION } from '@/lib/peru-districts';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

const formSchema = z.object({
  address: z.string().min(5, 'Dirección requerida'),
  address2: z.string().optional(),
  city: z.string().min(2, 'Ciudad/Distrito requerido'),
  province: z.string().min(2, 'Provincia/Región requerida'),
});

type FormValues = z.infer<typeof formSchema>;

interface Props {
  address?: Address | null;
  brandColor: string;
}

export const AddressForm = ({ address, brandColor }: Props) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [openCityCombobox, setOpenCityCombobox] = useState(false);
  const [openRegionCombobox, setOpenRegionCombobox] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [regionSearchValue, setRegionSearchValue] = useState('');

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      address: address?.address || '',
      address2: address?.address2 || '',
      city: address?.city || '',
      province: address?.province || '',
    },
  });

  const selectedRegion = form.watch('province');
  const selectedCity = form.watch('city');

  // Función para normalizar texto (quitar tildes)
  const normalizeText = (text: string) => {
    return text
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
  };

  // Lista de regiones disponibles
  const availableRegions = useMemo(() => {
    const regions = Object.keys(DISTRICTS_BY_REGION);
    
    if (regionSearchValue.trim()) {
      const normalizedSearch = normalizeText(regionSearchValue);
      return regions.filter(region => 
        normalizeText(region).includes(normalizedSearch)
      );
    }
    
    return regions;
  }, [regionSearchValue]);

  const availableDistricts = useMemo(() => {
    if (!selectedRegion) return [];
    const districts = DISTRICTS_BY_REGION[selectedRegion] || [];
    
    // Filtrar por búsqueda si hay texto
    if (searchValue.trim()) {
      const normalizedSearch = normalizeText(searchValue);
      return districts.filter(district => 
        normalizeText(district).includes(normalizedSearch)
      );
    }
    
    return districts;
  }, [selectedRegion, searchValue]);

  const handleRegionSelect = (regionName: string) => {
    form.setValue('province', regionName);
    // Limpiar ciudad si la región cambia
    if (selectedCity && !DISTRICTS_BY_REGION[regionName]?.includes(selectedCity)) {
      form.setValue('city', '');
    }
    // Limpiar búsquedas
    setSearchValue('');
    setRegionSearchValue('');
  };

  const onSubmit = async (data: FormValues) => {
    startTransition(async () => {
      // @ts-ignore
      const { ok, message } = await setUserAddress(data);
      
      if (!ok) {
        toast.error(message);
        return;
      }
      toast.success(message);
      router.push('/profile/address');
      router.refresh();
    });
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        
        {/* COLUMNA IZQUIERDA: MAPA (solo desktop) */}
        <div className="hidden lg:block space-y-4">
          <div>
            <h2 className="text-[16px] md:text-[18px] font-semibold text-slate-900 mb-2">
              Selecciona tu Región
            </h2>
            <p className="text-[13px] md:text-[14px] text-slate-600 mb-6">
              Haz clic en el mapa para seleccionar tu región
            </p>
          </div>
          <PeruMap
            onSelectRegion={handleRegionSelect}
            selectedRegion={selectedRegion}
            brandColor={brandColor}
          />
        </div>

        {/* COLUMNA DERECHA: FORMULARIO */}
        <div className="lg:col-span-1">
          <div className="mb-6">
            <h2 className="text-[16px] md:text-[18px] font-semibold text-slate-900 mb-2">
              Datos de Dirección
            </h2>
            <p className="text-[13px] md:text-[14px] text-slate-600">
              Completa los datos de tu dirección de entrega
            </p>
          </div>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            
            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Provincia/Región - Desktop: disabled input, Mobile: combobox */}
                    <div className="grid gap-2">
                        <Label className="text-[13px] md:text-[14px]">Provincia/Región</Label>
                        
                        {/* Desktop: Input deshabilitado */}
                        <Input 
                          {...form.register('province')} 
                          className="hidden lg:block h-11 bg-slate-50" 
                          placeholder="Selecciona en el mapa"
                          disabled
                        />
                        
                        {/* Mobile: Combobox */}
                        <div className="lg:hidden">
                          <Popover open={openRegionCombobox} onOpenChange={setOpenRegionCombobox}>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                role="combobox"
                                aria-expanded={openRegionCombobox}
                                className={cn(
                                  "h-11 w-full justify-between font-normal text-xs md:text-sm",
                                  !selectedRegion && "text-slate-500"
                                )}
                              >
                                {selectedRegion || "Selecciona región..."}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[280px] p-0" align="start">
                              <div className="flex flex-col">
                                <div className="flex items-center border-b px-3">
                                  <Input
                                    placeholder="Buscar región..."
                                    value={regionSearchValue}
                                    onChange={(e) => setRegionSearchValue(e.target.value)}
                                    className="h-11 border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                                  />
                                </div>
                                
                                <div className="max-h-[300px] overflow-y-auto p-1">
                                  {availableRegions.length === 0 ? (
                                    <div className="py-6 text-center text-sm text-slate-500">
                                      No se encontró la región.
                                    </div>
                                  ) : (
                                    availableRegions.map((region) => (
                                      <div
                                        key={region}
                                        onClick={() => {
                                          handleRegionSelect(region);
                                          setOpenRegionCombobox(false);
                                        }}
                                        className={cn(
                                          "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-2 text-sm outline-none hover:bg-slate-100 transition-colors",
                                          selectedRegion === region && "bg-slate-100"
                                        )}
                                      >
                                        {region}
                                        <Check
                                          className={cn(
                                            "ml-auto h-4 w-4",
                                            selectedRegion === region ? "opacity-100" : "opacity-0"
                                          )}
                                        />
                                      </div>
                                    ))
                                  )}
                                </div>
                              </div>
                            </PopoverContent>
                          </Popover>
                        </div>
                        
                        <p className="text-xs text-red-500">{form.formState.errors.province?.message}</p>
                    </div>

                    {/* Ciudad/Distrito con Combobox */}
                    <div className="grid gap-2">
                        <Label className="text-[13px] md:text-[14px]">Ciudad/Distrito</Label>
                        <Popover open={openCityCombobox} onOpenChange={setOpenCityCombobox}>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              role="combobox"
                              aria-expanded={openCityCombobox}
                              className={cn(
                                "h-11 justify-between font-normal text-xs md:text-sm",
                                !selectedCity && "text-slate-500",
                                !selectedRegion && "bg-slate-50 cursor-not-allowed"
                              )}
                              disabled={!selectedRegion}
                            >
                              {selectedCity || (selectedRegion ? "Selecciona distrito..." : "Primero selecciona región")}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-[280px] p-0" align="start">
                            <div className="flex flex-col">
                              {/* Input de búsqueda */}
                              <div className="flex items-center border-b px-3">
                                <Input
                                  placeholder="Buscar distrito..."
                                  value={searchValue}
                                  onChange={(e) => setSearchValue(e.target.value)}
                                  className="h-11 border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                                />
                              </div>
                              
                              {/* Lista de distritos */}
                              <div className="max-h-[300px] overflow-y-auto p-1">
                                {availableDistricts.length === 0 ? (
                                  <div className="py-6 text-center text-sm text-slate-500">
                                    No se encontró el distrito.
                                  </div>
                                ) : (
                                  availableDistricts.map((district) => (
                                    <div
                                      key={district}
                                      onClick={() => {
                                        form.setValue('city', district);
                                        setSearchValue('');
                                        setOpenCityCombobox(false);
                                      }}
                                      className={cn(
                                        "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-2 text-sm outline-none hover:bg-slate-100 transition-colors",
                                        selectedCity === district && "bg-slate-100"
                                      )}
                                    >
                                      {district}
                                      <Check
                                        className={cn(
                                          "ml-auto h-4 w-4",
                                          selectedCity === district ? "opacity-100" : "opacity-0"
                                        )}
                                      />
                                    </div>
                                  ))
                                )}
                              </div>
                            </div>
                          </PopoverContent>
                        </Popover>
                        <p className="text-xs text-red-500">{form.formState.errors.city?.message}</p>
                    </div>
                </div>

                <div className="grid gap-2">
                    <Label className="text-[13px] md:text-[14px]">Dirección</Label>
                    <Input {...form.register('address')} className="h-11 text-xs md:text-sm placeholder:text-xs md:placeholder:text-sm" placeholder="Av. Pardo 123, Mz H Lt 4" />
                    <p className="text-xs text-red-500">{form.formState.errors.address?.message}</p>
                </div>

                <div className="grid gap-2">
                    <Label className="text-[13px] md:text-[14px]">Referencia (opcional)</Label>
                    <Input {...form.register('address2')} className="h-11 text-xs md:text-sm placeholder:text-xs md:placeholder:text-sm" placeholder="Frente al parque, portón negro..." />
                </div>
            </div>

            <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/profile/address')}
                  className="flex-1 h-12"
                  disabled={isPending}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={isPending} 
                  className="flex-1 h-12 font-semibold text-white"
                  style={{ backgroundColor: brandColor }}
                >
                    {isPending ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Guardando...</> : <><Save className="w-5 h-5 mr-2" /> Guardar</>}
                </Button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
};