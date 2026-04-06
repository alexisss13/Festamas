'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createBanner, updateBanner } from '@/actions/banners';
import { BannerPosition } from '@prisma/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea'; // 👈 Usaremos Textarea para el subtítulo
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Save, Monitor, Smartphone, Link as LinkIcon, LayoutTemplate, Type } from 'lucide-react';
import { toast } from 'sonner';
import ImageUpload from '@/components/ui/image-upload'; 
import { cn } from '@/lib/utils';

interface BannerData {
    id?: string;
    title: string;
    subtitle?: string | null; // 👈 Agregado
    imageUrl: string;
    mobileUrl?: string | null;
    link?: string | null;
    position: BannerPosition;
    branchId?: string | null;
}

interface Props {
    banner?: BannerData | null;
    activeBranch?: any;
}

export function BannerForm({ banner, activeBranch }: Props) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const brandFocusClass = "focus-visible:ring-primary";
    const brandTextClass = "text-primary";
    const brandButtonClass = "bg-primary hover:bg-primary/90";

    // --- ESTADOS ---
    const [title, setTitle] = useState(banner?.title || '');
    const [subtitle, setSubtitle] = useState(banner?.subtitle || ''); // 👈 Estado Subtítulo
    const [link, setLink] = useState(banner?.link || '');
    const [imageUrl, setImageUrl] = useState(banner?.imageUrl || '');
    const [mobileUrl, setMobileUrl] = useState(banner?.mobileUrl || '');
    const [position, setPosition] = useState<BannerPosition>(banner?.position || 'MAIN_HERO');

    // --- SNAPSHOT INICIAL ---
    const [initialData, setInitialData] = useState({
        title: banner?.title || '',
        subtitle: banner?.subtitle || '', // 👈 Snapshot Subtítulo
        link: banner?.link || '',
        imageUrl: banner?.imageUrl || '',
        mobileUrl: banner?.mobileUrl || '',
        position: banner?.position || 'MAIN_HERO',
    });
    
    const isDirty = 
        title !== initialData.title || 
        subtitle !== initialData.subtitle || // 👈 Check Subtítulo
        link !== initialData.link || 
        imageUrl !== initialData.imageUrl ||
        mobileUrl !== initialData.mobileUrl ||
        position !== initialData.position;

    // Protección contra cierre accidental
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (isDirty) { e.preventDefault(); e.returnValue = ''; }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [isDirty]);

    useEffect(() => {
        if (!isDirty) return;
        const handleAnchorClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            const anchor = target.closest('a');
            if (anchor && anchor.target !== '_blank') {
                if (!window.confirm('Tienes cambios sin guardar. ¿Seguro que quieres salir?')) {
                    e.preventDefault(); e.stopPropagation();
                }
            }
        };
        document.addEventListener('click', handleAnchorClick, true);
        return () => document.removeEventListener('click', handleAnchorClick, true);
    }, [isDirty]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validación básica (El resto es opcional para el diseño generativo)
        if (!title) {
             toast.error("El título es obligatorio para el SEO y diseño.");
             return;
        }

        // NOTA: Ya no obligamos imageUrl porque el diseño generativo lo permite vacío.
        // Pero si quieres obligarlo para Main Hero, descomenta esto:
        /* if (position === 'MAIN_HERO' && !imageUrl) {
             toast.error("La imagen es obligatoria para el Hero Principal");
             return;
        } 
        */

        setLoading(true);

        const dataToSend = {
            title,
            subtitle: subtitle || undefined, // 👈 Enviar subtítulo
            imageUrl: imageUrl || '',        // Permitimos string vacío
            mobileUrl: mobileUrl || undefined,
            link: link || undefined,
            position,
            branchId: activeBranch?.id
        };

        let result;
        if (banner?.id) {
            result = await updateBanner(banner.id, dataToSend);
        } else {
            result = await createBanner(dataToSend);
        }

        if (result.success) {
            toast.success(banner ? 'Banner actualizado' : 'Banner creado');
            setInitialData({ title, subtitle, link, imageUrl, mobileUrl, position });
            router.push('/admin/banners');
            router.refresh();
        } else {
            toast.error(result.error || 'Error al guardar');
        }
        setLoading(false);
    };

    const handleCancel = () => {
        if (isDirty) {
            if (window.confirm('¿Descartar cambios y salir?')) router.back();
        } else {
            router.back();
        }
    };

    return (
        <form onSubmit={handleSubmit} className="w-full max-w-[1200px] space-y-8 pb-20 animate-in fade-in duration-500">
            
            {/* HEADER */}
            <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-200 pb-4 gap-4">
                <div>
                    <h2 className="text-xl md:text-2xl font-bold text-slate-900 flex flex-wrap items-center gap-2">
                        {banner ? 'Editar Banner' : 'Nuevo Banner'}
                        <span className={cn("text-xs px-2 py-1 rounded-md bg-slate-100 uppercase font-extrabold tracking-wide", brandTextClass)}>
                            {activeBranch?.name || 'Tienda'}
                        </span>
                        {isDirty && (
                            <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-full border border-amber-200 font-medium flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"/> Sin guardar
                            </span>
                        )}
                    </h2>
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                    <Button type="button" variant="outline" onClick={handleCancel} disabled={loading} className="flex-1 md:flex-none">
                        Cancelar
                    </Button>
                    <Button type="submit" className={cn("text-white flex-1 md:flex-none min-w-[140px]", brandButtonClass)} disabled={loading}>
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        Guardar
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* CONFIGURACIÓN (IZQUIERDA) - Cambié el orden para priorizar contenido */}
                <div className="lg:col-span-5 space-y-6">
                     <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <LayoutTemplate className="w-4 h-4 text-slate-500" /> Contenido
                        </h3>
                        
                        <div className="space-y-5">
                            {/* TÍTULO */}
                            <div className="space-y-2">
                                <Label htmlFor="title" className="flex items-center justify-between">
                                    Título Principal <span className="text-xs text-slate-400 font-normal">Requerido</span>
                                </Label>
                                <Input 
                                    id="title" 
                                    placeholder="Ej: ¡Verano de Locura!"
                                    value={title} 
                                    onChange={(e) => setTitle(e.target.value)} 
                                    className={brandFocusClass} 
                                />
                            </div>

                            {/* SUBTÍTULO (NUEVO) */}
                            <div className="space-y-2">
                                <Label htmlFor="subtitle" className="flex items-center gap-2">
                                    Subtítulo <span className="text-xs text-slate-400 font-normal">(Opcional)</span>
                                </Label>
                                <Textarea 
                                    id="subtitle" 
                                    placeholder="Ej: Descuentos de hasta el 50% en toda la tienda..."
                                    value={subtitle} 
                                    onChange={(e) => setSubtitle(e.target.value)} 
                                    className={cn("min-h-[80px] resize-none", brandFocusClass)} 
                                />
                                <p className="text-xs text-slate-500">
                                    Este texto aparecerá debajo del título en el banner.
                                </p>
                            </div>

                            {/* ENLACE */}
                            <div className="space-y-2">
                                <Label htmlFor="link">Enlace del Botón</Label>
                                <div className="relative">
                                    <LinkIcon className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                    <Input 
                                        id="link" 
                                        value={link} 
                                        onChange={(e) => setLink(e.target.value)} 
                                        className={`pl-9 ${brandFocusClass}`} 
                                        placeholder="/category/juguetes" 
                                    />
                                </div>
                            </div>

                            {/* POSICIÓN */}
                            <div className="space-y-2">
                                <Label htmlFor="position">Ubicación</Label>
                                <Select value={position} onValueChange={(val) => setPosition(val as BannerPosition)}>
                                    <SelectTrigger className={brandFocusClass}><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="MAIN_HERO">Hero Principal (Grande)</SelectItem>
                                        {/* TOP_STRIP ELIMINADO */}
                                        <SelectItem value="MIDDLE_SECTION">Sección Media (Bloque)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="p-3 bg-slate-50 border rounded-md text-sm text-slate-500 flex justify-between items-center">
                                <span>Tienda: <strong>{activeBranch?.name || 'Tienda'}</strong></span>
                                <div className={cn("w-2 h-2 rounded-full bg-primary")} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* IMÁGENES (DERECHA) */}
                <div className="lg:col-span-7 space-y-6">
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-slate-900 flex items-center gap-2">
                                <Monitor className="w-4 h-4 text-slate-500" /> Imagen Principal (PNG Transparente)
                            </h3>
                            <span className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-600">Recomendado</span>
                        </div>
                        <p className="text-sm text-slate-500 mb-4">
                            Para el diseño "Smart Hero", sube una imagen <strong>PNG sin fondo</strong> (ej: un juguete flotando). Si no subes nada, se generará una ilustración automática.
                        </p>
                        <ImageUpload 
                            value={imageUrl ? [imageUrl] : []}
                            onChange={(urls) => setImageUrl(urls[0] || '')}
                            disabled={loading}
                            maxFiles={1} 
                            sizing="banner" 
                        />
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm opacity-60 hover:opacity-100 transition-opacity">
                        <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <Smartphone className="w-4 h-4 text-slate-500" /> Imagen Móvil (Opcional)
                        </h3>
                        <ImageUpload 
                            value={mobileUrl ? [mobileUrl] : []}
                            disabled={loading}
                            onChange={(url) => setMobileUrl(url[0] || '')}
                            maxFiles={1}
                            sizing="mobile"
                        />
                    </div>
                </div>

            </div>
        </form>
    );
}