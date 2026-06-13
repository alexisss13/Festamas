import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type TrackingEvent = {
  id: string;
  status: string;
  description: string;
  location?: string | null;
  createdAt: Date;
};

const STATUS_COLORS: Record<string, string> = {
  PENDING:          'bg-yellow-100 text-yellow-700 border-yellow-200',
  PAID:             'bg-blue-100 text-blue-700 border-blue-200',
  PROCESSING:       'bg-indigo-100 text-indigo-700 border-indigo-200',
  SHIPPED:          'bg-purple-100 text-purple-700 border-purple-200',
  READY_FOR_PICKUP: 'bg-teal-100 text-teal-700 border-teal-200',
  DELIVERED:        'bg-emerald-100 text-emerald-700 border-emerald-200',
  CANCELLED:        'bg-red-100 text-red-700 border-red-200',
};

const STATUS_LABELS: Record<string, string> = {
  PENDING:          'Pendiente',
  PAID:             'Pagado',
  PROCESSING:       'En preparación',
  SHIPPED:          'Enviado',
  READY_FOR_PICKUP: 'Listo para recoger',
  DELIVERED:        'Entregado',
  CANCELLED:        'Cancelado',
};

const DOT_COLORS: Record<string, string> = {
  PENDING:          'bg-yellow-400',
  PAID:             'bg-blue-500',
  PROCESSING:       'bg-indigo-500',
  SHIPPED:          'bg-purple-500',
  READY_FOR_PICKUP: 'bg-teal-500',
  DELIVERED:        'bg-emerald-500',
  CANCELLED:        'bg-red-500',
};

interface Props {
  events: TrackingEvent[];
}

export function OrderTimeline({ events }: Props) {
  if (events.length === 0) return null;

  const formatDate = (date: Date) =>
    new Intl.DateTimeFormat('es-PE', { dateStyle: 'medium', timeStyle: 'short' }).format(date);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Historial del Pedido</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {events.map((event, index) => {
            const isLast = index === events.length - 1;
            const dotColor = DOT_COLORS[event.status] ?? 'bg-slate-400';
            const badgeClass = STATUS_COLORS[event.status] ?? 'bg-slate-100 text-slate-600 border-slate-200';
            const label = STATUS_LABELS[event.status] ?? event.status;

            return (
              <div key={event.id} className="flex gap-4 relative">
                {/* Línea vertical */}
                <div className="flex flex-col items-center shrink-0 w-4">
                  <div className={cn('w-3 h-3 rounded-full shrink-0 mt-1 ring-2 ring-white', dotColor)} />
                  {!isLast && <div className="w-px flex-1 bg-slate-200 my-1" />}
                </div>

                {/* Contenido */}
                <div className={cn('pb-6 flex-1 min-w-0', isLast && 'pb-0')}>
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-full border', badgeClass)}>
                      {label}
                    </span>
                    <span className="text-xs text-slate-400">{formatDate(event.createdAt)}</span>
                  </div>
                  <p className="text-sm text-slate-600">{event.description}</p>
                  {event.location && (
                    <p className="text-xs text-slate-400 mt-0.5">{event.location}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
