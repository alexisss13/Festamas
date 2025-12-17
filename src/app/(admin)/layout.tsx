import { getAdminDivision } from '@/actions/admin-settings'; // 👈 Server Action
import { AdminSidebar } from '@/components/admin/AdminSidebar'; // 👈 Nuestro nuevo componente cliente

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 🍪 Obtenemos la división guardada en la cookie (Server Side)
  const division = await getAdminDivision();

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* SIDEBAR (Client Component con datos inyectados) */}
      <AdminSidebar currentDivision={division} />

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-1 md:ml-64 p-8">
        {children}
      </main>
    </div>
  );
}