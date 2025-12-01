import { getDashboardStats, getSalesChartData, getRecentSales } from '@/actions/dashboard';
import { DashboardCard } from './DashboardCard';
import { Overview } from './Overview'; // 👈 Importar
import { RecentSales } from './RecentSales'; // 👈 Importar
import { CreditCard, Package, ShoppingCart, AlertTriangle } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default async function DashboardPage() {
  // Ejecutamos todo en paralelo para máxima velocidad
  const [statsRes, chartData, recentSales] = await Promise.all([
    getDashboardStats(),
    getSalesChartData(),
    getRecentSales()
  ]);

  const safeStats = statsRes.data || {
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

      {/* 1. TARJETAS KPI */}
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
          description="Órdenes registradas"
        />
        <DashboardCard 
          title="Productos Activos"
          value={safeStats.productsCount}
          icon={Package}
          description="En catálogo"
        />
        <DashboardCard 
          title="Bajo Stock"
          value={safeStats.lowStockProducts}
          icon={AlertTriangle}
          description="Menos de 5 unidades"
        />
      </div>

      {/* 2. GRÁFICOS Y LISTAS */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        
        {/* GRÁFICO (Ocupa 4 columnas) */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Resumen de Ventas</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <Overview data={chartData} />
          </CardContent>
        </Card>

        {/* ÚLTIMAS VENTAS (Ocupa 3 columnas) */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Ventas Recientes</CardTitle>
            <p className="text-sm text-slate-500">Últimas 5 transacciones pagadas.</p>
          </CardHeader>
          <CardContent>
            <RecentSales sales={recentSales} />
          </CardContent>
        </Card>

      </div>
    </div>
  );
}