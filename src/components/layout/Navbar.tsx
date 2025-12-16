import prisma from '@/lib/prisma';
import { NavbarClient } from './NavbarClient';
import { cookies } from 'next/headers'; // 👈 Importamos esto
import { Division } from '@prisma/client';

export async function Navbar() {
  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' },
    select: { 
      id: true, 
      name: true, 
      slug: true,
      division: true
    }
  });

  // 1. Leemos la cookie del servidor (Verdad Absoluta)
  const cookieStore = await cookies();
  const rawDivision = cookieStore.get('festamas_division')?.value;
  
  // 2. Validamos que sea correcta (JUGUETERIA o FIESTAS)
  const defaultDivision: Division = (rawDivision === 'FIESTAS' || rawDivision === 'JUGUETERIA') 
    ? rawDivision 
    : 'JUGUETERIA';

  // 3. Se la pasamos al cliente
  return <NavbarClient categories={categories} defaultDivision={defaultDivision} />;
}

export const revalidate = 60;