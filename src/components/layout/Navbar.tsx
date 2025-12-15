import prisma from '@/lib/prisma';
import { NavbarClient } from './NavbarClient';

export async function Navbar() {
  // 1. Obtenemos todas las categorías, pero traemos el campo 'division'
  // para poder filtrarlas en el cliente.
  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' },
    select: { 
      id: true, 
      name: true, 
      slug: true,
      division: true // 👈 Vital para el filtrado
    }
  });

  return <NavbarClient categories={categories} />;
}