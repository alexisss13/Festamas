'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createCatalog, updateCatalog } from '@/actions/catalogs';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Loader2, Save, BookOpen, Link as LinkIcon, Info } from 'lucide-react';
import { toast } from 'sonner';
import ImageUpload from '@/components/ui/image-upload'; 
import { cn } from '@/lib/utils';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function CatalogForm({ catalog, defaultBranchId, activeBranch }: { catalog?: any | null, defaultBranchId?: string, activeBranch?: any }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    
    const branchId = catalog?.branchId || defaultBranchId;

    const brandFocusClass = "focus-visible:ring-primary";
    const brandTextClass = "text-primary";
    const brandButtonClass = "bg-primary hover:bg-primary/90";

    // Función para extraer public_id de URLs
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
    const [title, setTitle] = useState(catalog?.title || '');
    const [iframeUrl, setIframeUrl] = useState(catalog?.iframeUrl || '');
    const [coverImage, setCoverImage] = useState(extractPublicId(catalog?.coverImage || ''));
    const [isActive, setIsActive] = useState<boolean>(catalog?.isActive ?? true);

    // --- SNAPSHOT INICIAL ---
    const [initialData, setInitialData] = useState({
        title: catalog?.title || '',
        iframeUrl: catalog?.iframeUrl || '',
        coverImage: extractPublicId(catalog?.coverImage || ''),
        branchId: catalog?.branchId || defaultBranchId,
        isActive: catalog?.isActive ?? true,
    });
    
    const isDirty = 
        title !== initialData.title || 
        iframeUrl !== initialData.iframeUrl ||
        coverImage !== initialData.coverImage ||
        isActive !== initialData.isActive;

    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (isDirty) { e.preventDefault(); e.returnValue = ''; }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [isDirty]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!title) {
            toast.error("El título es obligatorio.");
            return;
        }

        if (!coverImage) {
            toast.error("La imagen de portada es obligatoria.");
            return;
        }

        if (!iframeUrl) {
            toast.error("El enlace (iframe) es obligatorio.");
            return;
        }

        setLoading(true);

        const dataToSend = {
            title,
            iframeUrl,
            coverImage,
            branchId,
            isActive
        };

        let result;
        if (catalog?.id) {
            result = await updateCatalog(catalog.id, dataToSend);
        } else {
            result = await createCatalog(dataToSend);
        }

        if (result.success) {
            toast.success(catalog ? 'Catálogo actualizado' : 'Catálogo creado');
            setInitialData({ title, iframeUrl, coverImage, branchId, isActive });
            router.push('/admin/catalogs');
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
        <form onSubmit={handleSubmit} className="w-full max-w-[1000px] space-y-8 pb-20 animate-in fade-in duration-500">
            {/* HEADER */}
            <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-200 pb-4 gap-4">
                <div>
                    <h2 className="text-xl md:text-2xl font-bold text-slate-900 flex flex-wrap items-center gap-2">
                        {catalog ? 'Editar Catálogo' : 'Nuevo Catálogo'}
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
                {/* CONFIGURACIÓN (IZQUIERDA) */}
                <div className="lg:col-span-7 space-y-6">
                     <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <Info className="w-4 h-4 text-slate-500" /> Información del Catálogo
                        </h3>
                        
                        <div className="space-y-5">
                            {/* TÍTULO */}
                            <div className="space-y-2">
                                <Label htmlFor="title" className="flex items-center justify-between">
                                    Título <span className="text-xs text-slate-400 font-normal">Requerido</span>
                                </Label>
                                <Input 
                                    id="title" 
                                    placeholder="Ej: Catálogo Escolar 2024"
                                    value={title} 
                                    onChange={(e) => setTitle(e.target.value)} 
                                    className={brandFocusClass} 
                                />
                            </div>

                            {/* ENLACE IFRAME */}
                            <div className="space-y-2">
                                <Label htmlFor="iframeUrl" className="flex items-center justify-between">
                                    Enlace (Flipsnack / Heyzine) <span className="text-xs text-slate-400 font-normal">Requerido</span>
                                </Label>
                                <div className="relative">
                                    <LinkIcon className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                    <Input 
                                        id="iframeUrl" 
                                        value={iframeUrl} 
                                        onChange={(e) => setIframeUrl(e.target.value)} 
                                        className={`pl-9 ${brandFocusClass}`} 
                                        placeholder="https://heyzine.com/flip-book/..." 
                                    />
                                </div>
                                <p className="text-xs text-slate-500 mt-1">
                                    Pega la URL pública de tu catálogo interactivo.
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">

                                {/* ESTADO */}
                                <div className="space-y-2 flex flex-col justify-center">
                                    <Label htmlFor="isActive" className="mb-2">Estado</Label>
                                    <div className="flex items-center space-x-2">
                                        <Switch 
                                            id="isActive" 
                                            checked={isActive} 
                                            onCheckedChange={setIsActive} 
                                        />
                                        <Label htmlFor="isActive" className="text-sm text-slate-600 font-normal cursor-pointer">
                                            {isActive ? 'Activo (Visible en tienda)' : 'Inactivo (Oculto)'}
                                        </Label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* IMÁGENES (DERECHA) */}
                <div className="lg:col-span-5 space-y-6">
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-slate-900 flex items-center gap-2">
                                <BookOpen className="w-4 h-4 text-slate-500" /> Portada del Catálogo
                            </h3>
                            <span className="text-xs bg-slate-100 px-2 py-1 rounded text-red-600">Requerido</span>
                        </div>
                        <p className="text-sm text-slate-500 mb-4">
                            Sube una imagen de buena calidad que represente tu catálogo. Se mostrará en la grilla de catálogos en la tienda.
                        </p>
                        <ImageUpload 
                            value={coverImage ? [coverImage] : []}
                            onChange={(urls) => setCoverImage(urls[0] || '')}
                            disabled={loading}
                            maxFiles={1} 
                        />
                    </div>
                </div>

            </div>
        </form>
    );
}
