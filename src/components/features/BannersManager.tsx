'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Loader2, Plus, Trash2, Link as LinkIcon, LayoutTemplate, ArrowUpDown, Palette, Pencil, Type, X, GripVertical } from 'lucide-react';
import { createBanner, updateBanner, deleteBanner, reorderBanners } from '@/actions/design';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ImageUpload from '@/components/ui/image-upload';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';

// DND Kit Imports
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const bannerSchema = z.object({
  title: z.string().min(3, "Mínimo 3 letras"),
  image: z.string().min(1, "Imagen requerida"),
  link: z.string().min(1, "Link requerido"),
  btnText: z.string().min(1, "Texto botón requerido"),
  btnColor: z.string().min(4, "Color requerido"),
  btnTextColor: z.string().min(4, "Color texto botón requerido"), // 👈 Nuevo
  textColor: z.string().min(4, "Color texto requerido"),
  position: z.enum(["TOP", "BOTTOM"]),
  size: z.enum(["GRID", "FULL", "HALF"]), // 👈 Nuevo tamaño
  order: z.coerce.number().default(0),
});

type BannerFormValues = z.infer<typeof bannerSchema>;

// --- COMPONENTE DE TARJETA SORTABLE ---
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function SortableBannerItem({ banner, onEdit, onDelete }: { banner: any, onEdit: (b: any) => void, onDelete: (id: string) => void }) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: banner.id });
    
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div ref={setNodeRef} style={style} className="relative group mb-4">
            <Card className="overflow-hidden flex flex-col md:flex-row">
                {/* Grip para arrastrar */}
                <div {...attributes} {...listeners} className="bg-slate-100 w-full md:w-10 flex items-center justify-center cursor-grab active:cursor-grabbing border-r border-b md:border-b-0">
                    <GripVertical className="text-slate-400" />
                </div>

                {/* Imagen */}
                <div className="relative h-32 w-full md:w-48 bg-slate-200 shrink-0">
                    <Image src={banner.image} alt={banner.title} fill className="object-cover" />
                </div>

                {/* Contenido */}
                <CardContent className="flex-1 p-4 flex flex-col justify-center">
                    <div className="flex justify-between items-start">
                        <div>
                            <h4 className="font-bold text-slate-900 text-lg">{banner.title}</h4>
                            <div className="flex flex-wrap gap-2 mt-2">
                                <Badge variant="outline">{banner.size}</Badge>
                                <Badge variant="secondary" style={{ backgroundColor: banner.btnColor, color: banner.btnTextColor }}>
                                    Botón: {banner.btnText}
                                </Badge>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" size="icon" onClick={() => onEdit(banner)}>
                                <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="destructive" size="icon" onClick={() => onDelete(banner.id)}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                    <div className="mt-3 text-xs text-slate-500 font-mono bg-slate-50 p-1 rounded inline-block">
                        {banner.link}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}


// --- COMPONENTE PRINCIPAL ---
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function BannersManager({ initialBanners }: { initialBanners: any[] }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Estado local para el DND (necesitamos manipular el array en caliente)
  const [banners, setBanners] = useState(initialBanners);

  // Actualizar estado si cambia la prop (ej: después de un refresh)
  useEffect(() => { setBanners(initialBanners); }, [initialBanners]);

  const defaultValues: BannerFormValues = { 
    title: '', image: '', link: '', 
    btnText: 'Ver Más', btnColor: '#000000', btnTextColor: '#FFFFFF', textColor: '#FFFFFF',
    position: 'TOP', size: 'GRID', order: 0 
  };

  const form = useForm<BannerFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(bannerSchema) as any,
    defaultValues,
    mode: "onChange"
  });

  // DND Sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Manejo del Drag End
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
        setBanners((items) => {
            const oldIndex = items.findIndex((item) => item.id === active.id);
            const newIndex = items.findIndex((item) => item.id === over.id);
            const newItems = arrayMove(items, oldIndex, newIndex);
            
            // Guardar nuevo orden en BD
            const updates = newItems.map((item, index) => ({ id: item.id, order: index }));
            reorderBanners(updates); // Fire and forget (optimista)
            
            return newItems;
        });
    }
  };

  // ... (handleEdit, handleCancel, onSubmit, handleDelete son iguales que antes, solo actualiza el reset)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleEdit = (banner: any) => {
    setEditingId(banner.id);
    form.reset({
      ...banner,
      btnTextColor: banner.btnTextColor || '#FFFFFF'
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancel = () => {
    setEditingId(null);
    form.reset(defaultValues);
  };

  const onSubmit = async (values: BannerFormValues) => {
    setIsLoading(true);
    let res;
    if (editingId) res = await updateBanner(editingId, values);
    else res = await createBanner(values);

    if (res.success) {
        toast.success(editingId ? "Banner actualizado" : "Banner creado");
        handleCancel();
        router.refresh();
    } else {
        toast.error("Ocurrió un error");
    }
    setIsLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Borrar banner?")) return;
    await deleteBanner(id);
    router.refresh();
    toast.success("Banner eliminado");
  };

  // Filtramos para las listas separadas
  const topBanners = banners.filter(b => b.position === 'TOP');
  const bottomBanners = banners.filter(b => b.position === 'BOTTOM');

  return (
    <div className="space-y-12">
      
      {/* FORMULARIO (Igual, pero con el campo nuevo btnTextColor y size HALF) */}
      <Card className={`border-2 ${editingId ? 'border-amber-400 bg-amber-50/30' : 'border-dashed bg-slate-50/50'}`}>
        <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                    {editingId ? <Pencil className="h-5 w-5 text-amber-600" /> : <Plus className="h-5 w-5" />} 
                    {editingId ? 'Editando Banner' : 'Agregar Nuevo Banner'}
                </h3>
                {editingId && <Button variant="ghost" size="sm" onClick={handleCancel}><X className="h-4 w-4 mr-2" /> Cancelar</Button>}
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    {/* ... (Campos de Imagen, Título, Link, Posición igual) ... */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <FormField control={form.control} name="image" render={({ field }) => (
                                <FormItem><FormLabel>Imagen</FormLabel><FormControl><ImageUpload value={field.value ? [field.value] : []} onChange={(url) => field.onChange(url[0])} disabled={isLoading} /></FormControl><FormMessage /></FormItem>
                            )} />
                            
                            {/* PREVIEW */}
                            <div className="p-4 rounded-lg border bg-slate-100 min-h-[100px] flex items-center justify-center relative overflow-hidden">
                                {form.watch('image') && <Image src={form.watch('image')} alt="Preview" fill className="object-cover" />}
                                <div className="relative z-10 bg-black/50 p-2 rounded text-center">
                                    <p style={{ color: form.watch('textColor') }} className="font-bold text-lg">{form.watch('title') || 'Título'}</p>
                                    <span style={{ backgroundColor: form.watch('btnColor'), color: form.watch('btnTextColor') }} className="text-xs px-2 py-1 rounded mt-1 inline-block">
                                        {form.watch('btnText') || 'Botón'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <FormField control={form.control} name="title" render={({ field }) => <FormItem><FormLabel>Título</FormLabel><Input {...field} /></FormItem>} />
                                <FormField control={form.control} name="textColor" render={({ field }) => <FormItem><FormLabel>Color Título</FormLabel><div className="flex gap-2"><input type="color" className="w-9 h-9 rounded cursor-pointer" {...field} /><Input {...field} className="flex-1" /></div></FormItem>} />
                            </div>
                            <FormField control={form.control} name="link" render={({ field }) => <FormItem><FormLabel>Link</FormLabel><Input {...field} /></FormItem>} />
                            
                            <div className="grid grid-cols-2 gap-4">
                                <FormField control={form.control} name="position" render={({ field }) => <FormItem><FormLabel>Ubicación</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="TOP">Arriba</SelectItem><SelectItem value="BOTTOM">Abajo</SelectItem></SelectContent></Select></FormItem>} />
                                <FormField control={form.control} name="size" render={({ field }) => <FormItem><FormLabel>Tamaño</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="GRID">Tarjeta (1/3)</SelectItem><SelectItem value="HALF">Mitad (1/2)</SelectItem><SelectItem value="FULL">Ancho (Full)</SelectItem></SelectContent></Select></FormItem>} />
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <FormField control={form.control} name="btnText" render={({ field }) => <FormItem className="col-span-1"><FormLabel>Texto Botón</FormLabel><Input {...field} /></FormItem>} />
                                <FormField control={form.control} name="btnColor" render={({ field }) => <FormItem className="col-span-1"><FormLabel>Fondo Btn</FormLabel><input type="color" className="w-full h-10 rounded cursor-pointer" {...field} /></FormItem>} />
                                <FormField control={form.control} name="btnTextColor" render={({ field }) => <FormItem className="col-span-1"><FormLabel>Texto Btn</FormLabel><input type="color" className="w-full h-10 rounded cursor-pointer" {...field} /></FormItem>} />
                            </div>
                            
                            <Button type="submit" className="w-full bg-slate-900" disabled={isLoading}>
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {editingId ? 'Guardar Cambios' : 'Crear Banner'}
                            </Button>
                        </div>
                    </div>
                </form>
            </Form>
        </CardContent>
      </Card>

      {/* LISTAS SEPARADAS CON DND */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        
        <div className="space-y-4">
            <h3 className="font-bold text-lg border-b pb-2 text-slate-900">🔼 Banners Superiores (TOP)</h3>
            <SortableContext items={topBanners.map(b => b.id)} strategy={verticalListSortingStrategy}>
                {topBanners.length === 0 && <p className="text-sm text-slate-400 italic">No hay banners aquí.</p>}
                {topBanners.map(banner => (
                    <SortableBannerItem key={banner.id} banner={banner} onEdit={handleEdit} onDelete={handleDelete} />
                ))}
            </SortableContext>
        </div>

        <div className="space-y-4 pt-8">
            <h3 className="font-bold text-lg border-b pb-2 text-slate-900">🔽 Banners Inferiores (BOTTOM)</h3>
            <SortableContext items={bottomBanners.map(b => b.id)} strategy={verticalListSortingStrategy}>
                {bottomBanners.length === 0 && <p className="text-sm text-slate-400 italic">No hay banners aquí.</p>}
                {bottomBanners.map(banner => (
                    <SortableBannerItem key={banner.id} banner={banner} onEdit={handleEdit} onDelete={handleDelete} />
                ))}
            </SortableContext>
        </div>

      </DndContext>
    </div>
  );
}