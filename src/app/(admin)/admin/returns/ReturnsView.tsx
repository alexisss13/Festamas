'use client';

import { useState, useTransition } from 'react';
import { RotateCcw, Check, X, Clock, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { processReturnRequest, updateReturnRequest } from '@/actions/returns';
import { toast } from 'sonner';

type RequestItem = {
  id: string;
  type: 'RETURN' | 'EXCHANGE';
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED';
  reason: string;
  notes: string | null;
  refundAmount: number | null;
  createdAt: string | Date;
  order: { id: string; receiptNumber: string | null; clientName: string; totalAmount: unknown; branchId: string | null };
  items: Array<{ productName: string; variantName: string | null; quantity: number; price: number }>;
};

const statusLabel = { PENDING: 'Pendiente', APPROVED: 'Aprobada', REJECTED: 'Rechazada', COMPLETED: 'Completada' };

export function ReturnsView({ initialRequests }: { initialRequests: RequestItem[] }) {
  const [requests, setRequests] = useState(initialRequests);
  const [pending, startTransition] = useTransition();
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [refundAmounts, setRefundAmounts] = useState<Record<string, string>>({});

  const update = (id: string, status: RequestItem['status']) => {
    startTransition(async () => {
      const result = status === 'COMPLETED'
        ? await processReturnRequest({ id, refundAmount: refundAmounts[id] ? Number(refundAmounts[id]) : undefined })
        : await updateReturnRequest({ id, status, notes: notes[id] });
      if (!result.success) {
        toast.error(result.message);
        return;
      }
      setRequests(current => current.map(request => request.id === id ? { ...request, status } : request));
      toast.success('Solicitud actualizada');
    });
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2"><RotateCcw className="h-6 w-6 text-primary" /> Cambios y devoluciones</h1>
        <p className="text-sm text-slate-500 mt-1">Revisa solicitudes de clientes y registra la resolución operativa.</p>
      </div>

      {requests.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 p-12 text-center text-slate-500">No hay solicitudes pendientes.</div>
      ) : (
        <div className="space-y-4">
          {requests.map(request => (
            <div key={request.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-900">Pedido {request.order.receiptNumber || request.order.id.slice(0, 8).toUpperCase()}</p>
                  <p className="text-sm text-slate-500">{request.order.clientName} · {request.type === 'RETURN' ? 'Devolución' : 'Cambio'}</p>
                </div>
                <Badge variant="outline" className="w-fit gap-1"><Clock className="h-3 w-3" /> {statusLabel[request.status]}</Badge>
              </div>
              <p className="text-sm text-slate-700"><strong>Motivo:</strong> {request.reason}</p>
              <div className="text-sm text-slate-600 space-y-1">
                {request.items.map((item, index) => <p key={index}>{item.quantity} × {item.productName}{item.variantName ? ` (${item.variantName})` : ''}</p>)}
              </div>
              {request.status !== 'COMPLETED' && request.status !== 'REJECTED' && (
                <div className="space-y-3 border-t border-slate-100 pt-3">
                  <Textarea placeholder="Nota interna o indicación para el cliente" value={notes[request.id] ?? ''} onChange={event => setNotes(current => ({ ...current, [request.id]: event.target.value }))} />
                  {request.status === 'APPROVED' && request.type === 'RETURN' && (
                    <div className="max-w-xs"><label className="text-xs font-semibold text-slate-600">Importe a reembolsar (opcional)</label><input type="number" min="0" step="0.01" value={refundAmounts[request.id] ?? ''} onChange={event => setRefundAmounts(current => ({ ...current, [request.id]: event.target.value }))} placeholder="Importe completo por defecto" className="mt-1 h-9 w-full rounded-lg border border-slate-200 px-3 text-sm" /></div>
                  )}
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" variant="outline" disabled={pending} onClick={() => update(request.id, 'APPROVED')}><Check className="h-4 w-4 mr-1" /> Aprobar</Button>
                    {request.status === 'APPROVED' && <Button size="sm" variant="outline" disabled={pending} onClick={() => update(request.id, 'COMPLETED')}><RefreshCw className="h-4 w-4 mr-1" /> Procesar reembolso/stock</Button>}
                    <Button size="sm" variant="outline" className="text-red-600" disabled={pending} onClick={() => update(request.id, 'REJECTED')}><X className="h-4 w-4 mr-1" /> Rechazar</Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
