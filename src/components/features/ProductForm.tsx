'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createOrUpdateProduct } from '@/actions/product-form';
import { Product, Category, Division } from '@prisma/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Loader2, Save, ArrowLeft, DollarSign, Tag, Percent } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import ImageUpload from '@/components/ui/image-upload';

interface Props {
  product?: Product | null;
  categories: Category[];
}

export function ProductForm({ product, categories }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<string[]>(product?.images || []);
  const [isAvailable, setIsAvailable] = useState(product?.isAvailable ?? true);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    
    // Agregar imágenes manualmente al FormData
    images.forEach(img => formData.append('images', img));
    // Agregar isAvailable
    if (isAvailable) formData.set('isAvailable', 'on');

    const result = await createOrUpdateProduct(formData, product?.id);

    if (result.success) {
      toast.success(product ? 'Producto actualizado' : 'Producto creado');
      router.push('/admin/products');
      router.refresh();
    } else {
      toast.error(result.error || 'Error al guardar');
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-8 pb-10">
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* COLUMNA IZQUIERDA: Info Principal */}
        <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-4">
                <h3 className="font-bold text-lg text-slate-800 border-b pb-2 mb-4">Información General</h3>
                
                <div className="space-y-2">
                    <Label htmlFor="title">Título del Producto</Label>
                    <Input id="title" name="title" defaultValue={product?.title} required placeholder="Ej. Muñeca Barbie Playa" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="slug">Slug (URL)</Label>
                        <Input id="slug" name="slug" defaultValue={product?.slug} required placeholder="muneca-barbie-playa" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="categoryId">Categoría</Label>
                        <select 
                            id="categoryId" 
                            name="categoryId" 
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            defaultValue={product?.categoryId}
                            required
                        >
                            <option value="">Seleccionar...</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name} ({cat.division})</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="description">Descripción</Label>
                    <Textarea id="description" name="description" defaultValue={product?.description} required rows={5} />
                </div>

                {/* TAGS (NUEVO) */}
                <div className="space-y-2">
                    <Label htmlFor="tags" className="flex items-center gap-2">
                        <Tag className="h-4 w-4 text-slate-500" /> Etiquetas (Tags)
                    </Label>
                    <Input 
                        id="tags" 
                        name="tags" 
                        defaultValue={product?.tags.join(', ')} 
                        placeholder="Ej. niño, verano, superhéroe (separados por coma)" 
                    />
                    <p className="text-xs text-slate-500">Útil para agrupar productos en secciones especiales.</p>
                </div>
            </div>

            {/* PRECIOS Y OFERTAS (NUEVO) */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-4">
                <h3 className="font-bold text-lg text-slate-800 border-b pb-2 mb-4 flex items-center gap-2">
                    <DollarSign className="h-5 w-5" /> Precios y Ofertas
                </h3>

                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="price">Precio Regular (Unitario)</Label>
                        <Input type="number" id="price" name="price" defaultValue={String(product?.price || '')} required step="0.01" min="0" />
                    </div>
                    
                    {/* DESCUENTO PORCENTUAL */}
                    <div className="space-y-2">
                        <Label htmlFor="discountPercentage" className="text-pink-600 font-semibold flex items-center gap-1">
                            <Percent className="h-4 w-4" /> Descuento (%)
                        </Label>
                        <Input 
                            type="number" 
                            id="discountPercentage" 
                            name="discountPercentage" 
                            defaultValue={product?.discountPercentage || 0} 
                            min="0" 
                            max="100" 
                            className="border-pink-200 focus-visible:ring-pink-500"
                        />
                        <p className="text-xs text-slate-400">Si pones 20, se mostrará como -20% OFF.</p>
                    </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-4">
                    <h4 className="font-semibold text-sm text-slate-700">Configuración Mayorista (Opcional)</h4>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="wholesalePrice">Precio Mayorista</Label>
                            <Input 
                                type="number" 
                                id="wholesalePrice" 
                                name="wholesalePrice" 
                                defaultValue={product?.wholesalePrice ? String(product.wholesalePrice) : ''} 
                                step="0.01" 
                                min="0" 
                                placeholder="0.00"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="wholesaleMinCount">Cantidad Mínima</Label>
                            <Input 
                                type="number" 
                                id="wholesaleMinCount" 
                                name="wholesaleMinCount" 
                                defaultValue={product?.wholesaleMinCount || ''} 
                                min="1" 
                                placeholder="Ej. 6"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* COLUMNA DERECHA: Estado e Imágenes */}
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-4">
                <h3 className="font-bold text-lg text-slate-800 mb-4">Estado</h3>
                
                <div className="flex items-center justify-between">
                    <Label htmlFor="isAvailable">Disponible</Label>
                    <Switch id="isAvailable" checked={isAvailable} onCheckedChange={setIsAvailable} />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="stock">Stock Actual</Label>
                    <Input type="number" id="stock" name="stock" defaultValue={product?.stock || 0} required min="0" />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="division">División</Label>
                    <select 
                        id="division" 
                        name="division" 
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        defaultValue={product?.division || 'JUGUETERIA'}
                    >
                        <option value="JUGUETERIA">🧸 Festamas</option>
                        <option value="FIESTAS">🎉 FiestasYa</option>
                    </select>
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-4">
                <h3 className="font-bold text-lg text-slate-800 mb-4">Imágenes</h3>
                <ImageUpload 
                    value={images} 
                    onChange={(urls) => setImages(urls)}
                />
            </div>
        </div>
      </div>

      {/* FOOTER ACTIONS */}
      <div className="flex items-center justify-end gap-4 border-t pt-6">
        <Link href="/admin/products">
            <Button type="button" variant="outline" disabled={loading}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Cancelar
            </Button>
        </Link>
        <Button type="submit" className="min-w-[150px] bg-slate-900 hover:bg-slate-800" disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            {product ? 'Guardar Cambios' : 'Crear Producto'}
        </Button>
      </div>
    </form>
  );
}