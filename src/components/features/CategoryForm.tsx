'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createCategory, updateCategory } from '@/actions/categories';
import { Category, Division } from '@prisma/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Save, ArrowLeft, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
// 👇 Importamos tu componente de imágenes
import ImageUpload from '@/components/ui/image-upload'; 

interface Props {
  category?: Category | null;
}

export function CategoryForm({ category }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // Estado inicial
  const [name, setName] = useState(category?.name || '');
  const [slug, setSlug] = useState(category?.slug || '');
  const [division, setDivision] = useState<Division>(category?.division || 'JUGUETERIA');
  const [image, setImage] = useState(category?.image || ''); // 👈 Estado para la imagen

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append('name', name);
    formData.append('slug', slug);
    formData.append('division', division);
    formData.append('image', image); // 👈 Enviamos la imagen

    const result = category 
      ? await updateCategory(category.id, formData)
      : await createCategory(formData);

    if (result.success) {
      toast.success(category ? 'Categoría actualizada' : 'Categoría creada');
      router.push('/admin/categories');
      router.refresh();
    } else {
      toast.error(result.error || 'Ocurrió un error');
    }
    setLoading(false);
  };

  // Generar slug automático al escribir el nombre
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    if (!category) { // Solo auto-generar si es nuevo
        setSlug(val.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl bg-white p-6 rounded-xl shadow-sm border border-slate-200">
      
      <div className="space-y-6">
        
        {/* IMAGEN DE LA CATEGORÍA (NUEVO) */}
        <div className="space-y-2">
            <Label>Imagen de Portada (Opcional)</Label>
            <div className="bg-slate-50 p-4 rounded-lg border border-dashed border-slate-300">
                <ImageUpload 
                    value={image ? [image] : []}
                    disabled={loading}
                    onChange={(urlArray) => setImage(urlArray[0] || '')}
                />
                <p className="text-xs text-slate-400 mt-2 text-center">
                    Recomendado: Imagen cuadrada (500x500px) o rectangular pequeña.
                </p>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
            <Label htmlFor="name">Nombre</Label>
            <Input 
                id="name" 
                placeholder="Ej. Bloques de Construcción" 
                value={name}
                onChange={handleNameChange}
                required
            />
            </div>

            <div className="space-y-2">
            <Label htmlFor="slug">Slug (URL)</Label>
            <Input 
                id="slug" 
                placeholder="bloques-construccion" 
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                required
            />
            </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="division">División (Tienda)</Label>
          <select
            id="division"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            value={division}
            onChange={(e) => setDivision(e.target.value as Division)}
          >
            <option value="JUGUETERIA">🧸 Festamas (Juguetería)</option>
            <option value="FIESTAS">🎉 FiestasYa (Decoración)</option>
          </select>
        </div>

      </div>

      <div className="mt-8 flex items-center justify-end gap-4">
        <Link href="/admin/categories">
            <Button type="button" variant="outline" disabled={loading}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Cancelar
            </Button>
        </Link>
        <Button type="submit" className="min-w-[150px]" disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            {category ? 'Guardar Cambios' : 'Crear Categoría'}
        </Button>
      </div>
    </form>
  );
}