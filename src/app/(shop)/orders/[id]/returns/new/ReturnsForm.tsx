'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import Link from 'next/link';
import { createReturnRequest } from '@/actions/returns';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface OrderItem { id: string; productName: string; variantName: string | null; quantity: number; price: number }

export function ReturnsForm({ order }: { order: { id: string; receiptNumber: string | null; orderItems: OrderItem[] } }) {
  const router = useRouter();
  const [type, setType] = useState<'RETURN' | 'EXCHANGE'>('RETURN');
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [pending, startTransition] = useTransition();

  const submit = () => {
    const items = Object.entries(quantities).filter(([, quantity]) => quantity > 0).map(([orderItemId, quantity]) => ({ orderItemId, quantity }));
    if (!items.length) return toast.error('Selecciona al menos un producto.');
    if (reason.trim().length < 5) return toast.error('Indica el motivo de la solicitud.');
    startTransition(async () => {
      const result = await createReturnRequest({ orderId: order.id, type, reason, notes, items });
      if (!result.success) {
        toast.error(result.message);
        return;
      }
      toast.success('Solicitud enviada correctamente.');
      router.push('/profile/orders');
    });
  };

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8 md:py-12">
      <Link href="/profile/orders" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 mb-6"><ArrowLeft className="h-4 w-4" /> Volver a mis pedidos</Link>
      <div className="rounded-2xl border border-slate-200 bg-white p-5 md:p-8 shadow-sm space-y-7">
        <div><h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2"><RotateCcw className="h-6 w-6 text-primary" /> Solicitud para pedido {order.receiptNumber || order.id.slice(0, 8).toUpperCase()}</h1><p className="text-sm text-slate-500 mt-2">Selecciona los productos y explícanos qué necesitas.</p></div>
        <div className="space-y-3"><Label>Tipo de solicitud</Label><RadioGroup value={type} onValueChange={value => setType(value as 'RETURN' | 'EXCHANGE')} className="grid grid-cols-2 gap-3"><label className="flex items-center gap-2 rounded-lg border p-3 cursor-pointer"><RadioGroupItem value="RETURN" /> Devolución</label><label className="flex items-center gap-2 rounded-lg border p-3 cursor-pointer"><RadioGroupItem value="EXCHANGE" /> Cambio</label></RadioGroup></div>
        <div className="space-y-3"><Label>Productos</Label>{order.orderItems.map(item => <div key={item.id} className="flex items-center justify-between gap-3 rounded-lg border border-slate-100 bg-slate-50 p-3"><div><p className="text-sm font-medium text-slate-900">{item.productName}</p><p className="text-xs text-slate-500">{item.variantName || 'Producto'} · máximo {item.quantity}</p></div><Input type="number" min={0} max={item.quantity} className="w-20" value={quantities[item.id] ?? 0} onChange={event => setQuantities(current => ({ ...current, [item.id]: Math.min(item.quantity, Math.max(0, Number(event.target.value) || 0)) }))} /></div>)}</div>
        <div className="space-y-2"><Label>Motivo</Label><Textarea value={reason} onChange={event => setReason(event.target.value)} placeholder="Cuéntanos qué ocurrió" maxLength={500} /></div>
        <div className="space-y-2"><Label>Comentarios adicionales</Label><Textarea value={notes} onChange={event => setNotes(event.target.value)} placeholder="Información adicional (opcional)" maxLength={1000} /></div>
        <Button className="w-full" disabled={pending} onClick={submit}>{pending ? 'Enviando…' : 'Enviar solicitud'}</Button>
      </div>
    </div>
  );
}
