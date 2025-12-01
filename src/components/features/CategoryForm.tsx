'use client';

import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { toast } from 'sonner';
import { Loader2, Save } from 'lucide-react';

import { categorySchema } from '@/lib/zod';
import { createOrUpdateCategory } from '@/actions/categories';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

type FormValues = z.infer<typeof categorySchema>;

interface Props {
  initialData?: (FormValues & { id: string }) | null;
}

export function CategoryForm({ initialData }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: initialData || { name: '', slug: '' },
  });

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setLoading(true);
    const result = await createOrUpdateCategory(data, initialData?.id || null);
    
    if (result.success) {
      toast.success(initialData ? 'Categoría actualizada' : 'Categoría creada');
      router.push('/admin/categories');
      router.refresh();
    } else {
      toast.error(result.message);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-3xl font-bold text-slate-900 mb-6">
        {initialData ? 'Editar Categoría' : 'Nueva Categoría'}
      </h1>

      <Card>
        <CardHeader>
          <CardTitle>Datos Generales</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Piñatas" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slug (URL)</FormLabel>
                    <FormControl>
                      <Input placeholder="pinatas" {...field} />
                    </FormControl>
                    <FormDescription>Identificador único en la url.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={loading} className="w-full bg-slate-900 hover:bg-slate-800">
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Guardar
              </Button>

            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}