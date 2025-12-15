import prisma from '@/lib/prisma';
import { HeroClient } from './HeroClient';

// Esta función se ejecuta en el SERVIDOR (rápido y seguro)
export async function Hero() {
  
  // Obtenemos TODOS los banners activos ordenados por el campo 'order'
  const banners = await prisma.banner.findMany({
    where: {
      active: true, // Solo los que activaste en el admin
    },
    orderBy: {
      order: 'asc', // Orden 1, 2, 3...
    }
  });

  // Si no hay banners en la base de datos, podrías retornar null o un placeholder
  if (banners.length === 0) {
    return null; // O un <div>Cargando ofertas...</div>
  }

  // Le pasamos los datos al componente cliente
  return <HeroClient banners={banners} />;
}