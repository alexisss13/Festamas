import prisma from '@/lib/prisma';
import { NavbarClient } from './NavbarClient';

export async function Navbar() {
  // 1. Obtenemos las categorías de la BD
  // (Solo necesitamos id, name y slug para el menú)
  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' },
    select: { id: true, name: true, slug: true }
  });

  // 2. Renderizamos la parte cliente pasándole los datos
  return <NavbarClient categories={categories} />;
}