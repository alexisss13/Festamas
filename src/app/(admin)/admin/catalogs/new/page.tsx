import { getAdminBranch } from '@/actions/admin-settings';
import { getEcommerceContextFromCookie } from '@/lib/ecommerce-context';
import { CatalogForm } from '@/components/admin/CatalogForm';

export default async function NewCatalogPage() {
  const branchId = await getAdminBranch();
  const { branches } = await getEcommerceContextFromCookie();
  
  const activeBranch = branches.find((b: any) => b.id === branchId) ?? branches[0];

  return (
    <div className="p-4 md:p-8 flex justify-center">
      <CatalogForm defaultBranchId={branchId ?? undefined} activeBranch={activeBranch} />
    </div>
  );
}
