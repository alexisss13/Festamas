import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { MapPin, Plus, Edit2 } from 'lucide-react';
import { DeleteAddressButton } from '@/components/profile/DeleteAddressButton';
import { getEcommerceContextFromCookie } from '@/lib/ecommerce-context';

export const metadata = {
  title: 'Mis Direcciones | Festamas',
  description: 'Gestiona tus direcciones de entrega.',
};

export default async function AddressesPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/auth/login?returnTo=/profile/address');
  }

  // Obtener todas las direcciones del usuario
  const addresses = await prisma.address.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
  });

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
            <span className="text-slate-900 font-medium">Mis Direcciones</span>
          </div>
          <div className="flex items-center justify-between">
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
              Mis Direcciones
            </h1>
            <Link href="/profile/address/new">
              <Button 
                className="h-10 text-[13px] gap-2"
                style={{ backgroundColor: brandColor }}
              >
                <Plus className="w-4 h-4" />
                Nueva Dirección
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8">
        {addresses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {addresses.map((address) => (
              <div 
                key={address.id} 
                className="p-5 bg-white border border-slate-200 rounded-xl hover:border-slate-300 transition-all group"
              >
                <div className="flex items-start gap-3 mb-4">
                  <div className="p-2 bg-slate-50 rounded-lg group-hover:bg-slate-100 transition-colors">
                    <MapPin className="w-4 h-4 text-slate-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-semibold text-slate-900 mb-1">
                      {address.address}
                    </p>
                    {address.address2 && (
                      <p className="text-[12px] text-slate-500 mb-1">
                        {address.address2}
                      </p>
                    )}
                    <p className="text-[12px] text-slate-500">
                      {address.city}{address.province ? `, ${address.province}` : ''} • Perú
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-2 pt-3 border-t border-slate-100">
                  <Link href={`/profile/address/${address.id}`} className="flex-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full h-9 text-[12px] gap-2"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      Editar
                    </Button>
                  </Link>
                  <DeleteAddressButton addressId={address.id} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="p-6 bg-slate-50 rounded-full mb-4">
              <MapPin className="w-12 h-12 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">
              No tienes direcciones guardadas
            </h3>
            <p className="text-[14px] text-slate-500 mb-6 max-w-md">
              Agrega una dirección de entrega para facilitar tus compras
            </p>
            <Link href="/profile/address/new">
              <Button 
                className="h-11 text-[14px] gap-2"
                style={{ backgroundColor: brandColor }}
              >
                <Plus className="w-4 h-4" />
                Agregar Primera Dirección
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}