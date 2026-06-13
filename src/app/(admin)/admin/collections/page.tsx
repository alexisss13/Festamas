import { Layers, Eye, EyeOff } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { StatCard } from '@/components/admin/StatCard';
import { getAdminCollections } from '@/actions/collections';
import { CollectionsView } from './CollectionsView';

export default async function AdminCollectionsPage() {
  const { success, data: collections } = await getAdminCollections();

  if (!success || !collections) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 text-center text-slate-500">
        Error al cargar las colecciones. Intenta recargar.
      </div>
    );
  }

  const stats = {
    total:    collections.length,
    active:   collections.filter(c => c.active).length,
    inactive: collections.filter(c => !c.active).length,
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 lg:space-y-8 bg-white min-h-[calc(100vh-4rem)] [&_::selection]:bg-slate-200 [&_::selection]:text-slate-900">

      {/* Header */}
      <div className="pb-2 lg:pb-4">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
          Gestión de <span className="text-primary">Colecciones</span>
        </h1>
        <p className="text-sm sm:text-base text-slate-500 mt-1 sm:mt-2">
          Crea y administra colecciones de productos temáticas o estacionales.
        </p>
      </div>

      <Separator />

      {/* KPIs */}
      <div className="grid gap-3 sm:gap-4 grid-cols-3">
        <StatCard title="Total"    value={stats.total}    icon={Layers} description="Colecciones creadas" />
        <StatCard title="Activas"  value={stats.active}   icon={Eye}    description="Visibles en tienda" />
        <StatCard title="Ocultas"  value={stats.inactive} icon={EyeOff} description="No publicadas" />
      </div>

      {/* Table */}
      <section>
        <CollectionsView initialCollections={collections} />
      </section>
    </div>
  );
}
