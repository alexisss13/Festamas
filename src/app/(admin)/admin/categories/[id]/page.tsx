import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { CategoryForm } from '@/components/features/CategoryForm';

interface Props { params: Promise<{ id: string }> }

export default async function EditCategoryPage({ params }: Props) {
  const { id } = await params;
  const category = await prisma.category.findUnique({ where: { id } });
  if (!category) notFound();

  return <div className="p-8"><CategoryForm initialData={category} /></div>;
}