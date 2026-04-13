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
import { Pencil, Trash2, GripVertical, Smartphone, Monitor, Link as LinkIcon, Image as ImageIcon, GalleryHorizontal, AlignHorizontalJustifyStart } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { BannerPosition } from '@prisma/client';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function SortableBannerItem({ banner, onDelete }: { banner: any, onDelete: (id: string) => void }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: banner.id });

    const [showMobile, setShowMobile] = useState(false);
    const hasMobileVersion = !!banner.mobileUrl;

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.6 : 1,
        zIndex: isDragging ? 50 : 'auto',
    };

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

    const currentImage = (showMobile && hasMobileVersion) ? getPublicId(banner.mobileUrl) : getPublicId(banner.imageUrl);
    const isShowingMobile = showMobile && hasMobileVersion;

    return (
        <div ref={setNodeRef} style={style}>
            <Card className={cn(
                "group relative overflow-hidden transition-colors rounded-xl shadow-sm p-0 gap-0",
                isDragging ? "ring-2 ring-primary/50 shadow-md border-primary/40 z-50" : "hover:border-slate-300"
            )}>
                {/* DRAG Y PREVIEW */}
                <div className="relative aspect-[3/1] w-full bg-slate-100 group-drag border-b border-slate-100">
                    <div
                        {...attributes}
                        {...listeners}
                        className="absolute top-2 left-2 p-1.5 z-10 bg-white/90 backdrop-blur-sm rounded border border-slate-200/60 shadow-sm text-slate-500 cursor-grab active:cursor-grabbing hover:text-slate-800 opacity-0 group-hover:opacity-100 transition-opacity touch-none"
                    >
                        <GripVertical className="w-4 h-4" />
                    </div>

                    {currentImage ? (
                        <Image
                            loader={cloudinaryLoader}
                            src={currentImage}
                            alt={banner.title}
                            fill
                            className={cn(
                                isShowingMobile ? "object-contain p-2" : "object-cover"
                            )}
                            sizes="(max-width: 768px) 100vw, 33vw"
                        />
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <ImageIcon className="w-6 h-6 text-slate-300" />
                        </div>
                    )}

                    {isShowingMobile && (
                        <div className="absolute top-2 right-2 bg-black/80 px-2 py-0.5 rounded text-[10px] font-medium text-white tracking-wide">
                            Mobile
                        </div>
                    )}
                </div>

                {/* INFO Y CONTROLES */}
                <CardContent className="p-4">
                    <h4 className="font-medium text-slate-800 text-sm line-clamp-2" title={banner.title}>
                        {banner.title}
                    </h4>

                    <div className="pt-3 flex items-center justify-between mt-3 border-t border-slate-100">
                        {/* TOGGLES */}
                        <div className="flex gap-0.5 bg-slate-100/50 p-0.5 rounded border border-slate-200/50">
                            <button
                                type="button"
                                onClick={() => setShowMobile(false)}
                                className={cn("p-1.5 rounded transition-colors cursor-pointer", !showMobile ? "bg-white shadow-sm text-primary" : "text-slate-400 hover:text-slate-600 hover:bg-slate-200/50")}
                            >
                                <Monitor className="w-3.5 h-3.5" />
                            </button>
                            <button
                                type="button"
                                onClick={() => hasMobileVersion && setShowMobile(true)}
                                disabled={!hasMobileVersion}
                                className={cn("p-1.5 rounded transition-colors", isShowingMobile ? "bg-white shadow-sm text-primary" : "text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 cursor-pointer", !hasMobileVersion && "opacity-30 cursor-not-allowed hidden")}
                            >
                                <Smartphone className="w-3.5 h-3.5" />
                            </button>
                        </div>

                        {/* ACCIONES */}
                        <div className="flex items-center gap-1 -mr-2">
                            <Button variant="ghost" size="icon" asChild className="h-8 w-8 text-slate-500 hover:text-slate-800 cursor-pointer">
                                <Link href={`/admin/banners/${banner.id}`}>
                                    <Pencil className="h-3.5 w-3.5" />
                                </Link>
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => onDelete(banner.id)} className="h-8 w-8 text-slate-400 hover:text-red-500 hover:bg-red-50 cursor-pointer">
                                <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function BannerSectionGroup({ dndId, title, banners, onReorder, onDelete }: { dndId: string, title: string, banners: any[], onReorder: (items: any[]) => void, onDelete: (id: string) => void }) {

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
        <div className="mb-12 animate-in fade-in">
            <div className="flex items-center gap-3 mb-6 px-1">
                <h3 className="font-medium text-slate-700 text-[17px] tracking-tight">{title}</h3>
                <span className="bg-slate-100/80 text-slate-500 text-[11px] font-medium px-2 py-0.5 rounded-md">{banners.length}</span>
            </div>

            <DndContext id={dndId} sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={banners.map(b => b.id)} strategy={rectSortingStrategy}>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
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
        toast.success("Banner eliminado exitosamente");
    };

    const topBarBanners = banners.filter(b => (b.branchId === activeBranch?.id || !b.branchId) && b.position === 'TOP_BAR').sort((a, b) => a.order - b.order);
    const heroBanners = banners.filter(b => (b.branchId === activeBranch?.id || !b.branchId) && b.position === 'MAIN_HERO').sort((a, b) => a.order - b.order);

    if (banners.filter(b => b.branchId === activeBranch?.id || !b.branchId).length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 bg-slate-50/50 rounded-xl border border-slate-200 border-dashed text-center">
                <div className="p-4 bg-white rounded-full shadow-sm mb-4">
                    <ImageIcon className="h-6 w-6 text-slate-400" />
                </div>
                <h4 className="text-slate-800 font-semibold mb-1">Sin banners configurados</h4>
                <p className="text-slate-500 text-sm max-w-sm mb-6">
                    Aún no haz creado banners para {activeBranch?.name || 'esta tienda'}.
                </p>
                <Button asChild variant="outline" className="h-10">
                    <Link href="/admin/banners/new">Crear Banner</Link>
                </Button>
            </div>
        );
    }

    return (
        <div>
            {/* 1. HERO PRINCIPAL */}
            <BannerSectionGroup
                dndId="dnd-hero"
                title="Banners principales"
                banners={heroBanners}
                onReorder={(items) => handleReorder(items, 'MAIN_HERO')}
                onDelete={handleDelete}
            />

            {/* 2. CINTILLO SUPERIOR */}
            <BannerSectionGroup
                dndId="dnd-topbar"
                title="Cintillo superior"
                banners={topBarBanners}
                onReorder={(items) => handleReorder(items, 'TOP_BAR')}
                onDelete={handleDelete}
            />
        </div>
    );
}