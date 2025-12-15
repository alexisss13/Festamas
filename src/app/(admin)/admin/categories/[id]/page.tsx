import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { CategoryForm } from '@/components/features/CategoryForm';

interface Props { params: Promise<{ id: string }> }

export default async function EditCategoryPage({ params }: Props) {
  const { id } = await params;
  
  const category = await prisma.category.findUnique({ where: { id } });
  
  if (!category) notFound();

  // 🛡️ FIX: Pasamos la prop correcta 'category' en lugar de 'initialData'
  return (
    <div className="p-8">
        <h1 className="text-2xl font-bold mb-6">Editar Categoría</h1>
        <CategoryForm category={category} />
    </div>
  );
}