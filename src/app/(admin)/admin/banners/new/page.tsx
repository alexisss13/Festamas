import { getAdminBranch } from '@/actions/admin-settings';
import { getEcommerceContextFromCookie } from '@/lib/ecommerce-context';
import { BannerForm } from '@/components/admin/BannerForm';

export default async function NewBannerPage() {
  const branchId = await getAdminBranch();
  const { branches } = await getEcommerceContextFromCookie();
  
  const activeBranch = branches.find((b: any) => b.id === branchId) ?? branches[0];

  return <BannerForm activeBranch={activeBranch} />;
}