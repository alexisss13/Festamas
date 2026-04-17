import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    // Obtener productos más vendidos y mejor valorados
    const products = await prisma.product.findMany({
      where: {
        active: true,
        isAvailable: true,
      },
      select: {
        id: true,
        title: true,
        slug: true,
        images: true,
        basePrice: true,
        averageRating: true,
        reviewCount: true,
        salesCount: true,
        viewCount: true,
        discountPercentage: true,
      },
      orderBy: [
        { salesCount: 'desc' },
        { averageRating: 'desc' },
        { viewCount: 'desc' },
      ],
      take: 8,
    });

    // Serializar los resultados
    const topProducts = products.map(product => ({
      id: product.id,
      title: product.title,
      slug: product.slug,
      images: product.images,
      price: product.discountPercentage > 0
        ? Number(product.basePrice) * (1 - product.discountPercentage / 100)
        : Number(product.basePrice),
      averageRating: Number(product.averageRating),
      reviewCount: product.reviewCount,
      salesCount: product.salesCount,
      viewCount: product.viewCount,
    }));

    return NextResponse.json({ products: topProducts });
  } catch (error) {
    console.error('Error fetching top products:', error);
    return NextResponse.json({ products: [] }, { status: 500 });
  }
}
