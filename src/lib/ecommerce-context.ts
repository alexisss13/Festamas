import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';

export async function getEcommerceContextFromCookie() {
  const businessId = process.env.NEXT_PUBLIC_BUSINESS_ID;
  if (!businessId) {
    throw new Error('NEXT_PUBLIC_BUSINESS_ID no está configurado');
  }

  const business = await prisma.business.findUnique({
    where: { id: businessId },
    include: {
      branches: {
        where: { ecommerceCode: { not: null } },
        orderBy: { name: 'asc' },
      },
    },
  });

  if (!business || business.branches.length === 0) {
    throw new Error('No se encontraron sucursales e-commerce para el negocio configurado');
  }

  const cookieStore = await cookies();
  const cookieBranchId = cookieStore.get('festamas_branch_id')?.value;
  const activeBranch =
    business.branches.find((branch) => branch.id === cookieBranchId) ?? business.branches[0];

  return {
    business,
    branches: business.branches,
    activeBranch,
  };
}
