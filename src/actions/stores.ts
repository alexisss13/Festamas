'use server';

import prisma from '@/lib/prisma';
import { getEcommerceContextFromCookie } from '@/lib/ecommerce-context';

export type StoreBranch = {
  id: string;
  name: string;
  address: string | null;
  phone: string | null;
  ecommerceCode: string | null;
  businessHours: Record<string, string> | null;
};

export async function getStoreBranches(): Promise<StoreBranch[]> {
  try {
    const { business } = await getEcommerceContextFromCookie();
    const branches = await prisma.branch.findMany({
      where: {
        businessId: business.id,
        ecommerceCode: { not: null },
      },
      select: {
        id: true,
        name: true,
        address: true,
        phone: true,
        ecommerceCode: true,
        businessHours: true,
      },
      orderBy: { name: 'asc' },
    });
    return branches.map(b => ({
      ...b,
      businessHours: b.businessHours as Record<string, string> | null,
    }));
  } catch {
    return [];
  }
}
