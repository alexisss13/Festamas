import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q') || '';

    if (query.length < 2) {
      return NextResponse.json({ suggestions: [] });
    }

    // Buscar productos que coincidan con el query
    const products = await prisma.product.findMany({
      where: {
        AND: [
          { active: true },
          { isAvailable: true },
          {
            OR: [
              { title: { contains: query, mode: 'insensitive' } },
              { description: { contains: query, mode: 'insensitive' } },
              { tags: { hasSome: [query.toLowerCase()] } },
            ],
          },
        ],
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
        discountPercentage: true,
      },
      orderBy: [
        { salesCount: 'desc' },
        { averageRating: 'desc' },
      ],
      take: 5,
    });

    // Serializar los resultados
    const suggestions = products.map(product => ({
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
    }));

    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error('Error fetching suggestions:', error);
    return NextResponse.json({ suggestions: [] }, { status: 500 });
  }
}
