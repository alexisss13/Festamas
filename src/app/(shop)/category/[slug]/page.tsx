import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { getProductsByCategory } from '@/actions/products';
import { ProductCard } from '@/components/features/ProductCard';

interface Props {
  params: Promise<{
    slug: string;
  }>;
}

// 1. SEO Dinámico: "Globos | FiestasYa"
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  // Truco rápido para capitalizar primera letra para el SEO
  const title = slug.charAt(0).toUpperCase() + slug.slice(1);
  
  return {
    title: `${title} | FiestasYa`,
    description: `Compra los mejores artículos de ${slug} en Trujillo.`,
  };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const data = await getProductsByCategory(slug);

  if (!data) {
    notFound();
  }

  const { categoryName, products } = data;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* CABECERA DE CATEGORÍA */}
      <div className="mb-8 border-b pb-4">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 capitalize">
          {categoryName}
        </h1>
        <p className="mt-2 text-slate-500">
          Explora nuestra selección exclusiva.
        </p>
      </div>

      {/* RESULTADOS */}
      {products.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="py-20 text-center">
          <p className="text-xl text-slate-500">
            Aún no hay productos en esta categoría.
          </p>
        </div>
      )}
    </div>
  );
}