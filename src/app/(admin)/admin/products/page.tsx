import { getProductsForAdmin } from '@/actions/admin-products';
import { ProductsTable } from '@/components/admin/ProductsTable';
import { Globe, Monitor, Store, Tag, Percent, Info } from 'lucide-react';
import { getEcommerceContextFromCookie } from '@/lib/ecommerce-context';
import { getAdminBranch } from '@/actions/admin-settings';

export default async function ProductsAdminPage() {
  const result = await getProductsForAdmin();
  const branchId = await getAdminBranch();
  const { branches } = await getEcommerceContextFromCookie();
  const activeBranch = branches.find(b => b.id === branchId) ?? branches[0];

  if (!result.success) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {result.error}
        </div>
      </div>
    );
  }

  const products = (result.products ?? []) as any[];

  const stats = {
    total:    products.length,
    online:   products.filter((p: any) => p.availableChannels === 'BOTH' || p.availableChannels === 'ECOMMERCE').length,
    posOnly:  products.filter((p: any) => p.availableChannels === 'POS').length,
    discount: products.filter((p: any) => p.discountPercentage > 0).length,
    withTags: products.filter((p: any) => p.tags?.length > 0).length,
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 bg-white min-h-[calc(100vh-4rem)]">

      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
          Catálogo <span className="text-primary">E-commerce</span>
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Gestiona la presentación de productos en la tienda online de{' '}
          <strong>{activeBranch?.name}</strong>.
        </p>
      </div>

      {/* Info banner */}
      <div className="flex items-start gap-3 p-4 rounded-xl border border-blue-100 bg-blue-50/50 text-sm text-blue-800">
        <Info className="h-4 w-4 mt-0.5 flex-shrink-0 text-blue-500" />
        <p>
          Los <strong>precios, stock y variantes</strong> se gestionan desde el <strong>ERP Zaiko</strong>.
          Aquí administra <strong>visibilidad, descuentos, etiquetas y contenido</strong> para la tienda online.
        </p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Total</span>
            <Tag className="h-4 w-4 text-slate-300" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
          <p className="text-[11px] text-slate-400 mt-1">productos activos</p>
        </div>

        <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wide">Visibles</span>
            <Globe className="h-4 w-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-emerald-700">{stats.online}</p>
          <p className="text-[11px] text-emerald-600/70 mt-1">en la tienda online</p>
        </div>

        <div className="bg-red-50 border border-red-100 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-red-500 uppercase tracking-wide">Con Descuento</span>
            <Percent className="h-4 w-4 text-red-300" />
          </div>
          <p className="text-2xl font-bold text-red-600">{stats.discount}</p>
          <p className="text-[11px] text-red-400/70 mt-1">tienen oferta activa</p>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Solo POS</span>
            <Store className="h-4 w-4 text-slate-300" />
          </div>
          <p className="text-2xl font-bold text-slate-500">{stats.posOnly}</p>
          <p className="text-[11px] text-slate-400 mt-1">no visibles online</p>
        </div>
      </div>

      {/* Products table */}
      <ProductsTable products={products} />
    </div>
  );
}
