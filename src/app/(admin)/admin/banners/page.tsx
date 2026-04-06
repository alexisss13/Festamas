import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getAdminBanners } from '@/actions/banners';
import { getAdminBranch } from '@/actions/admin-settings';
import { getEcommerceContextFromCookie } from '@/lib/ecommerce-context';
import { BannerList } from '@/components/admin/BannerList';
import { cn } from '@/lib/utils';

export default async function AdminBannersPage() {
  const branchId = await getAdminBranch();
  const { branches } = await getEcommerceContextFromCookie();
  
  const activeBranch = branches.find(b => b.id === branchId) ?? branches[0];
  const { data: banners } = await getAdminBanners(); 
  
  const filteredBanners = banners?.filter(b => b.branchId === activeBranch?.id || !b.branchId) || [];

  return (
    <div className="p-4 md:p-8 w-full max-w-7xl mx-auto">
      <div className="mb-6 md:mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">Banners & Promociones</h1>
          <p className="text-sm text-slate-500 mt-1">
            Organización: <span className={cn(
              "font-bold px-2 py-0.5 rounded-md text-xs uppercase bg-primary/10 text-primary"
            )}>{activeBranch?.name}</span>
          </p>
        </div>
        
        <Button 
          asChild 
          className={cn(
            "w-full md:w-auto h-11 px-6 shadow-lg transition-all active:scale-[0.98] text-white font-bold bg-primary hover:bg-primary/90"
          )}
        >
          <Link href="/admin/banners/new">
            <Plus className="mr-2 h-5 w-5" />
            Nuevo Banner
          </Link>
        </Button>
      </div>

      <BannerList initialBanners={filteredBanners} activeBranch={activeBranch} />
    </div>
  );
}