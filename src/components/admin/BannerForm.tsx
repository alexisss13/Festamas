'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createBanner, updateBanner } from '@/actions/banners';
import { BannerPosition } from '@prisma/client';
import { toast } from 'sonner';
import { Type, Link as LinkIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { BannerFormHeader } from './banner-form/BannerFormHeader';
import { BannerImagesSection } from './banner-form/BannerImagesSection';
import { Button } from '@/components/ui/button';
import { Loader2, Save, LayoutGrid, Rows3, Image as ImageIcon } from 'lucide-react';

interface BannerData {
    id?: string;
    title: string;
    subtitle?: string | null;
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
    const brandButtonClass = "bg-primary hover:bg-primary/90";

    // Convertir URLs a public_ids si es necesario
    const extractPublicId = (url: string): string => {
        if (!url || url.trim() === '') return '';
        if (!url.includes('res.cloudinary.com')) return url;
        
        try {
            const parts = url.split('/upload/');
            if (parts.length < 2) return url;
            
            const pathAfterUpload = parts[1];
            const pathParts = pathAfterUpload.split('/');
            const withoutVersion = pathParts.filter(part => !part.startsWith('v') || part.length < 10);
            return withoutVersion.join('/').split('.')[0];
        } catch {
            return url;
        }
    };
    
    // --- ESTADOS ---
    const [title, setTitle] = useState(banner?.title || '');
    const [subtitle, setSubtitle] = useState(banner?.subtitle || '');
    const [link, setLink] = useState(banner?.link || '');
    const [imageUrl, setImageUrl] = useState(extractPublicId(banner?.imageUrl || ''));
    const [mobileUrl, setMobileUrl] = useState(extractPublicId(banner?.mobileUrl || ''));
    const [position, setPosition] = useState<BannerPosition>(banner?.position || 'TOP_BAR');

    // --- SNAPSHOT INICIAL ---
    const [initialData, setInitialData] = useState({
        title: banner?.title || '',
        subtitle: banner?.subtitle || '',
        link: banner?.link || '',
        imageUrl: extractPublicId(banner?.imageUrl || ''),
        mobileUrl: extractPublicId(banner?.mobileUrl || ''),
        position: banner?.position || 'TOP_BAR',
    });
    
    const isDirty = 
        title !== initialData.title || 
        subtitle !== initialData.subtitle ||
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
        
        if (!title) {
             toast.error("El título es obligatorio");
             return;
        }

        if (!imageUrl) {
            toast.error("La imagen desktop es obligatoria");
            return;
        }

        setLoading(true);

        const dataToSend = {
            title,
            subtitle: subtitle || undefined,
            imageUrl,
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
            if (window.confirm('¿Descartar cambios y salir?')) router.push('/admin/banners');
        } else {
            router.push('/admin/banners');
        }
    };

    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <BannerFormHeader isEditing={!!banner} isDirty={isDirty} />

            {/* Contenido Principal */}
            <form onSubmit={handleSubmit} className="max-w-7xl mx-auto px-6 py-8">
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                    
                    {/* PANEL IZQUIERDO: Configuración (8 columnas) */}
                    <div className="xl:col-span-8 space-y-6">
                        
                        {/* Sección Unificada: Configuración del Banner */}
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="border-b border-slate-100 bg-slate-50/50 px-5 py-4 flex items-center gap-2">
                                <Type className="h-4 w-4 text-primary" />
                                <h2 className="font-semibold text-slate-800 text-sm">Configuración del Banner</h2>
                            </div>
                            <div className="p-5">
                                
                                {/* Grid 2 columnas para campos de texto */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                                    
                                    {/* TÍTULO */}
                                    <div className="flex flex-col gap-2">
                                        <Label htmlFor="title" className="text-[13px] font-medium text-slate-500">
                                            Título Principal
                                        </Label>
                                        <Input 
                                            id="title" 
                                            placeholder="Ej: ¡Verano de Locura!"
                                            value={title} 
                                            onChange={(e) => setTitle(e.target.value)} 
                                            className={cn(
                                                "h-10 !bg-white transition-all",
                                                "focus:ring-2 focus:ring-slate-200 focus:ring-offset-0 focus:border-slate-300",
                                                "focus-visible:ring-2 focus-visible:ring-slate-200 focus-visible:ring-offset-0 focus-visible:border-slate-300",
                                                title ? "border-slate-300 shadow-sm" : "border-slate-200"
                                            )}
                                        />
                                    </div>

                                    {/* ENLACE */}
                                    <div className="flex flex-col gap-2">
                                        <Label htmlFor="link" className="text-[13px] font-medium text-slate-500">
                                            Enlace del Botón
                                        </Label>
                                        <div className="relative">
                                            <LinkIcon className={cn(
                                                "absolute left-3 top-2.5 h-4 w-4 transition-colors",
                                                link ? "text-slate-600" : "text-slate-400"
                                            )} />
                                            <Input 
                                                id="link" 
                                                value={link} 
                                                onChange={(e) => setLink(e.target.value)} 
                                                className={cn(
                                                    "h-10 pl-9 !bg-white transition-all",
                                                    "focus:ring-2 focus:ring-slate-200 focus:ring-offset-0 focus:border-slate-300",
                                                    "focus-visible:ring-2 focus-visible:ring-slate-200 focus-visible:ring-offset-0 focus-visible:border-slate-300",
                                                    link ? "border-slate-300 shadow-sm" : "border-slate-200"
                                                )}
                                                placeholder="/category/juguetes" 
                                            />
                                        </div>
                                    </div>

                                    {/* SUBTÍTULO - Ocupa 2 columnas */}
                                    <div className="flex flex-col gap-2 md:col-span-2">
                                        <Label htmlFor="subtitle" className="text-[13px] font-medium text-slate-500">
                                            Subtítulo <span className="text-xs text-slate-400 font-normal">(Opcional)</span>
                                        </Label>
                                        <Textarea 
                                            id="subtitle" 
                                            placeholder="Ej: Descuentos de hasta el 50% en toda la tienda..."
                                            value={subtitle} 
                                            onChange={(e) => setSubtitle(e.target.value)} 
                                            className={cn(
                                                "min-h-[80px] resize-none !bg-white transition-all",
                                                "focus:ring-2 focus:ring-slate-200 focus:ring-offset-0 focus:border-slate-300",
                                                "focus-visible:ring-2 focus-visible:ring-slate-200 focus-visible:ring-offset-0 focus-visible:border-slate-300",
                                                subtitle ? "border-slate-300 shadow-sm" : "border-slate-200"
                                            )}
                                        />
                                    </div>
                                    
                                </div>
                                
                            </div>
                        </div>

                        {/* Sección: Recursos Visuales */}
                        <BannerImagesSection
                            imageUrl={imageUrl}
                            mobileUrl={mobileUrl}
                            position={position}
                            loading={loading}
                            onImageUrlChange={setImageUrl}
                            onMobileUrlChange={setMobileUrl}
                        />

                    </div>

                    {/* PANEL DERECHO: Ubicación (4 columnas, Sticky) */}
                    <div className="xl:col-span-4 relative">
                        <div className="sticky top-6">
                            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                                <div className="border-b border-slate-100 bg-slate-50/50 px-5 py-4 flex items-center gap-2">
                                    <LayoutGrid className="h-4 w-4 text-primary" />
                                    <h2 className="font-semibold text-slate-800 text-sm">Ubicación</h2>
                                </div>
                                <div className="p-5 space-y-4">
                                    
                                    <div className="text-xs text-slate-500 mb-3">
                                        Selecciona dónde se mostrará este banner
                                    </div>
                                    
                                    {/* Opciones */}
                                    <div className="space-y-3">
                                        {[
                                            { 
                                                value: 'TOP_BAR' as BannerPosition, 
                                                label: 'Cintillo Superior',
                                                desc: 'Barra fija en la parte superior',
                                                Icon: Rows3
                                            },
                                            { 
                                                value: 'MAIN_HERO' as BannerPosition, 
                                                label: 'Hero Principal',
                                                desc: 'Banner destacado tipo carrusel',
                                                Icon: ImageIcon
                                            }
                                        ].map((option) => {
                                            const Icon = option.Icon;
                                            return (
                                                <button
                                                    key={option.value}
                                                    type="button"
                                                    onClick={() => setPosition(option.value)}
                                                    className={cn(
                                                        "w-full p-4 rounded-lg border transition-all text-left bg-white",
                                                        position === option.value
                                                            ? "border-primary/30" 
                                                            : "border-slate-200 hover:border-slate-300"
                                                    )}
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <Icon className={cn(
                                                            "w-5 h-5 shrink-0",
                                                            position === option.value ? "text-primary" : "text-slate-400"
                                                        )} />
                                                        <div className="flex-1 min-w-0">
                                                            <div className="text-sm font-medium text-slate-900 truncate">
                                                                {option.label}
                                                            </div>
                                                            <div className="text-xs text-slate-500 truncate">
                                                                {option.desc}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                    
                                    {/* Botones */}
                                    <div className="pt-4 flex gap-2">
                                        <Button 
                                            type="button" 
                                            variant="outline" 
                                            onClick={handleCancel} 
                                            disabled={loading}
                                            className="flex-1 h-11"
                                        >
                                            Cancelar
                                        </Button>
                                        <Button 
                                            type="submit" 
                                            className={cn("flex-1 text-white h-11", brandButtonClass)} 
                                            disabled={loading}
                                        >
                                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                            Guardar
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </form>
        </div>
    );
}
