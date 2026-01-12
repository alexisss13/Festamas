'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { CalendarIcon, Loader2, Save, Tag, Percent, DollarSign, Users, Clock } from 'lucide-react';
import { Division } from '@prisma/client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { createCoupon } from '@/actions/coupon';

// --- 🛠️ SCHEMA UI (Todo como String) ---
// Manejamos los números como Strings en la UI para evitar conflictos de tipos con HTML
const formSchema = z.object({
  code: z.string().min(3, "Mínimo 3 caracteres"),
  
  // Validamos que el string sea un número positivo
  discount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Debe ser un número mayor a 0",
  }),
  
  type: z.enum(["FIXED", "PERCENTAGE"]),
  division: z.nativeEnum(Division),
  expirationDate: z.date().optional(),
  
  // Validamos que sea un entero si existe
  maxUses: z.string().optional().refine((val) => !val || /^\d+$/.test(val), {
    message: "Debe ser un número entero válido",
  }),
});

// Inferimos el tipo del formulario
type FormValues = z.infer<typeof formSchema>;

interface Props {
  defaultDivision: Division;
}

export const CouponForm = ({ defaultDivision }: Props) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const isFestamas = defaultDivision === 'JUGUETERIA';
  
  // 🎨 Colores de Marca
  const activeColor = isFestamas ? "bg-festamas-primary hover:bg-festamas-primary/90" : "bg-fiestasya-accent hover:bg-fiestasya-accent/90";
  const ringColor = isFestamas ? "focus-visible:ring-festamas-primary" : "focus-visible:ring-fiestasya-accent";

  // Inicializamos el formulario con Strings vacíos para los números
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: '',
      discount: '', // String vacío compatible con el input
      type: 'FIXED',
      division: defaultDivision,
      maxUses: '',  // String vacío
    },
  });

  const onSubmit = (values: FormValues) => {
    startTransition(async () => {
      // 🔄 Conversión: UI (String) -> Backend (Number)
      const payload = {
        ...values,
        discount: Number(values.discount),
        maxUses: values.maxUses && values.maxUses.trim() !== '' ? parseInt(values.maxUses) : undefined,
      };
      
      const { success, message } = await createCoupon(payload);
      
      if (success) {
        toast.success('Cupón creado correctamente');
        router.push('/admin/coupons');
        router.refresh();
      } else {
        toast.error(message || 'Error al crear cupón');
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 bg-white p-6 md:p-8 rounded-xl border border-slate-200 shadow-sm">
        
        {/* INPUT OCULTO PARA DIVISIÓN */}
        <input type="hidden" {...form.register("division")} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* CÓDIGO */}
          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-slate-400" /> Código del Cupón
                </FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Ej: VERANO2026" 
                    {...field} 
                    className={cn("uppercase font-mono tracking-wider font-bold", ringColor)} 
                  />
                </FormControl>
                <FormDescription>Se guardará en mayúsculas automáticamente.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* TIPO */}
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                    {field.value === 'FIXED' ? <DollarSign className="w-4 h-4 text-slate-400"/> : <Percent className="w-4 h-4 text-slate-400"/>}
                    Tipo de Descuento
                </FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className={cn(ringColor)}>
                      <SelectValue placeholder="Tipo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="FIXED">Monto Fijo (S/)</SelectItem>
                    <SelectItem value="PERCENTAGE">Porcentaje (%)</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* VALOR (Ahora manejado como string en el form) */}
          <FormField
            control={form.control}
            name="discount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Valor a descontar</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input 
                        type="number" // HTML validará input numérico visualmente
                        step="0.01" 
                        placeholder="0.00"
                        {...field} 
                        className={cn("pl-8 font-semibold", ringColor)} 
                    />
                    <span className="absolute left-3 top-2.5 text-slate-400 text-sm font-bold">
                       {form.watch("type") === 'FIXED' ? 'S/' : '%'}
                    </span>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* SECCIÓN AVANZADA */}
        <div className="rounded-lg border border-slate-100 bg-slate-50/50 p-5 mt-4">
            <h3 className="text-sm font-semibold text-slate-500 mb-4 flex items-center gap-2 uppercase tracking-wide">
              <Clock className="w-4 h-4" /> Configuración de Validez
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* FECHA EXPIRACIÓN */}
                <FormField
                control={form.control}
                name="expirationDate"
                render={({ field }) => (
                    <FormItem className="flex flex-col">
                    <FormLabel>Fecha Límite</FormLabel>
                    <Popover>
                        <PopoverTrigger asChild>
                        <FormControl>
                            <Button
                            variant={"outline"}
                            className={cn(
                                "w-full pl-3 text-left font-normal border-slate-200 hover:bg-white hover:text-slate-900",
                                !field.value && "text-muted-foreground",
                                ringColor
                            )}
                            >
                            {field.value ? (
                                format(field.value, "PPP", { locale: es })
                            ) : (
                                <span>Sin fecha de expiración</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                        </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date < new Date(new Date().setHours(0,0,0,0))}
                            initialFocus
                        />
                        </PopoverContent>
                    </Popover>
                    <FormMessage />
                    </FormItem>
                )}
                />

                {/* LÍMITE DE USOS (Manejado como string) */}
                <FormField
                    control={form.control}
                    name="maxUses"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel className="flex items-center gap-2">
                             <Users className="w-4 h-4 text-slate-400"/> Límite de Clientes
                        </FormLabel>
                        <FormControl>
                        <Input 
                            type="number" 
                            placeholder="Ilimitado" 
                            {...field}
                            // Aseguramos que el valor nunca sea null/undefined para el input
                            value={field.value || ''} 
                            className={cn(ringColor)}
                        />
                        </FormControl>
                        <FormDescription className="text-xs text-slate-500">
                          Ej: "5" para que solo las primeras 5 personas puedan usarlo.
                        </FormDescription>
                        <FormMessage />
                    </FormItem>
                    )}
                />
            </div>
        </div>

        <div className="flex justify-end pt-4">
            <Button type="submit" disabled={isPending} className={cn(
              "w-full md:w-auto text-white shadow-md font-bold transition-all hover:translate-y-[-1px] active:translate-y-[1px]",
              activeColor
            )}>
                {isPending ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Guardando...
                    </>
                ) : (
                    <>
                        <Save className="mr-2 h-4 w-4" /> Guardar Cupón
                    </>
                )}
            </Button>
        </div>
      </form>
    </Form>
  );
};