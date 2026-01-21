import prisma from '@/lib/prisma';
import { NavbarClient } from './NavbarClient';
import { cookies } from 'next/headers';
import { Division } from '@prisma/client';
import { auth } from '@/auth'; 
import { FavoritesInitializer } from '@/components/features/FavoritesInitializer'; 
import { getFavoriteIds } from '@/actions/favorites'; 

export async function Navbar() {
  // 1. Obtener categorías
  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' },
    select: { 
      id: true, 
      name: true, 
      slug: true,
      division: true
    }
  });

  // 2. Manejo seguro de Cookies
  const cookieStore = await cookies();
  const rawDivision = cookieStore.get('festamas_division')?.value;
  
  // Validamos que sea un valor permitido, si no, fallback a JUGUETERIA
  const defaultDivision: Division = (rawDivision === 'FIESTAS' || rawDivision === 'JUGUETERIA') 
    ? rawDivision 
    : 'JUGUETERIA';

  // 3. Sesión
  const session = await auth();

  // 4. Favoritos
  const favoriteIds = await getFavoriteIds();

  return (
    <>
      <FavoritesInitializer favoriteIds={favoriteIds} />
      
      {/* Pasamos defaultDivision explícitamente para evitar mismatch */}
      <NavbarClient 
        categories={categories} 
        defaultDivision={defaultDivision}
        user={session?.user}
      />
    </>
  );
}