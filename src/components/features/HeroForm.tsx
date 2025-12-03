'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Loader2, Save, Image as ImageIcon, Link as LinkIcon, Type, Palette } from 'lucide-react';
import { updateHeroConfig } from '@/actions/design';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import ImageUpload from '@/components/ui/image-upload';

const formSchema = z.object({
  heroImage: z.string().optional(),
  heroTitle: z.string().min(1, "Requerido"),
  heroSubtitle: z.string().optional(),
  heroButtonText: z.string().optional(),
  heroButtonLink: z.string().optional(),
  heroBtnColor: z.string().optional(),
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function HeroForm({ initialData }: { initialData: any }) {
  const [saving, setSaving] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      heroImage: initialData?.heroImage || '',
      heroTitle: initialData?.heroTitle || 'Celebra a lo Grande',
      heroSubtitle: initialData?.heroSubtitle || '',
      heroButtonText: initialData?.heroButtonText || 'Ver Productos',
      heroButtonLink: initialData?.heroButtonLink || '#catalogo',
      heroBtnColor: initialData?.heroBtnColor || '#fb3099',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setSaving(true);
    const res = await updateHeroConfig(values);
    if (res.success) toast.success(res.message);
    else toast.error(res.message);
    setSaving(false);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        
        <FormField
          control={form.control}
          name="heroImage"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2"><ImageIcon className="h-4 w-4"/> Imagen de Fondo</FormLabel>
              <FormControl>
                <ImageUpload 
                    value={field.value ? [field.value] : []} 
                    onChange={(url) => field.onChange(url[0])}
                    disabled={saving}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
            control={form.control}
            name="heroTitle"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Título Principal</FormLabel>
                <FormControl><Input {...field} /></FormControl>
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="heroSubtitle"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Subtítulo</FormLabel>
                <FormControl><Input {...field} /></FormControl>
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="heroButtonText"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Texto del Botón</FormLabel>
                <FormControl><Input {...field} /></FormControl>
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="heroButtonLink"
            render={({ field }) => (
                <FormItem>
                <FormLabel className="flex items-center gap-2"><LinkIcon className="h-4 w-4"/> Enlace (ID o URL)</FormLabel>
                <FormControl><Input placeholder="#catalogo" {...field} /></FormControl>
                </FormItem>
            )}
            />
            
            {/* COLOR PICKER */}
            <FormField
            control={form.control}
            name="heroBtnColor"
            render={({ field }) => (
                <FormItem>
                <FormLabel className="flex items-center gap-2"><Palette className="h-4 w-4"/> Color del Botón</FormLabel>
                <div className="flex gap-2">
                    <div className="w-10 h-10 rounded border overflow-hidden relative">
                        <input type="color" className="absolute -top-2 -left-2 w-16 h-16 cursor-pointer" {...field} />
                    </div>
                    <Input {...field} className="flex-1" placeholder="#000000" />
                </div>
                </FormItem>
            )}
            />
        </div>

        <Button type="submit" disabled={saving} className="bg-slate-900 hover:bg-slate-800">
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Guardar Portada
        </Button>
      </form>
    </Form>
  );
}