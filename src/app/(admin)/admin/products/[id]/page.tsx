import { getProductForEdit } from '@/actions/admin-products';
import { ProductEditForm } from '@/components/admin/ProductEditForm';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ProductEditPage({ params }: Props) {
  const { id } = await params;
  const result = await getProductForEdit(id);

  if (!result.success || !result.product) {
    notFound();
  }

  return (
    <div className="p-6 space-y-6">
      <Link 
        href="/admin/products"
        className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver a productos
      </Link>

      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          Editar Producto
        </h1>
        <p className="text-slate-600 mt-1">
          Edita solo los campos de ecommerce. Los datos del POS no se pueden modificar aquí.
        </p>
      </div>

      <ProductEditForm product={result.product} />
    </div>
  );
}
