import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { canAccessEcommerceAdmin } from '@/lib/permissions';
import { getAdminBranch } from '@/actions/admin-settings';
import { getEcommerceContextFromCookie } from '@/lib/ecommerce-context';
import { AdminSidebar } from '@/components/admin/AdminSidebar';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  // Not logged in → login
  if (!session?.user?.id) {
    redirect('/auth/login?returnTo=/admin/dashboard');
  }

  // Fetch fresh permissions from DB (ERP can change them without re-login)
  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true, permissions: true, isActive: true },
  });

  if (!dbUser?.isActive) {
    redirect('/auth/login?error=inactive');
  }

  const userForCheck = {
    role: dbUser.role,
    permissions: dbUser.permissions as Record<string, unknown> | null,
  };

  if (!canAccessEcommerceAdmin(userForCheck)) {
    redirect('/admin-denied');
  }

  const { branches } = await getEcommerceContextFromCookie();
  const branchId = await getAdminBranch();
  const activeBranch = branches.find(b => b.id === branchId) ?? branches[0];

  return (
    <div className="flex min-h-screen bg-white overflow-x-hidden">
      <AdminSidebar activeBranch={activeBranch} branches={branches} />

      <main
        id="admin-main-content"
        className="flex-1 min-w-0 overflow-x-hidden transition-all duration-300 ease-in-out p-8 pt-20 md:pt-8"
        style={{ marginLeft: '256px' }}
      >
        {children}
        <style>{`
          @media (max-width: 768px) {
            #admin-main-content { margin-left: 0 !important; }
          }
        `}</style>
      </main>
    </div>
  );
}
