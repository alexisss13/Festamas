import prisma from '@/lib/prisma';
import { FooterClient } from './FooterClient';

export async function Footer() {
  // 1. Obtenemos MUCHAS categorías (o todas) para poder filtrar en el cliente
  // Necesitamos el campo 'division' para saber a quién pertenecen
  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' },
    select: { 
        id: true, 
        name: true, 
        slug: true,
        division: true // ¡Importante!
    },
    take: 20 // Traemos suficientes para llenar ambas tiendas
  });

  // 2. Renderizamos el Cliente pasándole los datos
  return <FooterClient allCategories={categories} />;
}