import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { Badge } from '@/components/ui/badge';
import { getProduct } from '@/actions/products';
import { AddToCartButton } from '@/components/features/AddToCartButton'; // 👈 Importar el nuevo botón

interface Props {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    return {
      title: 'Producto no encontrado',
      description: 'El artículo que buscas no existe.',
    };
  }

  return {
    title: `${product.title} | FiestasYa`,
    description: product.description,
    openGraph: {
      title: product.title,
      description: product.description,
      images: product.images[0] ? [product.images[0]] : [],
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  
  // Solo necesitamos el producto, la config de WhatsApp ya no se usa aquí directo
  const product = await getProduct(slug);

  if (!product) {
    notFound();
  }

  const formatPrice = (value: number) =>
    new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
    }).format(value);

  const isOutOfStock = product.stock <= 0;

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:gap-16">
        
        {/* COLUMNA IZQUIERDA: IMAGEN */}
        <div className="relative aspect-square overflow-hidden rounded-xl border bg-slate-100 shadow-sm">
          {product.images[0] ? (
            <Image
              src={product.images[0]}
              alt={product.title}
              fill
              className={`object-cover ${isOutOfStock ? 'opacity-50 grayscale' : ''}`} // Efecto visual si agotado
              priority 
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-slate-400">
              Sin imagen
            </div>
          )}
          
          {/* Badge de Agotado Grande */}
          {isOutOfStock && (
             <div className="absolute inset-0 flex items-center justify-center">
                <Badge variant="destructive" className="text-xl px-6 py-2 pointer-events-none">
                    AGOTADO
                </Badge>
             </div>
          )}
        </div>

        {/* COLUMNA DERECHA: INFORMACIÓN */}
        <div className="flex flex-col justify-center">
          <Badge className="w-fit mb-4" variant="secondary">
            {product.category.name}
          </Badge>
          
          <h1 className="mb-4 text-3xl font-extrabold text-slate-900 lg:text-4xl">
            {product.title}
          </h1>
          
          <div className="mb-6 flex items-baseline gap-4">
             <span className="text-2xl font-bold text-slate-900">
                {formatPrice(product.price)}
             </span>
             {isOutOfStock && (
                <span className="text-sm font-medium text-red-500">
                    Sin stock disponible
                </span>
             )}
             {!isOutOfStock && product.stock <= 5 && (
                <span className="text-sm font-medium text-orange-500">
                    ¡Quedan solo {product.stock}!
                </span>
             )}
          </div>

          <p className="mb-8 text-lg text-slate-600 leading-relaxed">
            {product.description}
          </p>

          {/* AQUÍ VA EL COMPONENTE CLIENTE */}
          <AddToCartButton product={product} />
          
          <div className="mt-8 pt-8 border-t border-slate-100 grid grid-cols-2 gap-4 text-sm text-slate-500">
             <div>
                <span className="block font-medium text-slate-900">Entrega</span>
                Coordinación inmediata
             </div>
             <div>
                <span className="block font-medium text-slate-900">Pago</span>
                Yape, Plin o Transferencia
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}