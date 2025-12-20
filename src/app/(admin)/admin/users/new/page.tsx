import { getAdminDivision } from '@/actions/admin-settings';
import { UserForm } from '@/components/admin/UserForm';

export default async function NewUserPage() {
  const division = await getAdminDivision();

  return (
    <div className="p-4 md:p-8">
      <UserForm currentDivision={division} />
    </div>
  );
}