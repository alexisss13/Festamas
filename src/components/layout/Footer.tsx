import prisma from '@/lib/prisma';
import { FooterClient } from './FooterClient';
import { getEcommerceContextFromCookie } from '@/lib/ecommerce-context';

export async function Footer() {
  const { business } = await getEcommerceContextFromCookie();
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
    },
    take: 20
  });
  return <FooterClient allCategories={categories} />;
}
