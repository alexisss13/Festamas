import Link from 'next/link';
import { Plus, Layers, Eye, EyeOff, LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { getHomeSections } from '@/actions/home-sections';
import { getAdminBranch } from '@/actions/admin-settings';
import { getEcommerceContextFromCookie } from '@/lib/ecommerce-context';
import { SectionList } from '@/components/admin/SectionList';

export default async function AdminSectionsPage() {
  const branchId = await getAdminBranch();
  const { branches } = await getEcommerceContextFromCookie();
  
  const activeBranch = branches.find((b: any) => b.id === branchId) ?? branches[0];
  const storeName = activeBranch ? activeBranch.name : 'Tienda';

  // Obtener todas las secciones (activas e inactivas)
  const { sections } = await getHomeSections(activeBranch?.id || '', false);

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
    total: sections?.length || 0,
    active: sections?.filter((s: any) => s.isActive).length || 0,
    inactive: sections?.filter((s: any) => !s.isActive).length || 0,
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 lg:space-y-8 bg-white min-h-[calc(100vh-4rem)]">
      
      {/* Header */}
      <div className="pb-2 lg:pb-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Gestión de <span className="text-primary">Secciones Home</span>
            </h1>
            <p className="text-sm sm:text-base text-slate-500 mt-1 sm:mt-2">
              Administra las secciones de la página principal de {storeName}.
            </p>
          </div>
          
          <Button 
            asChild 
            className="w-full md:w-auto h-10 sm:h-11 px-4 sm:px-6 shadow-sm transition-all active:scale-[0.98] text-white font-semibold bg-primary hover:bg-primary/90"
          >
            <Link href="/admin/sections/new">
              <Plus className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
              Nueva Sección
            </Link>
          </Button>
        </div>
      </div>

      <Separator />

      {/* KPIs - Indicadores visuales */}
      <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Total Secciones"
          value={stats.total}
          icon={Layers}
          description="Secciones creadas"
        />
        <StatCard
          title="Activas"
          value={stats.active}
          icon={Eye}
          description="Visibles en home"
        />
        <StatCard
          title="Inactivas"
          value={stats.inactive}
          icon={EyeOff}
          description="Ocultas"
        />
      </div>

      {/* Lista de secciones */}
      <section>
        <SectionList sections={sections || []} branchId={activeBranch?.id} />
      </section>

    </div>
  );
}