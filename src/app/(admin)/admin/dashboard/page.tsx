import { getDashboardStats } from '@/actions/dashboard';
import { DashboardCard } from './DashboardCard';
import { CreditCard, Package, ShoppingCart, AlertTriangle } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export default async function DashboardPage() {
  const { data: stats } = await getDashboardStats();

  // Si falla, mostramos ceros para no romper la UI
  const safeStats = stats || {
    totalRevenue: 0,
    ordersCount: 0,
    productsCount: 0,
    lowStockProducts: 0
  };

  const formatPrice = (value: number) =>
    new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
    }).format(value);

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard</h1>
        <p className="text-slate-500">Resumen general de tu negocio.</p>
      </div>

      <Separator />

      {/* GRILLA DE TARJETAS */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        
        <DashboardCard 
          title="Ingresos Totales (Pagados)"
          value={formatPrice(safeStats.totalRevenue)}
          icon={CreditCard}
          description="Suma de pedidos completados"
        />

        <DashboardCard 
          title="Pedidos Totales"
          value={safeStats.ordersCount}
          icon={ShoppingCart}
          description="Órdenes registradas en sistema"
        />

        <DashboardCard 
          title="Productos Activos"
          value={safeStats.productsCount}
          icon={Package}
          description="En tu catálogo público"
        />

        <DashboardCard 
          title="Bajo Stock"
          value={safeStats.lowStockProducts}
          icon={AlertTriangle}
          description="Productos con menos de 5 unidades"
        />

      </div>

      {/* AQUÍ PODRÍAMOS PONER UN GRÁFICO LUEGO */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Espacio reservado para futuros gráficos */}
        <div className="col-span-4 rounded-xl border bg-slate-50/50 p-10 text-center text-slate-400 border-dashed">
            Gráfico de Ventas (Próximamente)
        </div>
        <div className="col-span-3 rounded-xl border bg-slate-50/50 p-10 text-center text-slate-400 border-dashed">
            Últimas Ventas (Próximamente)
        </div>
      </div>
    </div>
  );
}