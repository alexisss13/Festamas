import Image from 'next/image';
import { Eye, ShoppingBag, TrendingUp, Image as ImageIcon } from 'lucide-react';
import { getProductPerformance } from '@/actions/dashboard';
import { getAdminBranch } from '@/actions/admin-settings';
import { getEcommerceContextFromCookie } from '@/lib/ecommerce-context';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const formatPrice = (value: number) => new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(value);
const formatPercent = (value: number | null) => value === null ? '—' : `${(value * 100).toFixed(1)}%`;

export default async function MarketingPerformancePage() {
  const branchId = await getAdminBranch();
  const { branches } = await getEcommerceContextFromCookie();
  const activeBranch = branches.find((b: { id: string }) => b.id === branchId) ?? branches[0];

  const products = await getProductPerformance(activeBranch.id);
  const totalViews = products.reduce((sum, p) => sum + p.viewCount, 0);
  const totalSold = products.reduce((sum, p) => sum + p.unitsSold, 0);
  const overallConversion = totalViews > 0 ? totalSold / totalViews : null;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 lg:space-y-8 bg-white min-h-[calc(100vh-4rem)]">
      <div className="pb-2 lg:pb-4">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">Rendimiento de catálogo</h1>
        <p className="text-sm sm:text-base text-slate-500 mt-1 sm:mt-2">
          Qué tanto se mira cada producto y cuánto de eso se convierte en venta — con datos propios, sin depender de servicios externos.
        </p>
      </div>

      <Separator />

      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-3">
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="pt-6 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0"><Eye className="w-5 h-5 text-slate-600" /></div>
            <div>
              <p className="text-xs text-slate-500">Vistas totales</p>
              <p className="text-xl font-bold text-slate-900">{totalViews}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="pt-6 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0"><ShoppingBag className="w-5 h-5 text-slate-600" /></div>
            <div>
              <p className="text-xs text-slate-500">Unidades vendidas</p>
              <p className="text-xl font-bold text-slate-900">{totalSold}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="pt-6 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0"><TrendingUp className="w-5 h-5 text-slate-600" /></div>
            <div>
              <p className="text-xs text-slate-500">Conversión general</p>
              <p className="text-xl font-bold text-slate-900">{formatPercent(overallConversion)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-slate-200 shadow-sm bg-white">
        <CardHeader>
          <CardTitle className="text-base sm:text-lg text-slate-800">Vistas y conversión por producto</CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Ordenado por vistas — quién atrae la mirada pero no vende puede necesitar mejor precio, fotos o descripción.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="flex flex-col">
            {products.map((product) => (
              <div key={product.id} className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-slate-50 last:border-0 hover:bg-slate-50/80 transition-colors">
                <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                  <div className="relative flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-slate-100 border border-slate-200 shrink-0 overflow-hidden">
                    {product.images?.[0] ? (
                      <Image src={product.images[0]} unoptimized alt={product.title} fill className="object-cover" sizes="48px" />
                    ) : (
                      <ImageIcon className="w-4 h-4 sm:w-5 sm:h-5 text-slate-300" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 text-xs sm:text-sm line-clamp-1">{product.title}</p>
                    {!product.isAvailable && (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-medium bg-red-100 text-red-700 border border-red-200">
                        No disponible
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3 sm:gap-6 md:gap-8 shrink-0 ml-3 sm:ml-4">
                  <div className="text-right hidden sm:block">
                    <p className="text-[10px] md:text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-0.5">Vistas</p>
                    <p className="font-semibold text-slate-700 text-xs sm:text-sm">{product.viewCount}</p>
                  </div>
                  <div className="text-right hidden sm:block">
                    <p className="text-[10px] md:text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-0.5">Vendidos</p>
                    <p className="font-semibold text-slate-700 text-xs sm:text-sm">{product.unitsSold}</p>
                  </div>
                  <div className="text-right min-w-[3.5rem]">
                    <p className="text-[10px] md:text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-0.5">Conversión</p>
                    <p className="font-semibold text-slate-700 text-xs sm:text-sm">{formatPercent(product.conversionRate)}</p>
                  </div>
                  <div className="text-right min-w-[4rem] hidden md:block">
                    <p className="text-[10px] md:text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-0.5">Ingresos</p>
                    <p className="font-semibold text-slate-700 text-xs sm:text-sm">{formatPrice(product.revenue)}</p>
                  </div>
                </div>
              </div>
            ))}
            {products.length === 0 && (
              <div className="h-[300px] flex flex-col items-center justify-center">
                <Eye className="w-10 h-10 sm:w-12 sm:h-12 text-slate-200 mb-3" />
                <p className="text-xs sm:text-sm font-medium text-slate-500">Aún no hay productos activos con datos suficientes.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <p className="text-xs text-slate-400">
        No incluye de dónde viene el tráfico (Instagram, Google, etc.) — eso requeriría conectar Google Analytics o Meta,
        que hoy no está configurado. Esto es solo con datos propios de la tienda.
      </p>
    </div>
  );
}
