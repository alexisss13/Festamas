import { getOrders } from '@/actions/order';
import { OrdersView } from './OrdersView';
import { ExportButton } from './ExportButton';
import { Separator } from '@/components/ui/separator';
import { StatCard } from '@/components/admin/StatCard';
import { ShoppingCart, Truck, Clock, CheckCircle2, PackageCheck, Send, Store } from 'lucide-react';

export default async function AdminOrdersPage() {
  const { success, data: orders } = await getOrders();

  if (!success || !orders) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 text-center text-slate-500">
        Error al cargar los pedidos. Intenta recargar.
      </div>
    );
  }

  // Sanitización: Decimal de Prisma → Number de JS
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const plainOrders = orders.map((order: any) => ({
    ...order,
    totalAmount: Number(order.totalAmount),
    shippingCost: Number(order.shippingCost),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    orderItems: order.orderItems.map((item: any) => ({
      ...item,
      price: Number(item.price),
      product: item.product
        ? {
            ...item.product,
            price: Number(item.product.price),
            wholesalePrice: item.product.wholesalePrice
              ? Number(item.product.wholesalePrice)
              : 0,
            cost: item.product.cost
              ? Number(item.product.cost)
              : 0,
          }
        : null,
    })),
  }));

  // Calcular estadísticas
  const stats = {
    total:          plainOrders.length,
    toPay:          plainOrders.filter((o: any) => !o.isPaid && o.status === 'PENDING').length,
    toDispatch:     plainOrders.filter((o: any) => o.isPaid && o.status === 'PAID').length,
    processing:     plainOrders.filter((o: any) => o.status === 'PROCESSING').length,
    shipped:        plainOrders.filter((o: any) => o.status === 'SHIPPED').length,
    readyPickup:    plainOrders.filter((o: any) => o.status === 'READY_FOR_PICKUP').length,
    completed:      plainOrders.filter((o: any) => o.status === 'DELIVERED').length,
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 lg:space-y-8 bg-white min-h-[calc(100vh-4rem)] [&_::selection]:bg-slate-200 [&_::selection]:text-slate-900">

      {/* Header */}
      <div className="pb-2 lg:pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Gestión de <span className="text-primary">Pedidos</span>
          </h1>
          <p className="text-sm sm:text-base text-slate-500 mt-1 sm:mt-2">
            Gestiona, filtra y exporta las ventas de ambas tiendas.
          </p>
        </div>
      </div>

      <Separator />

      {/* KPIs */}
      <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Pedidos"   value={stats.total}       icon={ShoppingCart} description="Órdenes registradas" />
        <StatCard title="Por Pagar"       value={stats.toPay}       icon={Clock}        description="Esperando confirmación" />
        <StatCard title="Por Despachar"   value={stats.toDispatch}  icon={Truck}        description="Pagados, pendientes de envío" />
        <StatCard title="Completados"     value={stats.completed}   icon={CheckCircle2} description="Entregados exitosamente" />
      </div>
      {(stats.processing > 0 || stats.shipped > 0 || stats.readyPickup > 0) && (
        <div className="grid gap-3 sm:gap-4 grid-cols-3">
          <StatCard title="En Preparación" value={stats.processing}  icon={PackageCheck} description="Procesando pedido" />
          <StatCard title="Enviados"        value={stats.shipped}     icon={Send}         description="En camino al cliente" />
          <StatCard title="Listo Recoger"   value={stats.readyPickup} icon={Store}        description="Disponible en tienda" />
        </div>
      )}

      {/* Tabla de pedidos */}
      <section>
        <OrdersView orders={plainOrders} />
      </section>

    </div>
  );
}