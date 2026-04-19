import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { getEcommerceContextFromCookie } from '@/lib/ecommerce-context';
import { CartClient } from './CartClient';

export const metadata = {
  title: 'Carrito de Compras | Festamas',
  description: 'Revisa tu carrito y procede al pago.',
};

export default async function CartPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/auth/login?returnTo=/cart');
  }

  // Obtener customer y direcciones
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      customer: true,
      addresses: {
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  if (!user) {
    redirect('/auth/login');
  }

  const { activeBranch } = await getEcommerceContextFromCookie();
  const brandColor = (activeBranch.brandColors as any)?.primary ?? '#fc4b65';

  // Obtener configuración de la tienda
  const storeConfig = await prisma.storeConfig.findFirst();

  return (
    <CartClient
      user={{
        name: user.customer?.name || user.name || '',
        phone: user.customer?.phone || '',
        addresses: user.addresses.map(addr => ({
          id: addr.id,
          address: addr.address,
          address2: addr.address2,
          city: addr.city,
          province: addr.province
        }))
      }}
      storeConfig={{
        whatsappPhone: storeConfig?.whatsappPhone || '51999999999',
        welcomeMessage: storeConfig?.welcomeMessage || 'Hola, quiero confirmar mi pedido.',
        localDeliveryPrice: Number(storeConfig?.localDeliveryPrice) || 0
      }}
      brandColor={brandColor}
    />
  );
}
