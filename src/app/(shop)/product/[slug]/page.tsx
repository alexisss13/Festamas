import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { Badge } from '@/components/ui/badge';
import prisma from '@/lib/prisma';
import { ProductImageGallery } from '@/components/features/ProductImageGallery';
import { ProductActions } from '@/components/features/ProductActions';
import { ProductCarousel } from '@/components/features/ProductCarousel'; // 👈 Importamos el carrusel
import { getSimilarProducts } from '@/actions/products'; // 👈 Importamos la acción nueva
import { SITE_URL } from '@/lib/utils';
import { Separator } from '@/components/ui/separator'; // Importamos Separator
import { ChevronRight, Home } from 'lucide-react';

interface Props {
  params: Promise<{ slug: string }>;
}

async function getProductData(slug: string) {
  const product = await prisma.product.findUnique({
    where: { slug },
    include: { category: true },
  });

  if (!product) return null;

  let siblings: { slug: string; color: string | null; title: string }[] = [];
  
  if (product.groupTag) {
    siblings = await prisma.product.findMany({
      where: {
        groupTag: product.groupTag,
        isAvailable: true,
        NOT: { id: product.id }
      },
      select: { slug: true, color: true, title: true },
      orderBy: { createdAt: 'asc' }
    });
    
    siblings.push({ slug: product.slug, color: product.color, title: product.title });
    siblings.sort((a, b) => a.slug.localeCompare(b.slug));
  }

  // Obtenemos similares en paralelo
  const similarProducts = await getSimilarProducts(product.categoryId, product.id);

  return { product, siblings, similarProducts };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await prisma.product.findUnique({ where: { slug } }); // Fetch ligero solo para metadata
  
  if (!product) return { title: 'Producto no encontrado' };

  return {
    title: `${product.title} | FiestasYa`,
    description: product.description.substring(0, 160),
    openGraph: {
      title: product.title,
      images: [{ url: product.images[0] || `${SITE_URL}/og-image.jpg` }],
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const data = await getProductData(slug);

  if (!data) notFound();
  const { product, siblings, similarProducts } = data;

  const isToys = product.division === 'JUGUETERIA';
  const brandColorText = isToys ? 'text-[#fc4b65]' : 'text-[#ec4899]';

  const sanitizedProduct = {
    ...product,
    price: Number(product.price),
    wholesalePrice: product.wholesalePrice ? Number(product.wholesalePrice) : null,
  };

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.description,
    image: product.images,
    sku: product.id,
    offers: {
      '@type': 'Offer',
      price: Number(product.price),
      priceCurrency: 'PEN',
      availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
    }
  };

  return (
    <div className="bg-white pb-20">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* BREADCRUMB */}
      <div className="container mx-auto px-4 py-4">
        <nav className="flex items-center text-sm text-slate-500 gap-2 overflow-hidden">
            <Link href="/" className="hover:text-slate-900 transition-colors"><Home className="w-4 h-4" /></Link>
            <ChevronRight className="w-4 h-4 text-slate-300 flex-shrink-0" />
            <Link href={`/category/${product.category.slug}`} className="hover:text-slate-900 transition-colors whitespace-nowrap">{product.category.name}</Link>
            <ChevronRight className="w-4 h-4 text-slate-300 flex-shrink-0" />
            <span className="font-medium text-slate-900 truncate">{product.title}</span>
        </nav>
      </div>

      <div className="container mx-auto px-4 mt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16 items-start">
          
          <div className="sticky top-24">
             <ProductImageGallery 
                images={product.images} 
                title={product.title} 
                isOutOfStock={product.stock <= 0} 
             />
          </div>

          <div className="flex flex-col animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="mb-4">
                <span className={`text-xs font-bold tracking-wider uppercase ${brandColorText}`}>
                    {isToys ? 'Festamas' : 'FiestasYa'}
                </span>
                <h1 className="mt-2 text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                    {product.title}
                </h1>
                <div className="mt-2 flex items-center gap-2 text-sm text-slate-500">
                    <span>SKU: {product.slug.split('-').pop()?.toUpperCase()}</span>
                    <span>•</span>
                    <Badge variant="outline" className="text-slate-600 border-slate-200 bg-slate-50">
                        {product.category.name}
                    </Badge>
                </div>
            </div>

            <ProductActions product={sanitizedProduct} />

            {siblings.length > 0 && (
              <div className="mt-8 pt-6 border-t border-slate-100">
                  <p className="text-sm font-bold text-slate-900 mb-3">Otras opciones disponibles:</p>
                  <div className="flex flex-wrap gap-3">
                      {siblings.map((variant) => {
                          const isActive = variant.slug === product.slug;
                          return (
                              <Link 
                                  key={variant.slug} 
                                  href={`/product/${variant.slug}`}
                                  title={variant.title}
                                  className={`
                                      group relative w-12 h-12 rounded-lg border-2 flex items-center justify-center transition-all overflow-hidden
                                      ${isActive ? 'border-slate-900 ring-2 ring-slate-200 ring-offset-2' : 'border-slate-200 hover:border-slate-400'}
                                  `}
                              >
                                  <span 
                                      className="w-full h-full" 
                                      style={{ backgroundColor: variant.color || '#eee' }} 
                                  />
                                  {isActive && <div className="absolute inset-0 ring-1 ring-inset ring-black/10" />}
                              </Link>
                          );
                      })}
                  </div>
              </div>
            )}

            <div className="mt-8 pt-6 border-t border-slate-100">
                <h3 className="text-lg font-bold text-slate-900 mb-3">Descripción</h3>
                <div className="prose prose-slate prose-sm max-w-none text-slate-600 leading-relaxed">
                    <p>{product.description}</p>
                </div>
            </div>

          </div>
        </div>

        {/* 🚀 NUEVA SECCIÓN: PRODUCTOS SIMILARES */}
        {similarProducts.length > 0 && (
            <div className="mt-24">
                <Separator className="mb-10" />
                <h2 className="text-2xl font-bold text-slate-700 mb-6">
                    También te podría gustar
                </h2>
                <ProductCarousel products={similarProducts as any} autoPlay={true} />
            </div>
        )}

      </div>
    </div>
  );
}