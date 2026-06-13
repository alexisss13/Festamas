import { Plus, BookOpen, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { StatCard } from '@/components/admin/StatCard';
import { getAdminCatalogs } from '@/actions/catalogs';
import { getAdminBranch } from '@/actions/admin-settings';
import { getEcommerceContextFromCookie } from '@/lib/ecommerce-context';
import { CatalogsView } from './CatalogsView';
import Link from 'next/link';

export default async function AdminCatalogsPage() {
  const branchId = await getAdminBranch();
  const { data: catalogs } = await getAdminCatalogs(); 
  const { branches } = await getEcommerceContextFromCookie();
  
  const activeBranch = branches.find((b: any) => b.id === branchId) ?? branches[0];
  const storeName = activeBranch ? activeBranch.name : 'Tienda';
  const filteredCatalogs = catalogs?.filter((c: any) => c.branchId === activeBranch?.id) || [];

  // Calcular estadísticas
  const stats = {
    total: filteredCatalogs.length,
    active: filteredCatalogs.filter((c: any) => c.isActive).length,
    inactive: filteredCatalogs.filter((c: any) => !c.isActive).length,
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 lg:space-y-8 bg-white min-h-[calc(100vh-4rem)]">
      
      {/* Header */}
      <div className="pb-2 lg:pb-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Gestión de <span className="text-primary">Catálogos</span>
            </h1>
            <p className="text-sm sm:text-base text-slate-500 mt-1 sm:mt-2">
              Administra los catálogos interactivos de {storeName}.
            </p>
          </div>
          
          <Button 
            asChild 
            className="w-full md:w-auto h-10 sm:h-11 px-4 sm:px-6 shadow-sm transition-all active:scale-[0.98] text-white font-semibold bg-primary hover:bg-primary/90"
          >
            <Link href="/admin/catalogs/new">
              <Plus className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
              Nuevo Catálogo
            </Link>
          </Button>
        </div>
      </div>

      <Separator />

      {/* KPIs - Indicadores visuales */}
      <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Total Catálogos"
          value={stats.total}
          icon={BookOpen}
          description="Catálogos creados"
        />
        <StatCard
          title="Activos"
          value={stats.active}
          icon={Eye}
          description="Visibles en tienda"
        />
        <StatCard
          title="Inactivos"
          value={stats.inactive}
          icon={EyeOff}
          description="Ocultos"
        />
      </div>

      {/* Lista de catálogos */}
      <section>
        <CatalogsView initialCatalogs={filteredCatalogs} activeBranch={activeBranch} />
      </section>

    </div>
  );
}
