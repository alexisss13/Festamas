'use client';

import { useState, useTransition, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { setUserAddress } from '@/actions/address';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Loader2, MapPin, Save, User, IdCard, Flag } from 'lucide-react';
import { Address } from '@prisma/client';
import { PERU_DEPARTMENTS, getProvinces, getDistricts } from '@/lib/ubigeo';

const formSchema = z.object({
  dni: z.string().min(8, 'DNI de 8 dígitos').max(8, 'DNI de 8 dígitos').regex(/^\d+$/, 'Solo números'),
  firstName: z.string().min(2, 'Nombre requerido'),
  lastName: z.string().min(2, 'Apellido requerido'),
  address: z.string().min(5, 'Dirección requerida'),
  address2: z.string().optional(),
  department: z.string().min(1, 'Selecciona departamento'),
  province: z.string().min(1, 'Selecciona provincia'),
  district: z.string().min(1, 'Selecciona distrito'),
  phone: z.string().regex(/^\d{9}$/, 'Celular de 9 dígitos'),
});

type FormValues = z.infer<typeof formSchema>;

interface Props {
  address?: Address | null;
  userData?: { name?: string | null; email?: string | null } | null;
  isFestamas: boolean;
}

export const AddressForm = ({ address, userData, isFestamas }: Props) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Estilos
  const bgPrimary = isFestamas ? 'bg-[#fc4b65] hover:bg-[#e11d48]' : 'bg-[#ec4899] hover:bg-[#be185d]';
  const textPrimary = isFestamas ? 'text-[#fc4b65]' : 'text-[#ec4899]';
  const ringFocus = isFestamas ? 'focus-visible:ring-[#fc4b65]' : 'focus-visible:ring-[#ec4899]';

  // Recuperar datos guardados
  const storedProvinceFull = address?.province || ''; // "Depto - Prov"
  const [storedDept, storedProvOnly] = storedProvinceFull.includes(' - ') 
    ? storedProvinceFull.split(' - ') 
    : ['', ''];

  const splitName = (fullName?: string | null) => {
    if (!fullName) return { first: '', last: '' };
    const parts = fullName.trim().replace(/\s+/g, ' ').split(' ');
    if (parts.length <= 1) return { first: parts[0] || '', last: '' };
    if (parts.length === 2) return { first: parts[0], last: parts[1] };
    if (parts.length === 3) return { first: parts[0], last: `${parts[1]} ${parts[2]}` };
    if (parts.length === 4) return { first: `${parts[0]} ${parts[1]}`, last: `${parts[2]} ${parts[3]}` };
    return { first: `${parts[0]} ${parts[1]}`, last: parts.slice(2).join(' ') };
  };

  const { first: defaultName, last: defaultLast } = address ? { first: '', last: '' } : splitName(userData?.name);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      dni: address?.dni || '', 
      firstName: address?.firstName || defaultName,
      lastName: address?.lastName || defaultLast,
      address: address?.address || '',
      address2: address?.address2 || '',
      department: storedDept || '',
      province: storedProvOnly || '',
      district: address?.city || '',
      phone: address?.phone || '',
    },
  });

  // --- LÓGICA DE UBIGEO EN CASCADA ---
  const selectedDepartment = form.watch('department');
  const selectedProvince = form.watch('province');

  const [provinces, setProvinces] = useState<string[]>([]);
  const [districts, setDistricts] = useState<string[]>([]);

  // 1. Cuando cambia Departamento -> Cargar Provincias
  useEffect(() => {
    if (selectedDepartment) {
        const newProvs = getProvinces(selectedDepartment);
        setProvinces(newProvs);
        
        // Si la provincia seleccionada ya no existe en el nuevo departamento, resetearla
        const currentProv = form.getValues('province');
        if (currentProv && !newProvs.includes(currentProv)) {
             form.setValue('province', '');
             form.setValue('district', ''); // También resetear distrito
        }
    } else {
        setProvinces([]);
        setDistricts([]);
    }
  }, [selectedDepartment, form]);

  // 2. Cuando cambia Provincia -> Cargar Distritos
  useEffect(() => {
    if (selectedProvince) {
        const newDists = getDistricts(selectedProvince);
        setDistricts(newDists);

        // Si el distrito seleccionado ya no existe en la nueva provincia, resetearlo
        const currentDist = form.getValues('district');
        if (currentDist && !newDists.includes(currentDist)) {
            form.setValue('district', '');
        }
    } else {
        setDistricts([]);
    }
  }, [selectedProvince, form]);


  const onSubmit = async (data: FormValues) => {
    startTransition(async () => {
      // Guardamos en formato compatible con el Schema actual
      const dbData = {
        ...data,
        city: data.district, // 'city' en BD guarda el Distrito
        province: `${data.department} - ${data.province}` // 'province' guarda Depto-Prov
      };

      // @ts-ignore
      const { ok, message } = await setUserAddress(dbData);
      
      if (!ok) {
        toast.error(message);
        return;
      }
      toast.success(message);
      router.push('/profile');
      router.refresh();
    });
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="grid gap-8">
        
        {/* SECCIÓN 1: DATOS PERSONALES */}
        <div className="bg-white p-6 md:p-8 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
            <div className={cn("absolute top-0 left-0 w-1 h-full", bgPrimary)} />
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-6">
                <User className={cn("w-5 h-5", textPrimary)} /> Identificación
            </h3>
            
            <div className="space-y-5">
                <div className="grid gap-2">
                    <Label htmlFor="dni">DNI</Label>
                    <div className="relative">
                        <IdCard className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                        <Input {...form.register('dni')} placeholder="DNI" maxLength={8} className={cn("pl-9 font-mono tracking-widest", ringFocus)} />
                    </div>
                    <p className="text-xs text-red-500">{form.formState.errors.dni?.message}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="grid gap-2">
                        <Label>Nombres</Label>
                        <Input {...form.register('firstName')} className={ringFocus} />
                        <p className="text-xs text-red-500">{form.formState.errors.firstName?.message}</p>
                    </div>
                    <div className="grid gap-2">
                        <Label>Apellidos</Label>
                        <Input {...form.register('lastName')} className={ringFocus} />
                        <p className="text-xs text-red-500">{form.formState.errors.lastName?.message}</p>
                    </div>
                </div>

                <div className="grid gap-2">
                    <Label>Celular</Label>
                    <Input {...form.register('phone')} type="tel" maxLength={9} className={ringFocus} />
                    <p className="text-xs text-red-500">{form.formState.errors.phone?.message}</p>
                </div>
            </div>
        </div>

        {/* SECCIÓN 2: UBICACIÓN */}
        <div className="bg-white p-6 md:p-8 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
            <div className={cn("absolute top-0 left-0 w-1 h-full", bgPrimary)} />
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-6">
                <MapPin className={cn("w-5 h-5", textPrimary)} /> Dirección de Entrega
            </h3>

            <div className="space-y-5">
                
                {/* SELECTORES DE UBIACIÓN EN GRID DE 3 */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    
                    {/* 1. DEPARTAMENTO */}
                    <div className="grid gap-2">
                        <Label>Departamento</Label>
                        <Select 
                            onValueChange={(val) => form.setValue('department', val)} 
                            defaultValue={form.getValues('department')}
                        >
                            <SelectTrigger className={ringFocus}>
                                <SelectValue placeholder="Selecciona" />
                            </SelectTrigger>
                            <SelectContent>
                                {PERU_DEPARTMENTS.map((dep) => (<SelectItem key={dep} value={dep}>{dep}</SelectItem>))}
                            </SelectContent>
                        </Select>
                        <p className="text-xs text-red-500">{form.formState.errors.department?.message}</p>
                    </div>

                    {/* 2. PROVINCIA */}
                    <div className="grid gap-2">
                        <Label>Provincia</Label>
                        <Select 
                            disabled={!selectedDepartment}
                            onValueChange={(val) => form.setValue('province', val)} 
                            value={form.watch('province')} // Controlado para reset
                            key={selectedDepartment} // Forzar render al cambiar depto
                        >
                            <SelectTrigger className={ringFocus}>
                                <SelectValue placeholder="Selecciona" />
                            </SelectTrigger>
                            <SelectContent>
                                {provinces.map((prov) => (<SelectItem key={prov} value={prov}>{prov}</SelectItem>))}
                            </SelectContent>
                        </Select>
                        <p className="text-xs text-red-500">{form.formState.errors.province?.message}</p>
                    </div>

                    {/* 3. DISTRITO (SELECT) */}
                    <div className="grid gap-2">
                        <Label>Distrito</Label>
                        <Select 
                            disabled={!selectedProvince}
                            onValueChange={(val) => form.setValue('district', val)} 
                            value={form.watch('district')} // Controlado para reset
                            key={selectedProvince} // Forzar render al cambiar provincia
                        >
                            <SelectTrigger className={ringFocus}>
                                <SelectValue placeholder="Selecciona" />
                            </SelectTrigger>
                            <SelectContent>
                                {districts.map((dist) => (<SelectItem key={dist} value={dist}>{dist}</SelectItem>))}
                            </SelectContent>
                        </Select>
                        <p className="text-xs text-red-500">{form.formState.errors.district?.message}</p>
                    </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 p-2 rounded border border-slate-100">
                    <Flag className="w-3 h-3 text-red-500" />
                    <span>Solo disponible en <strong>Perú</strong>.</span>
                </div>

                <div className="grid gap-2">
                    <Label>Dirección Exacta</Label>
                    <div className="relative">
                        <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                        <Input {...form.register('address')} className={cn("pl-9", ringFocus)} placeholder="Av. Pardo 123, Mz H Lt 4" />
                    </div>
                    <p className="text-xs text-red-500">{form.formState.errors.address?.message}</p>
                </div>

                <div className="grid gap-2">
                    <Label>Referencia</Label>
                    <Input {...form.register('address2')} className={ringFocus} placeholder="Frente al parque, portón negro..." />
                </div>
            </div>
        </div>

        <div className="flex justify-end pt-2">
            <Button type="submit" disabled={isPending} size="lg" className={cn("w-full md:w-auto px-10 font-bold text-white shadow-lg transition-all hover:scale-105 active:scale-95", bgPrimary)}>
                {isPending ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Guardando...</> : <><Save className="w-5 h-5 mr-2" /> Guardar Dirección</>}
            </Button>
        </div>
      </div>
    </form>
  );
};