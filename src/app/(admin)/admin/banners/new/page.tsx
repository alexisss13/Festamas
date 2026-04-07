import { getAdminBranch } from '@/actions/admin-settings';
import { getEcommerceContextFromCookie } from '@/lib/ecommerce-context';
import { BannerForm } from '@/components/admin/BannerForm';

export default async function NewBannerPage() {
  const branchId = await getAdminBranch();
  const { branches } = await getEcommerceContextFromCookie();
  
  const activeBranch = branches.find((b: any) => b.id === branchId) ?? branches[0];

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-white min-h-[calc(100vh-4rem)] flex justify-center">
      <BannerForm activeBranch={activeBranch} />
    </div>
  );
}