import { getOrders } from '@/actions/order';
import { OrdersView } from './OrdersView';
import { ExportButton } from './ExportButton';
import { Separator } from '@/components/ui/separator';
import { ShoppingCart, Truck, Clock, CheckCircle2, LucideIcon } from 'lucide-react';

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
      product: {
        ...item.product,
        price: Number(item.product.price),
        wholesalePrice: item.product.wholesalePrice 
          ? Number(item.product.wholesalePrice) 
          : 0,
        // 👇 SOLUCIÓN AL ERROR: Convertimos 'cost' que venía como Decimal
        cost: item.product.cost 
          ? Number(item.product.cost) 
          : 0, 
      },
    })),
  }));

  // Componente de KPI card inline
  function StatCard({ title, value, icon: Icon, description }: { title: string; value: number; icon: LucideIcon; description: string }) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-sm hover:shadow-md hover:border-primary/20 transition-all">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs sm:text-sm font-semibold text-slate-600 leading-tight">{title}</span>
          <div className="p-2 sm:p-2.5 rounded-full bg-primary/10 shrink-0">
            <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
          </div>
        </div>
        <div className="text-xl sm:text-2xl font-bold text-slate-900">{value}</div>
        <p className="text-[10px] sm:text-xs text-slate-500 mt-1 font-medium">{description}</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 lg:space-y-8 bg-slate-50/50 min-h-[calc(100vh-4rem)] [&_::selection]:bg-slate-200 [&_::selection]:text-slate-900">

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
        <StatCard
          title="Total Pedidos"
          value={plainOrders.length}
          icon={ShoppingCart}
          description="Órdenes registradas"
        />
        <StatCard
          title="Por Despachar"
          value={plainOrders.filter((o: any) => o.isPaid && o.status === 'PENDING').length}
          icon={Truck}
          description="Pagados sin enviar"
        />
        <StatCard
          title="Por Pagar"
          value={plainOrders.filter((o: any) => !o.isPaid && o.status !== 'CANCELLED').length}
          icon={Clock}
          description="Sin confirmar pago"
        />
        <StatCard
          title="Completados"
          value={plainOrders.filter((o: any) => o.status === 'DELIVERED').length}
          icon={CheckCircle2}
          description="Pedidos entregados"
        />
      </div>

      {/* Tabla de pedidos */}
      <section>
        <OrdersView orders={plainOrders} />
      </section>

    </div>
  );
}