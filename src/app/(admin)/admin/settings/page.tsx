'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Loader2, Save, MessageSquare, Phone, Package } from 'lucide-react';
import { getStoreConfig, updateStoreConfig } from '@/actions/settings';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

// 1. Definir Schema
const formSchema = z.object({
  whatsappPhone: z.string().min(9, "Ingresa un celular válido (ej: 519...)"),
  welcomeMessage: z.string().min(1, "El mensaje no puede estar vacío"),
  localDeliveryPrice: z.coerce.number().min(0, "El precio no puede ser negativo"),
  templateKey: z.enum(['classic', 'modern', 'playful', 'editorial', 'minimal']),
  primaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  secondaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  accentColor: z.string().regex(/^#[0-9a-fA-F]{6}$/),
});

// 2. Definir Tipo Explícito
type SettingsFormValues = z.infer<typeof formSchema>;

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const form = useForm<SettingsFormValues>({
    // 👇 3. SOLUCIÓN: Silenciamos el conflicto de tipos del resolver
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      whatsappPhone: '',
      welcomeMessage: '',
      localDeliveryPrice: 0,
      templateKey: 'classic',
      primaryColor: '#475569',
      secondaryColor: '#e2e8f0',
      accentColor: '#0f172a',
    },
  });

  // Cargar datos al iniciar
  useEffect(() => {
    getStoreConfig().then((config) => {
      form.reset({
        whatsappPhone: config.whatsappPhone,
        welcomeMessage: config.welcomeMessage,
        localDeliveryPrice: config.localDeliveryPrice || 0,
        templateKey: config.templateKey as SettingsFormValues['templateKey'],
        primaryColor: config.primaryColor,
        secondaryColor: config.secondaryColor,
        accentColor: config.accentColor,
      });
      setLoading(false);
    });
  }, [form]);

  const onSubmit = async (values: SettingsFormValues) => {
    setSaving(true);
    const res = await updateStoreConfig(values);
    if (res.success) {
      toast.success(res.message);
    } else {
      toast.error(res.message);
    }
    setSaving(false);
  };

  if (loading) {
    return <div className="p-8 flex items-center justify-center text-slate-500">Cargando configuración...</div>;
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Configuración</h1>
        <p className="text-slate-500">Personaliza los datos de contacto de tu tienda.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Canales de Venta</CardTitle>
          <CardDescription>
            Estos datos se usarán en el botón de WhatsApp y en el Checkout.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              
              <FormField
                control={form.control}
                name="whatsappPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                        <Phone className="h-4 w-4" /> WhatsApp del Negocio
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="51999999999" {...field} />
                    </FormControl>
                    <FormDescription>
                      Formato internacional sin símbolos (ej: 51987654321).
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField control={form.control} name="templateKey" render={({ field }) => (<FormItem><FormLabel>Plantilla visual</FormLabel><FormControl><select {...field} className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm"><option value="classic">Clásica</option><option value="modern">Moderna</option><option value="playful">Dinámica</option><option value="editorial">Editorial</option><option value="minimal">Minimalista</option></select></FormControl><FormDescription>Define la estructura visual de esta sucursal.</FormDescription><FormMessage /></FormItem>)} />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3"><FormField control={form.control} name="primaryColor" render={({ field }) => (<FormItem><FormLabel>Color principal</FormLabel><FormControl><Input type="color" {...field} className="h-10 p-1" /></FormControl></FormItem>)} /><FormField control={form.control} name="secondaryColor" render={({ field }) => (<FormItem><FormLabel>Color secundario</FormLabel><FormControl><Input type="color" {...field} className="h-10 p-1" /></FormControl></FormItem>)} /><FormField control={form.control} name="accentColor" render={({ field }) => (<FormItem><FormLabel>Color de acento</FormLabel><FormControl><Input type="color" {...field} className="h-10 p-1" /></FormControl></FormItem>)} /></div>

              <FormField
                control={form.control}
                name="welcomeMessage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" /> Mensaje Predeterminado (Checkout)
                    </FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Hola FiestasYa, quiero confirmar mi pedido..." 
                        className="resize-none h-24"
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Este texto aparecerá cuando el cliente haga clic en &quot;Completar pedido&quot;.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* CAMPO DE PRECIO DE DELIVERY */}
              <FormField
                control={form.control}
                name="localDeliveryPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                        <Package className="h-4 w-4" /> Precio Delivery Local (Trujillo)
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-slate-500">S/.</span>
                        <Input 
                            type="number" 
                            step="0.50"
                            className="pl-9" 
                            {...field} 
                            // Manejo manual del número para evitar NaN y conflictos de tipo
                            onChange={e => {
                                const val = e.target.value;
                                field.onChange(val === '' ? 0 : parseFloat(val));
                            }}
                        />
                      </div>
                    </FormControl>
                    <FormDescription>
                      Costo fijo para envíos dentro de la zona de reparto.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end">
                <Button type="submit" disabled={saving} className="bg-slate-900 hover:bg-slate-800">
                  {saving ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Guardando...
                    </>
                  ) : (
                    <>
                        <Save className="mr-2 h-4 w-4" /> Guardar Cambios
                    </>
                  )}
                </Button>
              </div>

            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
