import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { AddressForm } from '@/components/features/AddressForm';
import { cookies } from 'next/headers';
import { cn } from '@/lib/utils';
import { MapPinned, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export const metadata = {
  title: 'Dirección de Envío | Festamas',
  description: 'Gestiona tu dirección de entrega.',
};

export default async function AddressPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/auth/login?returnTo=/profile/address');
  }

  // 1. Obtener dirección existente (si hay)
  const userAddress = await prisma.address.findFirst({
    where: { userId: session.user.id },
  });

  // 2. Obtener datos del usuario (Para pre-llenar nombres si no hay dirección)
  const userProfile = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true }
  });

  const cookieStore = await cookies();
  const division = cookieStore.get('festamas_division')?.value || 'JUGUETERIA';
  const isFestamas = division === 'JUGUETERIA';
  
  // Colores
  const textPrimary = isFestamas ? 'text-[#fc4b65]' : 'text-[#ec4899]';

  return (
    <div className="min-h-[90vh] bg-slate-50/50 py-10 md:py-16">
      <div className="w-full max-w-[800px] mx-auto px-4">
        
        {/* HEADER SIMPLE */}
        <div className="mb-8">
            <Link href="/profile">
                <Button variant="ghost" className="pl-0 hover:bg-transparent text-slate-500 hover:text-slate-800 mb-4">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Volver al Perfil
                </Button>
            </Link>
            
            <div className="flex items-center gap-4 mb-2">
                <div className={cn("p-3 rounded-full border border-slate-100 bg-white shadow-sm", textPrimary)}>
                    <MapPinned className="w-8 h-8" />
                </div>
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                        {userAddress ? 'Editar Dirección' : 'Nueva Dirección'}
                    </h1>
                    <p className="text-slate-500 text-sm">
                        Datos necesarios para envíos y facturación.
                    </p>
                </div>
            </div>
        </div>

        {/* FORMULARIO */}
        <AddressForm 
            address={userAddress} 
            userData={userProfile} // 👈 Pasamos el usuario
            isFestamas={isFestamas} 
        />

      </div>
    </div>
  );
}