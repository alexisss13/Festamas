import prisma from '@/lib/prisma';
import { NavbarClient } from './NavbarClient';
import { auth } from '@/auth'; 
import { FavoritesInitializer } from '@/components/features/FavoritesInitializer'; 
import { getFavoriteIds } from '@/actions/favorites'; 
import { getEcommerceContextFromCookie } from '@/lib/ecommerce-context';

export async function Navbar() {
  const { business, branches, activeBranch } = await getEcommerceContextFromCookie();

  const categories = await prisma.category.findMany({
    where: {
      businessId: business.id,
      products: {
        some: {
          businessId: business.id,
          isAvailable: true,
          active: true,
        },
      },
    },
    orderBy: { name: 'asc' },
    select: {
      id: true, 
      name: true, 
      slug: true,
      ecommerceCode: true
    }
  });

  const session = await auth();
  const favoriteIds = await getFavoriteIds();

  return (
    <>
      <FavoritesInitializer favoriteIds={favoriteIds} />
      <NavbarClient 
        categories={categories} 
        branches={branches.map((branch) => ({
          id: branch.id,
          name: branch.name,
          ecommerceCode: branch.ecommerceCode,
          brandColors: branch.brandColors as Record<string, string> | null,
          logos: (branch as any).logos as { isotipo?: string; isotipoWhite?: string; imagotipo?: string; imagotipoWhite?: string; alternate?: string } | null,
          address: branch.address,
          phone: branch.phone,
        }))}
        defaultBranchId={activeBranch.id}
        user={session?.user}
      />
    </>
  );
}
