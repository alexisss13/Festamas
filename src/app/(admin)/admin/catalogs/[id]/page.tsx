import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import { CatalogForm } from '@/components/admin/CatalogForm';

export default async function EditCatalogPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const catalog = await prisma.catalog.findUnique({
    where: { id },
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
