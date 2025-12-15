'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { createBanner, deleteBanner } from '@/actions/banners';
import { Trash2, Plus, ExternalLink, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Banner, BannerPosition, Division } from '@prisma/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface Props {
  initialBanners: Banner[];
}

export function BannersManager({ initialBanners }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // Estado del formulario
  const [formData, setFormData] = useState({
    title: '',
    imageUrl: '',
    link: '',
    division: 'JUGUETERIA' as Division,
    position: 'MAIN_HERO' as BannerPosition,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const res = await createBanner(formData);

    if (res.success) {
      // Reset form
      setFormData({ ...formData, title: '', imageUrl: '', link: '' });
      router.refresh(); // Recarga la data fresca
    } else {
      alert('Error al crear banner');
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Seguro que quieres eliminar este banner?')) return;
    
    setLoading(true);
    const res = await deleteBanner(id);
    if (res.success) {
      router.refresh();
    }
    setLoading(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      {/* --- COLUMNA IZQUIERDA: FORMULARIO --- */}
      <div className="lg:col-span-1">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 sticky top-4">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Plus className="h-5 w-5 text-primary" /> Nuevo Banner
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Título */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Título Interno</label>
              <Input 
                required
                placeholder="Ej. Oferta Navidad Lego"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
              />
            </div>

            {/* URL Imagen (Aquí iría Cloudinary luego) */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">URL de la Imagen</label>
              <Input 
                required
                placeholder="https://..."
                value={formData.imageUrl}
                onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
              />
              {formData.imageUrl && (
                <div className="mt-2 relative h-32 w-full rounded-md overflow-hidden border border-slate-200">
                    <Image src={formData.imageUrl} alt="Preview" fill className="object-cover" />
                </div>
              )}
            </div>

            {/* Link Destino */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Link de Destino (Opcional)</label>
              <Input 
                placeholder="/category/lego"
                value={formData.link}
                onChange={(e) => setFormData({...formData, link: e.target.value})}
              />
            </div>

            {/* Selectores Grid */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Tienda</label>
                    <select 
                        className="w-full h-10 rounded-md border border-slate-200 px-3 text-sm"
                        value={formData.division}
                        onChange={(e) => setFormData({...formData, division: e.target.value as Division})}
                    >
                        <option value="JUGUETERIA">Festamas 🧸</option>
                        <option value="FIESTAS">FiestasYa 🎉</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Posición</label>
                    <select 
                        className="w-full h-10 rounded-md border border-slate-200 px-3 text-sm"
                        value={formData.position}
                        onChange={(e) => setFormData({...formData, position: e.target.value as BannerPosition})}
                    >
                        <option value="MAIN_HERO">Hero Principal (Grande)</option>
                        <option value="TOP_STRIP">Cintillo Superior (Chico)</option>
                    </select>
                </div>
            </div>

            <Button type="submit" className="w-full bg-slate-900 hover:bg-slate-800" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Guardar Banner'}
            </Button>
          </form>
        </div>
      </div>

      {/* --- COLUMNA DERECHA: LISTADO --- */}
      <div className="lg:col-span-2 space-y-6">
        
        {/* FESTAMAS LIST */}
        <div className="space-y-4">
            <h3 className="text-lg font-bold text-[#fc4b65] flex items-center gap-2 border-b pb-2">
                🧸 Festamas (Juguetería)
            </h3>
            <BannerGrid 
                banners={initialBanners.filter(b => b.division === 'JUGUETERIA')} 
                onDelete={handleDelete}
                loading={loading}
            />
        </div>

        {/* FIESTASYA LIST */}
        <div className="space-y-4 pt-4">
            <h3 className="text-lg font-bold text-[#ec4899] flex items-center gap-2 border-b pb-2">
                🎉 FiestasYa (Decoración)
            </h3>
            <BannerGrid 
                banners={initialBanners.filter(b => b.division === 'FIESTAS')} 
                onDelete={handleDelete}
                loading={loading}
            />
        </div>

      </div>
    </div>
  );
}

// Sub-componente para la grilla de items
function BannerGrid({ banners, onDelete, loading }: { banners: Banner[], onDelete: (id: string) => void, loading: boolean }) {
    if (banners.length === 0) return <p className="text-slate-400 text-sm italic">No hay banners activos.</p>;

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {banners.map(banner => (
                <div key={banner.id} className="group relative bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all">
                    {/* Imagen */}
                    <div className={cn("relative w-full bg-slate-50", banner.position === 'TOP_STRIP' ? "h-12" : "h-40")}>
                        {banner.imageUrl ? (
                            <Image src={banner.imageUrl} alt={banner.title} fill className="object-cover" />
                        ) : (
                            <div className="flex items-center justify-center h-full text-slate-300"><ImageIcon /></div>
                        )}
                    </div>
                    
                    {/* Info */}
                    <div className="p-3">
                        <div className="flex justify-between items-start mb-1">
                            <div>
                                <span className={cn(
                                    "text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide mr-2",
                                    banner.position === 'MAIN_HERO' ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"
                                )}>
                                    {banner.position === 'MAIN_HERO' ? 'HERO' : 'CINTILLO'}
                                </span>
                                <h4 className="font-semibold text-slate-800 text-sm inline-block">{banner.title}</h4>
                            </div>
                        </div>
                        {banner.link && (
                            <div className="flex items-center gap-1 text-xs text-slate-500 truncate mb-2">
                                <ExternalLink className="h-3 w-3" /> {banner.link}
                            </div>
                        )}
                        
                        <Button 
                            variant="destructive" 
                            size="sm" 
                            className="w-full h-7 text-xs"
                            onClick={() => onDelete(banner.id)}
                            disabled={loading}
                        >
                            <Trash2 className="h-3 w-3 mr-1" /> Eliminar
                        </Button>
                    </div>
                </div>
            ))}
        </div>
    );
}