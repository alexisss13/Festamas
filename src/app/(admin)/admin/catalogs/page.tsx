import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getAdminCatalogs } from '@/actions/catalogs';
import { getAdminBranch } from '@/actions/admin-settings';
import { getEcommerceContextFromCookie } from '@/lib/ecommerce-context';
import { CatalogsView } from './CatalogsView';
import { cn } from '@/lib/utils';

export default async function AdminCatalogsPage() {
  const branchId = await getAdminBranch();
  const { data: catalogs } = await getAdminCatalogs(); 
  const { branches } = await getEcommerceContextFromCookie();
  
  const activeBranch = branches.find((b: any) => b.id === branchId) ?? branches[0];
  const filteredCatalogs = catalogs?.filter((c: any) => c.branchId === activeBranch?.id) || [];

  return (
    <div className="p-4 md:p-8 w-full max-w-7xl mx-auto">
      <div className="mb-6 md:mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">Catálogos Interactivos</h1>
          <p className="text-sm text-slate-500 mt-1">
            Organización: <span className={cn(
              "font-bold px-2 py-0.5 rounded-md text-xs uppercase",
              "bg-primary/10 text-primary"
            )}>{activeBranch?.name || 'Tienda'}</span>
          </p>
        </div>
      </div>

      <CatalogsView initialCatalogs={filteredCatalogs} activeBranch={activeBranch} />
    </div>
  );
}
