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

  if (!product || product.businessId !== business.id || product.branchOwnerId !== activeBranch.id) return null;

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
      description: product.description,
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
  const product = await prisma.product.findUnique({ where: { slug } });
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
          <h3 className="text-base md:text-lg font-bold text-slate-900 mb-2 md:mb-3">Descripción</h3>
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
