import { getAdminBranch } from '@/actions/admin-settings';
import { SectionForm } from '@/components/admin/SectionForm';

export default async function NewSectionPage() {
  const branchId = await getAdminBranch();

  return (
    <div className="p-4 md:p-8 flex justify-center">
      <SectionForm defaultBranchId={branchId ?? undefined} />
    </div>
  );
}