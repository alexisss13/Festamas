import { getProductsForAdmin } from '@/actions/admin-products';
import { ProductsTable } from '@/components/admin/ProductsTable';
import { Package, Layers, ShoppingBag, LucideIcon } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { getAdminBranch } from '@/actions/admin-settings';
import { getEcommerceContextFromCookie } from '@/lib/ecommerce-context';

export default async function ProductsAdminPage() {
  const result = await getProductsForAdmin();
  const branchId = await getAdminBranch();
  const { branches } = await getEcommerceContextFromCookie();
  
  const activeBranch = branches.find(b => b.id === branchId) ?? branches[0];
  const storeName = activeBranch ? activeBranch.name : 'Tienda';

  if (!result.success) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {result.error}
        </div>
      </div>
    );
  }

  const products = result.products || [];

  // Componente de KPI card
  function StatCard({ 
    title, 
    value, 
    icon: Icon, 
    description
  }: { 
    title: string; 
    value: number; 
    icon: LucideIcon; 
    description: string;
  }) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs sm:text-sm font-semibold text-slate-600 leading-tight">{title}</span>
          <div className="p-2 sm:p-2.5 rounded-full bg-primary/10 shrink-0">
            <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
          </div>
        </div>
        <div className="text-2xl sm:text-3xl font-bold text-slate-900 tabular-nums">{value}</div>
        <p className="text-[10px] sm:text-xs text-slate-500 mt-1.5 font-medium leading-tight">{description}</p>
      </div>
    );
  }

  // Calcular estadísticas
  const stats = {
    total: products.length,
    available: products.filter((p: any) => p.isAvailable).length,
    variants: products.reduce((sum: number, p: any) => sum + p.variants.length, 0),
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 lg:space-y-8 bg-white min-h-[calc(100vh-4rem)]">
      
      {/* Header */}
      <div className="pb-2 lg:pb-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Gestión de <span className="text-primary">Productos</span>
            </h1>
            <p className="text-sm sm:text-base text-slate-500 mt-1 sm:mt-2">
              Edita la información de ecommerce de los productos de {storeName}.
            </p>
          </div>
        </div>
      </div>

      <Separator />

      {/* KPIs - Indicadores visuales */}
      <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Total Productos"
          value={stats.total}
          icon={Package}
          description="Productos activos"
        />
        <StatCard
          title="Disponibles"
          value={stats.available}
          icon={ShoppingBag}
          description="Visibles en tienda"
        />
        <StatCard
          title="Variantes"
          value={stats.variants}
          icon={Layers}
          description="Total de variantes"
        />
      </div>

      {/* Lista de productos */}
      <section>
        <ProductsTable products={products} />
      </section>

    </div>
  );
}
