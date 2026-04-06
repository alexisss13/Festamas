'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import cloudinaryLoader from '@/lib/cloudinaryLoader';
import { useRouter } from 'next/navigation';
import { 
  DndContext, 
  closestCenter, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors, 
  DragEndEvent 
} from '@dnd-kit/core';
import { 
  arrayMove, 
  SortableContext, 
  sortableKeyboardCoordinates, 
  useSortable, 
  rectSortingStrategy 
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { reorderBanners, deleteBanner } from '@/actions/banners';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Pencil, Trash2, GripVertical, Smartphone, Monitor, Link as LinkIcon, Image as ImageIcon, GalleryHorizontal, Layers } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { BannerPosition } from '@prisma/client';

// --- ITEM INDIVIDUAL ---
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function SortableBannerItem({ banner, onDelete }: { banner: any, onDelete: (id: string) => void }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: banner.id });
    
    // Estado para alternar visualización (Desktop vs Mobile)
    const [showMobile, setShowMobile] = useState(false);
    const hasMobileVersion = !!banner.mobileUrl;

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
        zIndex: isDragging ? 50 : 'auto',
    };

    // Función para extraer public_id
    const getPublicId = (url: string): string => {
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

    // Determinar qué imagen mostrar
    const currentImage = (showMobile && hasMobileVersion) ? getPublicId(banner.mobileUrl) : getPublicId(banner.imageUrl);
    const isShowingMobile = showMobile && hasMobileVersion;

    return (
        <div ref={setNodeRef} style={style} className="relative group h-full">
            <Card className={cn(
                "overflow-hidden border-slate-200 shadow-sm hover:shadow-md transition-all h-full flex flex-col",
                isDragging ? "ring-2 ring-slate-400 rotate-2" : "group-hover:border-slate-300"
            )}>
                {/* ZONA DE IMAGEN Y DRAG */}
                <div className="relative aspect-[3/1] w-full bg-slate-100 border-b border-slate-100 group-drag">
                     {currentImage && (
                         <Image 
                            loader={cloudinaryLoader}
                            src={currentImage} 
                            alt={banner.title} 
                            fill 
                            className={cn(
                                "object-cover transition-opacity duration-300",
                                isShowingMobile ? "object-contain bg-slate-900" : "object-cover"
                            )}
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                         />
                     )}
                     
                     {/* Overlay para Drag (Solo en Desktop mode para no tapar móvil) */}
                     {!isShowingMobile && (
                         <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
                     )}
                     
                     {/* GRIP para arrastrar */}
                     <div {...attributes} {...listeners} className="absolute top-2 left-2 p-1.5 bg-white/90 rounded cursor-grab active:cursor-grabbing hover:bg-white shadow-sm z-10 opacity-0 group-hover:opacity-100 transition-opacity touch-none">
                        <GripVertical className="w-4 h-4 text-slate-600" />
                     </div>

                     {/* Badge de "Viendo Móvil" */}
                     {isShowingMobile && (
                        <Badge variant="secondary" className="absolute top-2 right-2 bg-black/70 text-white backdrop-blur-sm border-none text-[10px]">
                            Vista Móvil
                        </Badge>
                     )}
                </div>

                <CardContent className="p-3 flex flex-col gap-2 flex-1 justify-between">
                    <div>
                        <h4 className="font-semibold text-slate-800 text-xs md:text-sm line-clamp-1" title={banner.title}>
                            {banner.title}
                        </h4>
                        {banner.link && (
                             <div className="flex items-center gap-1 mt-1 text-slate-400 text-[10px] truncate">
                                <LinkIcon className="w-3 h-3 shrink-0" /> {banner.link}
                             </div>
                        )}
                    </div>
                    
                    <div className="flex items-center justify-between pt-2 border-t border-slate-50 mt-1">
                        {/* CONTROLES DE VISTA (CLICKABLES) */}
                        <div className="flex gap-1 bg-slate-50 p-0.5 rounded-md border border-slate-100">
                             <button 
                                type="button"
                                onClick={() => setShowMobile(false)}
                                title="Ver Desktop"
                                className={cn(
                                    "p-1 rounded transition-colors hover:bg-white hover:shadow-sm",
                                    !showMobile ? "bg-white shadow-sm text-blue-600" : "text-slate-400"
                                )}
                             >
                                <Monitor className="w-3.5 h-3.5" />
                             </button>

                             <button 
                                type="button"
                                onClick={() => hasMobileVersion && setShowMobile(true)}
                                disabled={!hasMobileVersion}
                                title={hasMobileVersion ? "Ver Móvil" : "Sin versión móvil"}
                                className={cn(
                                    "p-1 rounded transition-colors hover:bg-white hover:shadow-sm",
                                    isShowingMobile ? "bg-white shadow-sm text-emerald-600" : "text-slate-400",
                                    !hasMobileVersion && "opacity-50 cursor-not-allowed hover:bg-transparent hover:shadow-none"
                                )}
                             >
                                <Smartphone className="w-3.5 h-3.5" />
                             </button>
                        </div>

                        <div className="flex gap-1">
                            <Button variant="ghost" size="icon" asChild className="h-7 w-7 text-slate-500 hover:text-slate-900 hover:bg-slate-100">
                                <Link href={`/admin/banners/${banner.id}`}>
                                    <Pencil className="h-3.5 w-3.5" />
                                </Link>
                            </Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-red-600 hover:bg-red-50" onClick={() => onDelete(banner.id)}>
                                <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

// --- SUB-LISTA POR SECCIÓN ---
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function BannerSectionGroup({ dndId, title, icon: Icon, banners, onReorder, onDelete }: { dndId: string, title: string, icon: any, banners: any[], onReorder: (items: any[]) => void, onDelete: (id: string) => void }) {
    
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            const oldIndex = banners.findIndex((item) => item.id === active.id);
            const newIndex = banners.findIndex((item) => item.id === over.id);
            const newItems = arrayMove(banners, oldIndex, newIndex);
            onReorder(newItems);
        }
    };

    if (banners.length === 0) return null;

    return (
        <div className="space-y-4 mb-8">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                <div className="p-1.5 bg-slate-100 rounded text-slate-600"><Icon className="w-4 h-4" /></div>
                <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wide">{title}</h3>
                <Badge variant="secondary" className="ml-auto text-xs">{banners.length}</Badge>
            </div>
            
            {/* 🛡️ FIX HYDRATION: Pasamos un 'id' único a DndContext */}
            <DndContext id={dndId} sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={banners.map(b => b.id)} strategy={rectSortingStrategy}>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {banners.map(banner => (
                            <SortableBannerItem key={banner.id} banner={banner} onDelete={onDelete} />
                        ))}
                    </div>
                </SortableContext>
            </DndContext>
        </div>
    );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function BannerList({ initialBanners, activeBranch }: { initialBanners: any[], activeBranch: any }) {
    const router = useRouter();
    const [banners, setBanners] = useState(initialBanners);

    useEffect(() => { 
        const sorted = [...initialBanners].sort((a, b) => (a.order || 0) - (b.order || 0));
        setBanners(sorted); 
    }, [initialBanners]);

    const handleReorder = async (newSectionItems: any[], position: BannerPosition) => {
        const otherItems = banners.filter(b => b.position !== position);
        const newTotalState = [...otherItems, ...newSectionItems];
        setBanners(newTotalState); 

        const updates = newSectionItems.map((item, index) => ({ id: item.id, order: index }));
        await reorderBanners(updates);
        router.refresh();
    };

    const handleDelete = async (id: string) => {
        if (!confirm("¿Eliminar banner?")) return;
        await deleteBanner(id);
        router.refresh();
        toast.success("Banner eliminado");
    };

    // Filtrado y Ordenado (SOLO MAIN_HERO y MIDDLE_SECTION)
    const heroBanners = banners.filter(b => (b.branchId === activeBranch?.id || !b.branchId) && b.position === 'MAIN_HERO').sort((a,b) => a.order - b.order);
    const middleBanners = banners.filter(b => (b.branchId === activeBranch?.id || !b.branchId) && b.position === 'MIDDLE_SECTION').sort((a,b) => a.order - b.order);

    if (banners.filter(b => b.branchId === activeBranch?.id || !b.branchId).length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-dashed border-slate-200 text-center animate-in fade-in">
                <div className="p-4 bg-slate-50 rounded-full mb-4">
                    <ImageIcon className="h-8 w-8 text-slate-300" />
                </div>
                <h4 className="text-slate-900 font-semibold text-lg">No hay banners configurados</h4>
                <p className="text-slate-500 max-w-sm mt-1 mb-6">
                    Aún no hay banners para {activeBranch?.name || 'la tienda'}.
                </p>
                <Button asChild variant="outline">
                    <Link href="/admin/banners/new">Crear el primero</Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            {/* 1. HERO PRINCIPAL */}
            <BannerSectionGroup 
                dndId="dnd-hero" // 🆔 ID Único
                title="Hero Principal (Carrusel)" 
                icon={GalleryHorizontal} 
                banners={heroBanners} 
                onReorder={(items) => handleReorder(items, 'MAIN_HERO')}
                onDelete={handleDelete}
            />

            {/* 2. SECCIÓN MEDIA */}
            <BannerSectionGroup 
                dndId="dnd-middle" // 🆔 ID Único
                title="Sección Media" 
                icon={Layers} 
                banners={middleBanners} 
                onReorder={(items) => handleReorder(items, 'MIDDLE_SECTION')}
                onDelete={handleDelete}
            />
        </div>
    );
}