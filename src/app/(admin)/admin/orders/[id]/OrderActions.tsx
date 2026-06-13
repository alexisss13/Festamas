'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Save, Package, Truck, CheckCircle, XCircle, Clock, CreditCard } from 'lucide-react';
import { OrderStatus } from '@prisma/client';
import { updateOrderStatus } from '@/actions/order';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const STATUS_FLOW: { id: OrderStatus; label: string; icon: any; color: string }[] = [
  { id: 'PENDING',          label: 'Pendiente',       icon: Clock,        color: 'text-amber-600'  },
  { id: 'PAID',             label: 'Pagado',           icon: CreditCard,   color: 'text-blue-600'   },
  { id: 'PROCESSING',       label: 'Procesando',       icon: Package,      color: 'text-indigo-600' },
  { id: 'SHIPPED',          label: 'Enviado',          icon: Truck,        color: 'text-purple-600' },
  { id: 'READY_FOR_PICKUP', label: 'Listo para recoger', icon: Package,   color: 'text-teal-600'   },
  { id: 'DELIVERED',        label: 'Entregado',        icon: CheckCircle,  color: 'text-emerald-600'},
  { id: 'CANCELLED',        label: 'Cancelado',        icon: XCircle,      color: 'text-red-600'    },
];

interface Props {
  orderId: string;
  initialStatus: OrderStatus;
  initialIsPaid: boolean;
  initialTracking?: string | null;
  initialCarrier?: string | null;
  initialCancelReason?: string | null;
}

export function OrderActions({
  orderId, initialStatus, initialIsPaid,
  initialTracking, initialCarrier, initialCancelReason,
}: Props) {
  const router = useRouter();
  const [status,       setStatus]       = useState<OrderStatus>(initialStatus);
  const [isPaid,       setIsPaid]       = useState(initialIsPaid);
  const [tracking,     setTracking]     = useState(initialTracking ?? '');
  const [carrier,      setCarrier]      = useState(initialCarrier ?? '');
  const [cancelReason, setCancelReason] = useState(initialCancelReason ?? '');
  const [loading,      setLoading]      = useState(false);

  const handleSave = async () => {
    setLoading(true);
    const result = await updateOrderStatus(orderId, status, isPaid, {
      trackingNumber: tracking || null,
      carrier:        carrier || null,
      cancelReason:   cancelReason || null,
    });
    if (result.success) {
      toast.success('Pedido actualizado');
      router.refresh();
    } else {
      toast.error('Error al actualizar el pedido');
    }
    setLoading(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gestionar Pedido</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">

        {/* STATE MACHINE */}
        <div className="space-y-2">
          <Label>Estado del pedido</Label>
          <div className="grid grid-cols-2 gap-2">
            {STATUS_FLOW.map(s => {
              const Icon = s.icon;
              const active = status === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => setStatus(s.id)}
                  disabled={loading}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-semibold transition-all',
                    active
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
                  )}
                >
                  <Icon className={cn('w-4 h-4 shrink-0', active ? 'text-white' : s.color)} />
                  {s.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* TRACKING (visible when SHIPPED) */}
        {status === 'SHIPPED' && (
          <div className="space-y-3 p-4 bg-purple-50 border border-purple-100 rounded-xl">
            <p className="text-xs font-bold text-purple-700 uppercase tracking-wider">Información de envío</p>
            <div className="space-y-2">
              <Label className="text-xs">Empresa de transporte</Label>
              <input
                value={carrier}
                onChange={e => setCarrier(e.target.value)}
                placeholder="Ej: Olva Courier, DHL..."
                className="w-full h-9 px-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Número de tracking</Label>
              <input
                value={tracking}
                onChange={e => setTracking(e.target.value)}
                placeholder="Ej: OLVA123456789"
                className="w-full h-9 px-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200"
              />
            </div>
          </div>
        )}

        {/* CANCEL REASON (visible when CANCELLED) */}
        {status === 'CANCELLED' && (
          <div className="space-y-2 p-4 bg-red-50 border border-red-100 rounded-xl">
            <p className="text-xs font-bold text-red-700 uppercase tracking-wider">Motivo de cancelación</p>
            <textarea
              value={cancelReason}
              onChange={e => setCancelReason(e.target.value)}
              placeholder="Describe el motivo de la cancelación..."
              rows={2}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-200"
            />
          </div>
        )}

        {/* PAYMENT TOGGLE */}
        <div className="flex items-center justify-between rounded-xl border border-slate-200 p-4">
          <div>
            <Label className="text-sm font-semibold">Pagado</Label>
            <p className="text-xs text-slate-400 mt-0.5">Marcar si el pago fue recibido</p>
          </div>
          <Switch checked={isPaid} onCheckedChange={setIsPaid} disabled={loading} />
        </div>

        <Button
          onClick={handleSave}
          disabled={loading}
          className="w-full bg-slate-900 hover:bg-slate-800"
        >
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Guardar cambios
        </Button>

      </CardContent>
    </Card>
  );
}
