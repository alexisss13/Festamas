'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { deleteCatalog, toggleCatalogStatus } from '@/actions/catalogs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Pencil, Trash2, Search, BookOpen, Plus, ExternalLink, SwitchCamera } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
export function CatalogsView({ initialCatalogs, activeBranch }: { initialCatalogs: any[], activeBranch?: any }) {
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState('');

    const brandButtonClass = "bg-primary hover:bg-primary/90";

    const filteredCatalogs = initialCatalogs.filter(catalog => 
        catalog.title?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleDelete = async (id: string) => {
        if (!confirm("¿Eliminar catálogo permanentemente? Esta acción no se puede deshacer.")) return;
        const res = await deleteCatalog(id);
        if (res.success) {
            toast.success("Catálogo eliminado");
            router.refresh();
        } else {
            toast.error(res.error || "Error al eliminar");
        }
    };

    const handleToggleStatus = async (id: string, currentStatus: boolean) => {
        const res = await toggleCatalogStatus(id, currentStatus);
        if (res.success) {
            toast.success(currentStatus ? "Catálogo desactivado" : "Catálogo activado");
            router.refresh();
        } else {
            toast.error(res.error || "Error al cambiar estado");
        }
    };

    return (
        <div className="space-y-4 [&_::selection]:bg-slate-200 [&_::selection]:text-slate-900 animate-in fade-in duration-500">
            {/* Buscador y Botón Nuevo */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
                <div className="relative max-w-full sm:max-w-sm flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input 
                        placeholder="Buscar catálogo..." 
                        className="pl-10 h-10 bg-white border-slate-200 focus-visible:border-slate-400 focus-visible:ring-slate-400/20"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-3">
                    <div className="text-sm border py-2 px-3 rounded-md bg-white text-slate-500 text-center sm:text-left font-medium">
                        {filteredCatalogs.length} {filteredCatalogs.length === 1 ? 'catálogo' : 'catálogos'}
                    </div>
                    <Button 
                        asChild 
                        className={cn(
                            "h-10 px-4 shadow-sm transition-all active:scale-[0.98] text-white font-medium",
                            brandButtonClass
                        )}
                    >
                        <Link href="/admin/catalogs/new">
                            <Plus className="mr-2 h-4 w-4" />
                            Nuevo Catálogo
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Tabla con scroll horizontal */}
            <div className="w-full border border-slate-200 rounded-lg overflow-hidden bg-white shadow-sm">
                <div className="w-full overflow-x-auto">
                    <Table className="min-w-[800px]">
                        <TableHeader>
                            <TableRow className="bg-white hover:bg-white border-b border-slate-200">
                                <TableHead className="h-11 px-4 lg:px-6 w-[120px]">Portada</TableHead>
                                <TableHead className="h-11 px-4 font-semibold text-slate-700 min-w-[200px]">Título</TableHead>
                                <TableHead className="h-11 px-4 font-semibold text-slate-700 w-[180px]">Link (iframe)</TableHead>
                                <TableHead className="h-11 px-4 font-semibold text-slate-700 w-24">Estado</TableHead>
                                <TableHead className="h-11 px-4 lg:px-6 text-right font-semibold text-slate-700 w-[140px]">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredCatalogs.map((catalog) => (
                                <TableRow key={catalog.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                                    <TableCell className="py-3 px-4 lg:px-6">
                                        <div className="relative w-16 h-20 rounded-md overflow-hidden border border-slate-200 bg-slate-100 flex-shrink-0">
                                            {catalog.coverImage ? (
                                                <Image 
                                                    src={catalog.coverImage} 
                                                    alt={catalog.title}
                                                    fill
                                                    className="object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-slate-300">
                                                    <BookOpen className="w-6 h-6" />
                                                </div>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="py-3 px-4 font-medium text-slate-900">
                                        {catalog.title}
                                    </TableCell>
                                    <TableCell className="py-3 px-4">
                                        {catalog.iframeUrl ? (
                                            <a 
                                                href={catalog.iframeUrl} 
                                                target="_blank" 
                                                rel="noreferrer"
                                                className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 hover:underline max-w-[150px]"
                                                title={catalog.iframeUrl}
                                            >
                                                <ExternalLink className="w-3 h-3 flex-shrink-0" />
                                                <span className="truncate">{catalog.iframeUrl}</span>
                                            </a>
                                        ) : (
                                            <span className="text-xs text-slate-400 italic">Sin enlace</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="py-3 px-4">
                                        <Badge 
                                            variant="outline" 
                                            className={cn(
                                                "text-[10px] font-medium uppercase tracking-wider",
                                                catalog.isActive 
                                                    ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                                                    : "bg-slate-100 text-slate-600 border-slate-300"
                                            )}
                                        >
                                            {catalog.isActive ? "Activo" : "Inactivo"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="py-3 px-4 lg:px-6 text-right">
                                        <div className="flex justify-end gap-1">
                                            <Button 
                                                variant="ghost" 
                                                size="sm" 
                                                title={catalog.isActive ? "Desactivar" : "Activar"}
                                                className="h-8 w-8 p-0 text-slate-500 hover:text-slate-900 hover:bg-slate-100 cursor-pointer"
                                                onClick={() => handleToggleStatus(catalog.id, catalog.isActive)}
                                            >
                                                <SwitchCamera className="w-3.5 h-3.5" />
                                            </Button>
                                            <Button 
                                                variant="ghost" 
                                                size="sm" 
                                                asChild 
                                                title="Editar catálogo"
                                                className="h-8 w-8 p-0 text-slate-600 hover:text-slate-900 hover:bg-slate-100 cursor-pointer"
                                            >
                                                <Link href={`/admin/catalogs/${catalog.id}`}>
                                                    <Pencil className="w-3.5 h-3.5" />
                                                </Link>
                                            </Button>
                                            <Button 
                                                variant="ghost" 
                                                size="sm" 
                                                title="Eliminar catálogo"
                                                className="h-8 w-8 p-0 text-slate-400 hover:text-red-600 hover:bg-red-50 cursor-pointer"
                                                onClick={() => handleDelete(catalog.id)}
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                            
                            {filteredCatalogs.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-40 text-center">
                                        <div className="flex flex-col items-center justify-center text-slate-400">
                                            <BookOpen className="w-10 h-10 mb-3 opacity-20" />
                                            <p className="text-sm font-medium text-slate-500">No se encontraron catálogos</p>
                                            <p className="text-xs text-slate-400 mt-1">Crea uno nuevo para que aparezca aquí.</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    );
}
