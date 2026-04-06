import { getAdminBranch } from '@/actions/admin-settings';
import { getEcommerceContextFromCookie } from '@/lib/ecommerce-context';
import { AdminSidebar } from '@/components/admin/AdminSidebar';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { branches } = await getEcommerceContextFromCookie();
  const branchId = await getAdminBranch();
  
  const activeBranch = branches.find(b => b.id === branchId) ?? branches[0];
  
  // Determinamos el tema dinámicamente
  const activeTheme = 'festamas';

  return (
    <div className="flex min-h-screen bg-white overflow-x-hidden" data-theme={activeTheme}>
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