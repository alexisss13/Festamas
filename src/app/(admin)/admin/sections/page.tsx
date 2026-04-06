import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getHomeSections } from '@/actions/home-sections';
import { getAdminBranch } from '@/actions/admin-settings';
import { getEcommerceContextFromCookie } from '@/lib/ecommerce-context';
import { SectionList } from '@/components/admin/SectionList';
import { cn } from '@/lib/utils';

export default async function AdminSectionsPage() {
  const branchId = await getAdminBranch();
  const { branches } = await getEcommerceContextFromCookie();
  
  const activeBranch = branches.find((b: any) => b.id === branchId) ?? branches[0];

  // Corregido: Pasamos el segundo parámetro 'false' para ver también las inactivas
  const { sections } = await getHomeSections(activeBranch?.id || '', false);

  return (
    <div className="p-4 md:p-8 w-full max-w-7xl mx-auto animate-in fade-in duration-500">
      {/* 📱 RESPONSIVE HEADER:
         - Mobile: Flex Column (Vertical), items alineados al inicio, gap pequeño.
         - Desktop (md): Flex Row (Horizontal), items alineados abajo, gap mayor.
      */}
      <div className="mb-6 md:mb-10 flex flex-col items-start gap-4 md:flex-row md:items-end md:justify-between">
        <div className="w-full md:w-auto">
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
            Secciones Home
          </h1>
          <p className="text-sm text-slate-500 mt-1 flex items-center gap-2">
            Organización: 
            <span className={cn(
              "font-bold px-2 py-0.5 rounded-md text-xs uppercase tracking-wider",
              "bg-primary/10 text-primary"
            )}>
              {activeBranch?.name || 'Tienda'}
            </span>
          </p>
        </div>
        
        {/* Botón Full Width en Móvil */}
        <Button 
          asChild 
          className={cn(
            "w-full md:w-auto h-11 px-6 shadow-md transition-all active:scale-[0.98] text-white font-bold",
            "bg-primary hover:bg-primary/90"
          )}
        >
          <Link href="/admin/sections/new">
            <Plus className="mr-2 h-5 w-5" />
            Nueva Sección
          </Link>
        </Button>
      </div>

      {/* Lista de Secciones (Ya es responsive internamente) */}
      <SectionList sections={sections || []} branchId={activeBranch?.id} />
    </div>
  );
}