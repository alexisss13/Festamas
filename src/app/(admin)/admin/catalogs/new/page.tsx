import { getAdminDivision } from '@/actions/admin-settings';
import { CatalogForm } from '@/components/admin/CatalogForm';

export default async function NewCatalogPage() {
  const division = await getAdminDivision();

  return (
    <div className="p-4 md:p-8 flex justify-center">
      <CatalogForm defaultDivision={division} />
    </div>
  );
}
