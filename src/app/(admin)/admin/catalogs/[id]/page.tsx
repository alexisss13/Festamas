import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import { CatalogForm } from '@/components/admin/CatalogForm';
import { auth } from '@/auth';
import { canAccessEcommerceAdmin } from '@/lib/permissions';
import { getEcommerceContextFromCookie } from '@/lib/ecommerce-context';

export default async function EditCatalogPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user || !canAccessEcommerceAdmin(session.user)) notFound();
  const { business } = await getEcommerceContextFromCookie();
  
  const catalog = await prisma.catalog.findUnique({
    where: { id, businessId: business.id },
  });

  if (!catalog) {
    notFound();
  }

  return (
    <div className="p-4 md:p-8 flex justify-center">
      <CatalogForm catalog={catalog} />
    </div>
  );
}
