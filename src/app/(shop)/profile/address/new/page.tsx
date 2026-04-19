import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { AddressForm } from '@/components/features/AddressForm';
import Link from 'next/link';
import { getEcommerceContextFromCookie } from '@/lib/ecommerce-context';

export const metadata = {
  title: 'Nueva Dirección | Festamas',
  description: 'Agrega una nueva dirección de entrega.',
};

export default async function NewAddressPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/auth/login?returnTo=/profile/address/new');
  }

  const { activeBranch } = await getEcommerceContextFromCookie();
  const brandColor = (activeBranch.brandColors as any)?.primary ?? '#fc4b65';

  return (
    <div className="min-h-screen bg-white">
      
      {/* BREADCRUMB Y TÍTULO */}
      <div className="border-b border-slate-200 bg-slate-50/50">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 py-4 md:py-6">
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-3">
            <Link href="/" className="hover:text-slate-900 transition-colors">
              Inicio
            </Link>
            <span>/</span>
            <Link href="/profile" className="hover:text-slate-900 transition-colors">
              Perfil
            </Link>
            <span>/</span>
            <Link href="/profile/address" className="hover:text-slate-900 transition-colors">
              Direcciones
            </Link>
            <span>/</span>
            <span className="text-slate-900 font-medium">Nueva Dirección</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
            Nueva Dirección
          </h1>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8">
        <AddressForm 
          address={null} 
          brandColor={brandColor}
        />
      </div>
    </div>
  );
}
