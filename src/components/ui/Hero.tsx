import prisma from '@/lib/prisma';
import { HeroClient } from './HeroClient';
import { getEcommerceContextFromCookie } from '@/lib/ecommerce-context';

// Esta función se ejecuta en el SERVIDOR (rápido y seguro)
export async function Hero() {
  const { activeBranch } = await getEcommerceContextFromCookie();
  const banners = await prisma.banner.findMany({
    where: {
      active: true,
      position: 'MAIN_HERO',
      OR: [{ branchId: activeBranch.id }, { branchId: null }],
    },
    orderBy: {
      order: 'asc',
    }
  });

  // Si no hay banners en la base de datos, podrías retornar null o un placeholder
  if (banners.length === 0) {
    return null; // O un <div>Cargando ofertas...</div>
  }

  // Le pasamos los datos al componente cliente
  return <HeroClient banners={banners} />;
}
