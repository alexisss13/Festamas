import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getAdminCatalogs } from '@/actions/catalogs';
import { getAdminDivision } from '@/actions/admin-settings';
import { CatalogsView } from './CatalogsView';
import { cn } from '@/lib/utils';
import { Division } from '@prisma/client';

export default async function AdminCatalogsPage() {
  const selectedDivision = await getAdminDivision();
  const { data: catalogs } = await getAdminCatalogs(); 
  
  const isFestamas = selectedDivision === 'JUGUETERIA';
  const filteredCatalogs = catalogs?.filter((c: any) => c.division === selectedDivision) || [];

  return (
    <div className="p-4 md:p-8 w-full max-w-7xl mx-auto">
      <div className="mb-6 md:mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">Catálogos Interactivos</h1>
          <p className="text-sm text-slate-500 mt-1">
            Organización: <span className={cn(
              "font-bold px-2 py-0.5 rounded-md text-xs uppercase",
              isFestamas ? "bg-festamas-primary/10 text-festamas-primary" : "bg-fiestasya-accent/10 text-fiestasya-accent"
            )}>{selectedDivision}</span>
          </p>
        </div>
      </div>

      <CatalogsView initialCatalogs={filteredCatalogs} division={selectedDivision} />
    </div>
  );
}
