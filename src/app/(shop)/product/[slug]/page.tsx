import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { Badge } from '@/components/ui/badge';
import prisma from '@/lib/prisma';
import { ProductDetailClient } from '@/components/features/ProductDetailClient';
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
        include: {
          stock: { where: { branchId: activeBranch.id } },
          variantAttributes: {
            include: {
              attributeValue: {
                include: { attributeType: true },
              },
            },
          },
        },
        orderBy: { createdAt: 'asc' },
      },
    },
  });

  if (!product || product.businessId !== business.id || (product.branchOwnerId !== null && product.branchOwnerId !== activeBranch.id)) return null;

  // Serialize variants: sum stock per branchId and serialize Decimals
  const variants = product.variants.map(v => ({
    id: v.id,
    name: v.name,
    images: v.images,
    barcode: v.barcode,
    sku: v.sku,
    attributes: v.attributes as Record<string, string> | null,
    variantAttributes: v.variantAttributes.map(va => ({
      attributeValue: {
        id: va.attributeValue.id,
        value: va.attributeValue.value,
        slug: va.attributeValue.slug,
        hexColor: va.attributeValue.hexColor,
        image: va.attributeValue.image,
        attributeType: {
          id: va.attributeValue.attributeType.id,
          name: va.attributeValue.attributeType.name,
          slug: va.attributeValue.attributeType.slug,
          order: va.attributeValue.attributeType.order,
        },
      },
    })),
    stock: v.stock.reduce((sum, s) => sum + s.quantity, 0),
  }));

  const totalStock = variants.reduce((sum, v) => sum + v.stock, 0);

  const similarProducts = await getSimilarProducts(product.categoryId ?? '', product.id);

  return {
    product: {
      id: product.id,
      slug: product.slug,
      title: product.title,
      description: product.ecommerceDescription || product.description,
      images: product.images,
      isAvailable: product.isAvailable,
      basePrice: Number(product.basePrice),
      wholesalePrice: product.wholesalePrice ? Number(product.wholesalePrice) : null,
      wholesaleMinCount: product.wholesaleMinCount,
      discountPercentage: product.discountPercentage,
      tags: product.tags,
      groupTag: product.groupTag,
      categoryId: product.categoryId,
      averageRating: Number(product.averageRating),
      reviewCount: product.reviewCount,
      viewCount: product.viewCount,
      salesCount: product.salesCount,
      businessId: product.businessId,
      branchOwnerId: product.branchOwnerId,
      active: product.active,
      totalStock,
      category: product.category,
    },
    variants,
    similarProducts,
    activeBranch,
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { business, activeBranch } = await getEcommerceContextFromCookie();
  const product = await prisma.product.findFirst({
    where: {
      slug,
      businessId: business.id,
      OR: [{ branchOwnerId: activeBranch.id }, { branchOwnerId: null }],
    },
  });
  if (!product) return { title: 'Producto no encontrado' };
  const metaDesc = (product.ecommerceDescription || product.description || '').substring(0, 160);
  const title = product.metaTitle || product.title;
  const image = product.images[0] || `${SITE_URL}/og-image.jpg`;
  return {
    // El layout raíz ya añade " | <negocio>" vía su title template — poner el
    // nombre del negocio también aquí lo duplicaba ("Producto | Negocio | Negocio").
    title,
    description: metaDesc,
    alternates: { canonical: `/product/${slug}` },
    openGraph: { title, description: metaDesc, images: [{ url: image }] },
    twitter: { card: 'summary_large_image', title, description: metaDesc, images: [image] },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const data = await getProductData(slug);

  if (!data) notFound();
  const { product, variants, similarProducts, activeBranch } = data;

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

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.description,
    image: product.images,
    sku: product.id,
    offers: {
      '@type': 'Offer',
      price: product.basePrice,
      priceCurrency: 'PEN',
      availability: product.totalStock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
    },
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
          {product.category && (
            <>
              <Link href={`/category/${product.category.slug}`} className="hover:text-slate-900 transition-colors whitespace-nowrap flex-shrink-0">
                {product.category.name}
              </Link>
              <ChevronRight className="w-3.5 h-3.5 md:w-4 md:h-4 text-slate-300 flex-shrink-0" />
            </>
          )}
          <span className="font-medium text-slate-900 truncate">{product.title}</span>
        </nav>
      </div>

      <div className="container mx-auto px-4 mt-4 md:mt-6">
        {/* ProductDetailClient handles the 2-column layout with variant selection */}
        <ProductDetailClient
          product={product}
          variants={variants}
          headerSlot={
            <div className="mb-1">
              <span className="text-[10px] md:text-xs font-bold tracking-wider uppercase text-primary">
                {activeBranch.name}
              </span>
              <div className="mt-2 flex items-center gap-2 text-xs md:text-sm text-slate-500 flex-wrap">
                <span className="whitespace-nowrap">SKU: {product.slug.split('-').pop()?.toUpperCase()}</span>
                {product.category && (
                  <>
                    <span className="hidden sm:inline">•</span>
                    <Badge variant="outline" className="text-slate-600 border-slate-200 bg-slate-50 text-xs">
                      {product.category.name}
                    </Badge>
                  </>
                )}
              </div>
            </div>
          }
        />

        {/* Description */}
        <div className="mt-10 md:mt-14 max-w-2xl">
          <div className="flex items-center justify-between mb-2 md:mb-3">
            <h3 className="text-base md:text-lg font-bold text-slate-900">Descripción</h3>
            <a
              href={`https://wa.me/?text=${encodeURIComponent(`${product.title} — ${SITE_URL}/product/${product.slug}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Compartir
            </a>
          </div>
          <div className="prose prose-slate prose-sm max-w-none text-slate-600 leading-relaxed text-sm md:text-base">
            <p>{product.description}</p>
          </div>
        </div>

        {/* Similar products */}
        {similarProducts.length > 0 && (
          <div className="mt-12 md:mt-16 lg:mt-24">
            <Separator className="mb-6 md:mb-10" />
            <h2 className="text-xl md:text-2xl font-bold text-slate-700 mb-4 md:mb-6 px-2">
              También te podría gustar
            </h2>
            <ProductCarousel products={similarProducts as any} autoPlay={true} />
          </div>
        )}

        {/* Reviews */}
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
