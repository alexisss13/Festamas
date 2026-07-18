'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { savePopup, deletePopup } from '@/actions/popups';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

export function PopupManager({ initialPopup }: { initialPopup: any }) {
  const router = useRouter();
  const [imageUrl, setImageUrl] = useState(initialPopup?.imageUrl ?? '');
  const [link, setLink] = useState(initialPopup?.link ?? '');
  const [isActive, setIsActive] = useState(initialPopup?.isActive ?? false);
  const [showOnce, setShowOnce] = useState(initialPopup?.showOnce ?? true);
  const [startsAt, setStartsAt] = useState(initialPopup?.startsAt ? new Date(initialPopup.startsAt).toISOString().slice(0, 16) : '');
  const [endsAt, setEndsAt] = useState(initialPopup?.endsAt ? new Date(initialPopup.endsAt).toISOString().slice(0, 16) : '');
  const [saving, setSaving] = useState(false);
  const submit = async (e: React.FormEvent) => { e.preventDefault(); if (!imageUrl.trim()) return toast.error('Ingresa la URL de la imagen'); setSaving(true); const res = await savePopup({ imageUrl: imageUrl.trim(), link: link.trim() || null, isActive, showOnce, startsAt: startsAt || null, endsAt: endsAt || null }); setSaving(false); if (res.success) { toast.success('Popup guardado'); router.refresh(); } else toast.error(res.error); };
  const remove = async () => { const res = await deletePopup(); if (res.success) { setImageUrl(''); setLink(''); setIsActive(false); toast.success('Popup eliminado'); } else toast.error(res.error); };
  return <Card className="max-w-3xl"><CardHeader><CardTitle>Popup promocional</CardTitle><p className="text-sm text-slate-500">Configura una campaña visual para la sucursal activa. Usa una URL de Cloudinary o CDN.</p></CardHeader><CardContent><form onSubmit={submit} className="space-y-5">
    <div><Label>URL de imagen</Label><Input value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="https://res.cloudinary.com/..." /></div>
    <div><Label>Enlace opcional</Label><Input value={link} onChange={e => setLink(e.target.value)} placeholder="/collections/ofertas" /></div>
    <div className="grid gap-4 sm:grid-cols-2"><div><Label>Inicio programado</Label><Input type="datetime-local" value={startsAt} onChange={e => setStartsAt(e.target.value)} /></div><div><Label>Fin programado</Label><Input type="datetime-local" value={endsAt} onChange={e => setEndsAt(e.target.value)} /></div></div>
    <div className="flex flex-wrap gap-5 text-sm"><label className="flex items-center gap-2"><input type="checkbox" checked={isActive} onChange={e => setIsActive(e.target.checked)} /> Mostrar en la tienda</label><label className="flex items-center gap-2"><input type="checkbox" checked={showOnce} onChange={e => setShowOnce(e.target.checked)} /> Mostrar una vez por visitante</label></div>
    {imageUrl && <img src={imageUrl} alt="Vista previa" className="max-h-72 rounded-xl border object-contain" />}
    <div className="flex gap-3"><Button disabled={saving}>{saving ? 'Guardando…' : 'Guardar popup'}</Button>{initialPopup && <Button type="button" variant="outline" onClick={remove}>Eliminar</Button>}</div>
  </form></CardContent></Card>;
}
