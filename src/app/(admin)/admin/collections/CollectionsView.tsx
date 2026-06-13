'use client';

import { useState, useTransition } from 'react';
import { Plus, Pencil, Trash2, Eye, EyeOff, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { AdminCollection } from '@/actions/collections';
import { createCollection, updateCollection, toggleCollectionActive, deleteCollection } from '@/actions/collections';

const PAGE_SIZE = 10;

interface Props {
  initialCollections: AdminCollection[];
}

type FormData = {
  name: string;
  slug: string;
  description: string;
  groupTag: string;
  coverImage: string;
  sortOrder: string;
  active: boolean;
  activeFrom: string;
  activeUntil: string;
};

const EMPTY_FORM: FormData = {
  name: '', slug: '', description: '', groupTag: '',
  coverImage: '', sortOrder: '0', active: true, activeFrom: '', activeUntil: '',
};

function slugify(str: string) {
  return str.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

export function CollectionsView({ initialCollections }: Props) {
  const [collections, setCollections] = useState(initialCollections);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [isPending, startTransition] = useTransition();

  const filtered = collections.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.groupTag.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  };

  const openEdit = (c: AdminCollection) => {
    setEditingId(c.id);
    setForm({
      name: c.name,
      slug: c.slug,
      description: c.description ?? '',
      groupTag: c.groupTag,
      coverImage: c.coverImage ?? '',
      sortOrder: String(c.sortOrder),
      active: c.active,
      activeFrom: c.activeFrom ? c.activeFrom.toISOString().split('T')[0] : '',
      activeUntil: c.activeUntil ? c.activeUntil.toISOString().split('T')[0] : '',
    });
    setModalOpen(true);
  };

  const handleSubmit = () => {
    if (!form.name.trim() || !form.slug.trim() || !form.groupTag.trim()) {
      toast.error('Nombre, slug y groupTag son obligatorios.');
      return;
    }
    startTransition(async () => {
      const payload = {
        name: form.name.trim(),
        slug: form.slug.trim(),
        description: form.description.trim() || undefined,
        groupTag: form.groupTag.trim(),
        coverImage: form.coverImage.trim() || undefined,
        sortOrder: Number(form.sortOrder) || 0,
        active: form.active,
        activeFrom: form.activeFrom || undefined,
        activeUntil: form.activeUntil || undefined,
      };

      const result = editingId
        ? await updateCollection(editingId, payload)
        : await createCollection(payload);

      if (!result.success) {
        toast.error(result.error ?? 'Error al guardar');
        return;
      }

      toast.success(editingId ? 'Colección actualizada' : 'Colección creada');
      setModalOpen(false);
      // Refresh list
      const { data } = await import('@/actions/collections').then(m => m.getAdminCollections());
      if (data) setCollections(data);
    });
  };

  const handleToggle = (id: string, current: boolean) => {
    startTransition(async () => {
      const result = await toggleCollectionActive(id, !current);
      if (!result.success) { toast.error(result.error ?? 'Error'); return; }
      setCollections(prev => prev.map(c => c.id === id ? { ...c, active: !current } : c));
      toast.success(!current ? 'Colección activada' : 'Colección ocultada');
    });
  };

  const handleDelete = (id: string, name: string) => {
    if (!confirm(`¿Eliminar la colección "${name}"? Esta acción no se puede deshacer.`)) return;
    startTransition(async () => {
      const result = await deleteCollection(id);
      if (!result.success) { toast.error(result.error ?? 'Error'); return; }
      setCollections(prev => prev.filter(c => c.id !== id));
      toast.success('Colección eliminada');
    });
  };

  return (
    <>
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <Input
          placeholder="Buscar por nombre o groupTag..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          className="sm:max-w-xs"
        />
        <Button onClick={openCreate} className="ml-auto gap-2 bg-primary hover:bg-primary/90 text-white">
          <Plus className="h-4 w-4" />
          Nueva Colección
        </Button>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Nombre</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">GroupTag</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">Slug</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Estado</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Orden</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-slate-400">
                    {search ? 'No se encontraron colecciones.' : 'Aún no hay colecciones creadas.'}
                  </td>
                </tr>
              ) : paginated.map(c => (
                <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-3 font-medium text-slate-900">{c.name}</td>
                  <td className="px-4 py-3">
                    <code className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">{c.groupTag}</code>
                  </td>
                  <td className="px-4 py-3 text-slate-500 hidden md:table-cell">{c.slug}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={cn(
                      'inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full',
                      c.active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                    )}>
                      {c.active ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                      {c.active ? 'Activa' : 'Oculta'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center text-slate-500">{c.sortOrder}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 justify-end">
                      <button
                        onClick={() => handleToggle(c.id, c.active)}
                        disabled={isPending}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                        title={c.active ? 'Ocultar' : 'Activar'}
                      >
                        {c.active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                      <button
                        onClick={() => openEdit(c)}
                        disabled={isPending}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                        title="Editar"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(c.id, c.name)}
                        disabled={isPending}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 bg-slate-50">
            <p className="text-xs text-slate-500">
              {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, filtered.length)} de {filtered.length}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={safePage === 1}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-white disabled:opacity-40 transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-xs font-semibold text-slate-600 px-2">{safePage} / {totalPages}</span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={safePage === totalPages}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-white disabled:opacity-40 transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal create/edit */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-5 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">
                {editingId ? 'Editar Colección' : 'Nueva Colección'}
              </h2>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Nombre *</label>
                <Input
                  value={form.name}
                  onChange={e => {
                    const name = e.target.value;
                    setForm(f => ({ ...f, name, slug: editingId ? f.slug : slugify(name) }));
                  }}
                  placeholder="Ej. Colección Navidad 2025"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Slug *</label>
                <Input
                  value={form.slug}
                  onChange={e => setForm(f => ({ ...f, slug: slugify(e.target.value) }))}
                  placeholder="navidad-2025"
                />
                <p className="text-[11px] text-slate-400 mt-1">URL: /collections/{form.slug || '...'}</p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">GroupTag * <span className="text-slate-400 font-normal">(coincide con Product.groupTag)</span></label>
                <Input
                  value={form.groupTag}
                  onChange={e => setForm(f => ({ ...f, groupTag: e.target.value.trim() }))}
                  placeholder="navidad"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Descripción</label>
                <Input
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Descripción opcional..."
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">URL de imagen de portada</label>
                <Input
                  value={form.coverImage}
                  onChange={e => setForm(f => ({ ...f, coverImage: e.target.value }))}
                  placeholder="https://..."
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Orden</label>
                  <Input
                    type="number"
                    value={form.sortOrder}
                    onChange={e => setForm(f => ({ ...f, sortOrder: e.target.value }))}
                    min={0}
                  />
                </div>
                <div className="flex flex-col justify-end">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <div
                      onClick={() => setForm(f => ({ ...f, active: !f.active }))}
                      className={cn(
                        'w-10 h-5 rounded-full transition-colors relative',
                        form.active ? 'bg-primary' : 'bg-slate-300'
                      )}
                    >
                      <span className={cn(
                        'absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform',
                        form.active ? 'translate-x-5' : 'translate-x-0.5'
                      )} />
                    </div>
                    <span className="text-xs font-semibold text-slate-600">Activa</span>
                  </label>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Disponible desde</label>
                  <Input type="date" value={form.activeFrom} onChange={e => setForm(f => ({ ...f, activeFrom: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Disponible hasta</label>
                  <Input type="date" value={form.activeUntil} onChange={e => setForm(f => ({ ...f, activeUntil: e.target.value }))} />
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setModalOpen(false)} disabled={isPending}>
                Cancelar
              </Button>
              <Button onClick={handleSubmit} disabled={isPending} className="bg-primary hover:bg-primary/90 text-white">
                {isPending ? 'Guardando...' : editingId ? 'Guardar cambios' : 'Crear colección'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
