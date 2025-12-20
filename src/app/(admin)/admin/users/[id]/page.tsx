import { notFound } from 'next/navigation';
import { getAdminUserById } from '@/actions/admin-users';
import { getAdminDivision } from '@/actions/admin-settings';
import { UserForm } from '@/components/admin/UserForm';

interface Props { params: Promise<{ id: string }> }

export default async function EditUserPage({ params }: Props) {
  const { id } = await params;
  const division = await getAdminDivision();
  
  const user = await getAdminUserById(id);
  
  if (!user) notFound();

  return (
    <div className="p-4 md:p-8">
        <UserForm user={user} currentDivision={division} />
    </div>
  );
}