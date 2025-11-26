import { getProducts } from '@/actions/products';
import { ProductCard } from '@/components/features/ProductCard';

export const revalidate = 60; // Revalidar caché cada 60 segundos (ISR)

export default async function HomePage() {
  // 1. Llamamos al Server Action directamente
  const { success, data: products } = await getProducts();

  // 2. Manejo de error básico si falla la BD
  if (!success) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
        <h2 className="text-2xl font-bold text-red-600">¡Ups! Algo salió mal.</h2>
        <p className="text-slate-600">No pudimos cargar los productos de la fiesta.</p>
      </div>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8">
      {/* HEADER DE LA SECCIÓN */}
      <div className="mb-8 flex flex-col gap-2">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 lg:text-5xl">
          FiestasYa!
        </h1>
        <p className="text-lg text-slate-600">
          Todo para tu celebración en Trujillo, al mejor precio.
        </p>
      </div>

      {/* GRILLA DE PRODUCTOS */}
      {products && products.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        // ESTADO VACÍO (Si borraste la BD o no corrió el seed)
        <div className="py-20 text-center">
          <p className="text-xl text-slate-500">No hay productos disponibles por ahora.</p>
        </div>
      )}
    </main>
  );
}