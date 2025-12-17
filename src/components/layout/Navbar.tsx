import prisma from '@/lib/prisma';
import { NavbarClient } from './NavbarClient';
import { cookies } from 'next/headers';
import { Division } from '@prisma/client';
import { auth } from '@/auth'; // 👈 Importamos auth

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

  const cookieStore = await cookies();
  const rawDivision = cookieStore.get('festamas_division')?.value;
  
  const defaultDivision: Division = (rawDivision === 'FIESTAS' || rawDivision === 'JUGUETERIA') 
    ? rawDivision 
    : 'JUGUETERIA';

  // 🔐 4. Obtenemos la sesión del usuario
  const session = await auth();

  return (
    <NavbarClient 
      categories={categories} 
      defaultDivision={defaultDivision}
      user={session?.user} // 👈 Se la pasamos al cliente
    />
  );
}

export const revalidate = 60;