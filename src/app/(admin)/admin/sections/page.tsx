'use client';

import { useState, useEffect } from 'react';
import { getHomeSections, saveHomeSection, deleteHomeSection, HomeSectionInput } from '@/actions/home-sections';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Plus, Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Division } from '@prisma/client';

// Tipado auxiliar para el estado local
type Section = { id: string } & HomeSectionInput;

export default function SectionsPage() {
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);

  // Cargar secciones al iniciar
  useEffect(() => {
    loadSections();
  }, []);

  const loadSections = async () => {
    try {
      const { sections } = await getHomeSections(false); // false = traer todas (activas e inactivas)
      // Mapeo seguro para evitar errores de tipo si viene algo raro
      setSections(sections as unknown as Section[]);
    } catch (error) {
      console.error(error);
      toast.error('Error cargando secciones');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    const newSection: Section = {
      id: '', // ID vacío indica que es nueva
      title: 'Nueva Sección',
      subtitle: '',
      tag: 'destacado',
      division: 'JUGUETERIA', // Default
      icon: 'star',
      order: sections.length + 1,
    };
    setSections([...sections, newSection]);
  };

  const handleSave = async (section: Section) => {
    // Si es nueva (id vacío), pasamos undefined al action
    const idToSave = section.id || undefined;
    
    // Preparamos los datos limpios
    const dataToSave: HomeSectionInput = {
        title: section.title,
        subtitle: section.subtitle,
        tag: section.tag,
        division: section.division,
        icon: section.icon,
        order: section.order
    };

    const res = await saveHomeSection(dataToSave, idToSave);
    
    if (res.ok) {
      toast.success('Sección guardada correctamente');
      loadSections(); // Recargamos para obtener el ID real de la BD
    } else {
      toast.error('Error al guardar');
    }
  };

  const handleDelete = async (id: string) => {
    if (!id) {
        // Si no tiene ID, es una sección local que aún no se guardó en BD
        setSections(sections.filter(s => s.id !== ''));
        return;
    }
    
    if (confirm('¿Seguro que quieres borrar esta sección de la Home?')) {
      const res = await deleteHomeSection(id);
      if (res.ok) {
          toast.success('Sección eliminada');
          loadSections();
      } else {
          toast.error('No se pudo eliminar');
      }
    }
  };

  // Función para actualizar el estado local mientras escribes
  const updateLocal = (index: number, field: keyof HomeSectionInput, value: any) => {
    const updated = [...sections];
    updated[index] = { ...updated[index], [field]: value };
    setSections(updated);
  };

  if (loading) {
      return (
          <div className="flex h-[50vh] w-full items-center justify-center text-slate-400">
              <Loader2 className="h-8 w-8 animate-spin mr-2" /> Cargando CMS...
          </div>
      );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-6">
        <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Gestión de Home</h1>
            <p className="text-slate-500 mt-1">Configura los bloques y filtros que aparecen en la página principal.</p>
        </div>
        <Button onClick={handleCreate} className="bg-slate-900 text-white shadow-lg hover:bg-slate-800 transition-all hover:scale-105 active:scale-95">
            <Plus className="mr-2 h-4 w-4" /> Nueva Sección
        </Button>
      </div>

      {/* Lista de Secciones */}
      <div className="space-y-6">
        {sections.map((section, index) => (
          <Card key={section.id || `new-${index}`} className="overflow-hidden border border-slate-200 shadow-sm hover:shadow-md transition-shadow bg-white">
            <CardContent className="p-6 grid gap-6 md:grid-cols-12 items-start">
              
              {/* Columna 1: Títulos (4/12) */}
              <div className="md:col-span-4 space-y-4">
                <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase text-slate-500 tracking-wider">Título Principal</Label>
                    <Input 
                        value={section.title} 
                        onChange={(e) => updateLocal(index, 'title', e.target.value)} 
                        placeholder="Ej: El Regalo Perfecto"
                        className="font-bold text-lg"
                    />
                </div>
                <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase text-slate-500 tracking-wider">Subtítulo (Opcional)</Label>
                    <Input 
                        value={section.subtitle || ''} 
                        onChange={(e) => updateLocal(index, 'subtitle', e.target.value)}
                        placeholder="Ej: Sorprende a los pequeños..."
                    />
                </div>
              </div>

              {/* Columna 2: Configuración (5/12) */}
              <div className="md:col-span-5 grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase text-slate-500 tracking-wider">Tag (Filtro)</Label>
                    <Input 
                        value={section.tag} 
                        onChange={(e) => updateLocal(index, 'tag', e.target.value)}
                        placeholder="Ej: verano"
                        className="font-mono text-sm bg-slate-50"
                    />
                    <p className="text-[10px] text-slate-400">Debe coincidir con el tag del producto.</p>
                </div>
                
                <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase text-slate-500 tracking-wider">Icono</Label>
                    <Select value={section.icon} onValueChange={(val) => updateLocal(index, 'icon', val)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="gift">🎁 Regalo</SelectItem>
                            <SelectItem value="party">🎉 Fiesta</SelectItem>
                            <SelectItem value="sparkles">✨ Destellos</SelectItem>
                            <SelectItem value="star">⭐ Estrella</SelectItem>
                            <SelectItem value="tag">🏷️ Etiqueta</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase text-slate-500 tracking-wider">Estilo Marca</Label>
                    <Select value={section.division} onValueChange={(val) => updateLocal(index, 'division', val as Division)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="JUGUETERIA">🔴 Festamas (Rojo)</SelectItem>
                            <SelectItem value="FIESTAS">🟣 FiestasYa (Rosa)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase text-slate-500 tracking-wider">Orden</Label>
                    <Input 
                        type="number" 
                        value={section.order} 
                        onChange={(e) => updateLocal(index, 'order', Number(e.target.value))}
                    />
                </div>
              </div>

              {/* Columna 3: Acciones (3/12) */}
              <div className="md:col-span-3 flex flex-col gap-3 justify-end h-full pt-6">
                <Button 
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold"
                    onClick={() => handleSave(section)}
                >
                    <Save className="mr-2 h-4 w-4" /> Guardar Cambios
                </Button>
                
                <Button 
                    variant="outline" 
                    className="w-full text-red-500 border-red-200 hover:bg-red-50 hover:text-red-700"
                    onClick={() => handleDelete(section.id)}
                >
                    <Trash2 className="mr-2 h-4 w-4" /> Eliminar
                </Button>
              </div>

            </CardContent>
          </Card>
        ))}

        {sections.length === 0 && (
            <div className="text-center py-16 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                <p className="text-slate-500 mb-4">No tienes secciones configuradas en la Home.</p>
                <Button variant="outline" onClick={handleCreate}>
                    ¡Crea la primera ahora!
                </Button>
            </div>
        )}
      </div>
    </div>
  );
}