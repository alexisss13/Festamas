import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { Badge } from '@/components/ui/badge';
import prisma from '@/lib/prisma';
import { ProductImageGallery } from '@/components/features/ProductImageGallery';
import { ProductActions } from '@/components/features/ProductActions';
import { ProductCarousel } from '@/components/features/ProductCarousel';
import { ProductReviews } from '@/components/features/ProductReviews';
import { getSimilarProducts } from '@/actions/products';
import { getProductReviews, getUserReviewForProduct, getProductReviewStats } from '@/actions/reviews';
import { auth } from '@/auth';
import { SITE_URL } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { ChevronRight, Home } from 'lucide-react';
import { getEcommerceContextFromCookie } from '@/lib/ecommerce-context';

interface Props {
  params: Promise<{ slug: string }>;
}

async function getProductData(slug: string) {
  const { business, activeBranch } = await getEcommerceContextFromCookie();

  const product = await prisma.product.findUnique({
    where: { slug },
    include: { 
      category: true,
      variants: {
        where: { active: true },
        include: { stock: { where: { branchId: activeBranch.id } } },
        orderBy: { minStock: 'asc' },
        take: 1
      }
    },
  });

  if (!product || product.businessId !== business.id || product.branchOwnerId !== activeBranch.id) return null;

  const primaryVariant = product.variants[0];
  const stock = primaryVariant?.stock?.[0]?.quantity ?? 0;
  const price = Number(primaryVariant?.price ?? product.basePrice ?? 0);
  const images = primaryVariant?.images?.length ? primaryVariant.images : product.images;

  // Obtenemos similares en paralelo
  const similarProducts = await getSimilarProducts(product.categoryId, product.id);

  return { 
    product: {
      ...product,
      images,
      price,
      stock
    }, 
    similarProducts,
    activeBranch
  };
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
  const { product, similarProducts, activeBranch } = data;

  const primaryColor = (activeBranch?.brandColors as Record<string, string>)?.primary ?? '#fc4b65';

  // Obtener sesión y reseñas
  const session = await auth();
  const isAuthenticated = !!session?.user;

  const [reviewsResult, userReviewResult, statsResult] = await Promise.all([
    getProductReviews(product.id),
    isAuthenticated ? getUserReviewForProduct(product.id) : Promise.resolve({ success: false, review: null }),
    getProductReviewStats(product.id),
  ]);

  const reviews = reviewsResult.success ? reviewsResult.reviews : [];
  const userReview = userReviewResult.success ? userReviewResult.review : null;
  const reviewStats = statsResult.success ? statsResult.stats : {
    averageRating: 0,
    totalReviews: 0,
    distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
  };

  const sanitizedProduct = {
    id: product.id,
    title: product.title,
    slug: product.slug,
    description: product.description,
    images: product.images,
    isAvailable: product.isAvailable,
    type: product.type,
    tags: product.tags,
    groupTag: product.groupTag,
    categoryId: product.categoryId,
    supplierId: product.supplierId,
    averageRating: product.averageRating ? Number(product.averageRating) : 0,
    reviewCount: product.reviewCount,
    viewCount: product.viewCount,
    salesCount: product.salesCount,
    businessId: product.businessId,
    branchOwnerId: product.branchOwnerId,
    active: product.active,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
    price: Number(product.price),
    stock: product.stock,
    wholesalePrice: product.wholesalePrice ? Number(product.wholesalePrice) : null,
    wholesaleMinCount: product.wholesaleMinCount,
    discountPercentage: product.discountPercentage,
  } as any;

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
      <div className="container mx-auto px-4 py-3 md:py-4">
        <nav className="flex items-center text-xs md:text-sm text-slate-500 gap-1.5 md:gap-2 overflow-x-auto scrollbar-hide">
            <Link href="/" className="hover:text-slate-900 transition-colors flex-shrink-0">
              <Home className="w-3.5 h-3.5 md:w-4 md:h-4" />
            </Link>
            <ChevronRight className="w-3.5 h-3.5 md:w-4 md:h-4 text-slate-300 flex-shrink-0" />
            <Link href={`/category/${product.category.slug}`} className="hover:text-slate-900 transition-colors whitespace-nowrap flex-shrink-0">
              {product.category.name}
            </Link>
            <ChevronRight className="w-3.5 h-3.5 md:w-4 md:h-4 text-slate-300 flex-shrink-0" />
            <span className="font-medium text-slate-900 truncate">{product.title}</span>
        </nav>
      </div>

      <div className="container mx-auto px-4 mt-4 md:mt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 lg:gap-16 items-start">
          
          <div className="md:sticky md:top-24">
             <ProductImageGallery 
                images={product.images} 
                title={product.title} 
                isOutOfStock={product.stock <= 0} 
             />
          </div>

          <div className="flex flex-col animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="mb-4 md:mb-6">
                <span className="text-[10px] md:text-xs font-bold tracking-wider uppercase text-primary">
                    {activeBranch.name}
                </span>
                <div className="mt-2 flex items-center gap-2 text-xs md:text-sm text-slate-500 flex-wrap">
                    <span className="whitespace-nowrap">SKU: {product.slug.split('-').pop()?.toUpperCase()}</span>
                    <span className="hidden sm:inline">•</span>
                    <Badge variant="outline" className="text-slate-600 border-slate-200 bg-slate-50 text-xs">
                        {product.category.name}
                    </Badge>
                </div>
            </div>

            <ProductActions product={sanitizedProduct} />



            <div className="mt-6 md:mt-8 pt-4 md:pt-6 border-t border-slate-100">
                <h3 className="text-base md:text-lg font-bold text-slate-900 mb-2 md:mb-3">Descripción</h3>
                <div className="prose prose-slate prose-sm max-w-none text-slate-600 leading-relaxed text-sm md:text-base">
                    <p>{product.description}</p>
                </div>
            </div>

          </div>
        </div>

        {/* 🚀 NUEVA SECCIÓN: PRODUCTOS SIMILARES */}
        {similarProducts.length > 0 && (
            <div className="mt-12 md:mt-16 lg:mt-24">
                <Separator className="mb-6 md:mb-10" />
                <h2 className="text-xl md:text-2xl font-bold text-slate-700 mb-4 md:mb-6 px-2">
                    También te podría gustar
                </h2>
                <ProductCarousel products={similarProducts as any} autoPlay={true} />
            </div>
        )}

        {/* SECCIÓN DE RESEÑAS */}
        <div className="mt-12 md:mt-16 lg:mt-24">
          <Separator className="mb-6 md:mb-10" />
          <ProductReviews
            productId={product.id}
            productSlug={product.slug}
            reviews={reviews as any}
            stats={reviewStats}
            userReview={userReview as any}
            isAuthenticated={isAuthenticated}
          />
        </div>

      </div>
    </div>
  );
}