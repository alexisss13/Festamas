import { getAdminBanners } from '@/actions/banners';
import { BannersManager } from '@/components/admin/BannersManager';
import { redirect } from 'next/navigation';

export default async function AdminBannersPage() {
  // Aquí podrías validar sesión de admin si tienes auth
  // const session = await auth();
  // if (session?.user.role !== 'ADMIN') redirect('/');

  const { success, data: banners } = await getAdminBanners();

  if (!success) {
    return <div>Error al cargar banners</div>;
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Gestión de Banners</h1>
        <p className="text-slate-500">Administra los carruseles de Festamas y FiestasYa.</p>
      </div>

      {/* Componente Cliente con toda la lógica */}
      <BannersManager initialBanners={banners || []} />
    </div>
  );
}