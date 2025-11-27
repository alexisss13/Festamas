import { getOrders } from '@/actions/order';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';

export default async function AdminOrdersPage() {
  const { success, data: orders } = await getOrders();

  if (!success || !orders) {
    return <div className="p-8">Error al cargar pedidos.</div>;
  }

  const formatPrice = (value: number) =>
    new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
    }).format(value);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('es-PE', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-900">Pedidos</h1>
        <Badge variant="outline" className="text-base px-4 py-1">
          Total: {orders.length}
        </Badge>
      </div>

      <div className="rounded-md border bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">ID</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-mono text-xs font-medium">
                  {order.id.split('-')[0].toUpperCase()}
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium text-slate-900">{order.clientName}</span>
                    <span className="text-xs text-slate-500">{order.clientPhone}</span>
                  </div>
                </TableCell>
                <TableCell>
                  {/* Lógica simple de Badges por estado */}
                  {order.status === 'PENDING' && (
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-none">
                      Pendiente
                    </Badge>
                  )}
                  {order.status === 'PAID' && (
                    <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100 border-none">
                      Pagado
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-slate-600">
                  {formatDate(order.createdAt)}
                </TableCell>
                <TableCell className="text-right font-bold text-slate-900">
                  {formatPrice(Number(order.totalAmount))}
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon">
                    <Eye className="h-4 w-4 text-slate-500" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}