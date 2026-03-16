import Image from 'next/image';
import { getDashboardStats, getSalesChartData, getRecentSales, getTopProducts, getLogisticsStats, getOrderStatuses } from '@/actions/dashboard';
import { DashboardCard } from './DashboardCard';
import { SalesOverview } from './SalesOverview';
import { RecentSales } from './RecentSales'; 
import { CreditCard, Package, ShoppingCart, AlertTriangle, Ticket, Truck, Store, ClipboardList, Image as ImageIcon } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { cookies } from 'next/headers';
import { Division } from '@prisma/client';
import { cn } from '@/lib/utils';

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const currentDivision = (cookieStore.get('admin_division')?.value as Division) || 'JUGUETERIA';
  const isFiestas = currentDivision === 'FIESTAS';
  const storeName = isFiestas ? 'FiestasYa' : 'Festamas';

  // Ejecutamos TODO en paralelo (agregamos getOrderStatuses)
  const [statsRes, chartData, recentSales, topProducts, logistics, orderStatuses] = await Promise.all([
    getDashboardStats(currentDivision),
    getSalesChartData(currentDivision),
    getRecentSales(currentDivision),
    getTopProducts(currentDivision),
    getLogisticsStats(currentDivision),
    getOrderStatuses(currentDivision)
  ]);

  const safeStats = statsRes.data || {
    totalRevenue: 0,
    ordersCount: 0,
    productsCount: 0,
    lowStockProducts: 0,
    activeCoupons: 0,
    activeBanners: 0,
    activeSections: 0
  };

  const formatPrice = (value: number) =>
    new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(value);

  const formatStatNumber = (num: number) => (num > 9 ? num : `0${num}`);

  return (
    <div 
      key={currentDivision}
      className="p-4 sm:p-6 lg:p-8 space-y-6 lg:space-y-8 bg-slate-50/50 min-h-[calc(100vh-4rem)]"
      data-theme={isFiestas ? 'fiestasya' : ''}
    >
      <div className="pb-2 lg:pb-4">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
          Dashboard <span className="text-primary">{storeName}</span>
        </h1>
        <p className="text-sm sm:text-base text-slate-500 mt-1 sm:mt-2">Resumen general y rendimiento de tu tienda activa.</p>
      </div>

      <Separator />

      {/* 1. TARJETAS KPI */}
      <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
        <DashboardCard title="Ingresos Totales" value={formatPrice(safeStats.totalRevenue)} icon={CreditCard} description="Suma de pedidos pagados" />
        <DashboardCard title="Pedidos Totales" value={safeStats.ordersCount} icon={ShoppingCart} description="Órdenes registradas" />
        <DashboardCard title="Productos Activos" value={safeStats.productsCount} icon={Package} description="En catálogo" />
        <DashboardCard title="Bajo Stock" value={safeStats.lowStockProducts} icon={AlertTriangle} description="Menos de 5 unidades" />
      </div>

      {/* 2. GRÁFICOS Y LISTAS */}
      <div className="grid gap-4 lg:grid-cols-7">
        <Card className="lg:col-span-4 border-slate-200 shadow-sm bg-white">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base sm:text-lg text-slate-800">Resumen de Datos</CardTitle>
                <CardDescription className="text-xs sm:text-sm">Últimos 7 días</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pl-2">
            <SalesOverview chartData={chartData} logistics={logistics} />
          </CardContent>
        </Card>

        <Card className="lg:col-span-3 border-slate-200 shadow-sm bg-white">
          <CardHeader>
            <CardTitle className="text-base sm:text-lg text-slate-800">Ventas Recientes</CardTitle>
            <CardDescription className="text-xs sm:text-sm">Últimas 5 transacciones pagadas.</CardDescription>
          </CardHeader>
          <CardContent>
            <RecentSales sales={recentSales} />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-7">
        
        {/* TOP PRODUCTOS */}
        <Card className="lg:col-span-4 border-slate-200 shadow-sm bg-white">
          <CardHeader>
            <CardTitle className="text-base sm:text-lg text-slate-800">Top Productos</CardTitle>
            <CardDescription className="text-xs sm:text-sm">Los artículos con mayor rotación en {storeName}.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="flex flex-col">
              {topProducts.map((product, index) => (
                <div key={product.id} className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-slate-50 last:border-0 hover:bg-slate-50/80 transition-colors group">
                  <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                    <div className="relative flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-slate-100 border border-slate-200 shrink-0 overflow-hidden">
                      <div className="absolute top-0 left-0 w-5 h-5 bg-primary text-white text-[10px] font-bold flex items-center justify-center rounded-br-lg z-10 shadow-sm">
                        {index + 1}
                      </div>
                      {product.images && product.images.length > 0 ? (
                        <Image src={product.images[0]} alt={product.title} fill className="object-cover transition-transform group-hover:scale-105" sizes="48px" />
                      ) : (
                        <ImageIcon className="w-4 h-4 sm:w-5 sm:h-5 text-slate-300" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-slate-900 text-xs sm:text-sm line-clamp-1 group-hover:text-primary transition-colors">{product.title}</p>
                        {!product.isAvailable && product.stock === 0 && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-medium bg-red-100 text-red-700 border border-red-200">
                            Sin stock
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5">Stock: {product.stock} u.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 sm:gap-4 md:gap-8 shrink-0 ml-3 sm:ml-4">
                    <div className="text-right hidden sm:block">
                      <p className="text-[10px] md:text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-0.5">Ingresos</p>
                      <p className="font-semibold text-slate-700 text-xs sm:text-sm">{formatPrice(product.price * product._count.orderItems)}</p>
                    </div>
                    <div className="text-right min-w-[2.5rem] sm:min-w-[3rem]">
                      <p className="text-[10px] md:text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-0.5">Unidades</p>
                      <p className="font-semibold text-slate-700 text-xs sm:text-sm">{product._count.orderItems}</p>
                    </div>
                  </div>
                </div>
              ))}
              {topProducts.length === 0 && (
                <div className="h-[300px] flex flex-col items-center justify-center">
                  <Package className="w-10 h-10 sm:w-12 sm:h-12 text-slate-200 mb-3" />
                  <p className="text-xs sm:text-sm font-medium text-slate-500">Aún no hay suficientes datos de ventas.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* COLUMNA DERECHA: RESUMEN OPERATIVO */}
        <Card className="lg:col-span-3 border-slate-200 shadow-sm bg-white">
          <CardHeader>
            <CardTitle className="text-base sm:text-lg text-slate-800">Resumen Operativo</CardTitle>
            <CardDescription className="text-xs sm:text-sm">Métricas clave de contenido y órdenes.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            
            {/* CONTENIDO */}
            <div className="space-y-2">
              <h4 className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider">Contenido Activo</h4>
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-xs sm:text-sm text-slate-600">Banners Activos</span>
                <span className="text-sm sm:text-base font-bold text-slate-900">{formatStatNumber(safeStats.activeBanners)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-xs sm:text-sm text-slate-600">Secciones Home</span>
                <span className="text-sm sm:text-base font-bold text-slate-900">{formatStatNumber(safeStats.activeSections)}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-xs sm:text-sm text-slate-600">Cupones Vigentes</span>
                <span className="text-sm sm:text-base font-bold text-slate-900">{formatStatNumber(safeStats.activeCoupons)}</span>
              </div>
            </div>

            {/* ÓRDENES */}
            <div className="space-y-2 pt-2">
              <h4 className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider">Estado de Órdenes</h4>
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-xs sm:text-sm text-slate-600">Por Pagar</span>
                <span className="text-sm sm:text-base font-bold text-slate-900">{formatStatNumber(orderStatuses.PENDING)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-xs sm:text-sm text-slate-600">Por Entregar</span>
                <span className="text-sm sm:text-base font-bold text-slate-900">{formatStatNumber(orderStatuses.PAID)}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-xs sm:text-sm text-slate-600">Completadas</span>
                <span className="text-sm sm:text-base font-bold text-slate-900">{formatStatNumber(orderStatuses.DELIVERED)}</span>
              </div>
            </div>

          </CardContent>
        </Card>

      </div>
    </div>
  );
}