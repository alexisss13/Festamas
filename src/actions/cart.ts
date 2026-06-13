'use server';

import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import type { CartProduct } from '@/store/cart';

export async function loadUserCart(): Promise<CartProduct[]> {
  const session = await auth();
  const userId = (session?.user as any)?.id;
  if (!userId) return [];

  const items = await prisma.cartItem.findMany({
    where: { userId },
    include: {
      variant: {
        include: {
          product: {
            select: {
              id: true,
              slug: true,
              title: true,
              images: true,
              basePrice: true,
              wholesalePrice: true,
              wholesaleMinCount: true,
              discountPercentage: true,
              active: true,
            },
          },
          stock: { select: { quantity: true } },
        },
      },
    },
  });

  return items
    .filter(item => item.variant.product.active)
    .map(item => ({
      id: item.variant.productId,
      slug: item.variant.product.slug,
      title: item.variant.product.title,
      price: Number(item.variant.product.basePrice),
      image:
        item.variant.product.images[0] ??
        item.variant.images[0] ??
        '/placeholder.jpg',
      quantity: item.quantity,
      stock: item.variant.stock.reduce((s, b) => s + b.quantity, 0),
      wholesalePrice: item.variant.product.wholesalePrice
        ? Number(item.variant.product.wholesalePrice)
        : null,
      wholesaleMinCount: item.variant.product.wholesaleMinCount ?? null,
      discountPercentage: item.variant.product.discountPercentage ?? 0,
    }));
}

export async function syncCartToDB(
  items: { productId: string; quantity: number }[]
): Promise<void> {
  const session = await auth();
  const userId = (session?.user as any)?.id;
  if (!userId) return;

  await prisma.cartItem.deleteMany({ where: { userId } });

  if (items.length === 0) return;

  const createData: { userId: string; variantId: string; quantity: number }[] = [];
  for (const { productId, quantity } of items) {
    const variant = await prisma.productVariant.findFirst({
      where: { productId, active: true },
      orderBy: { createdAt: 'asc' },
      select: { id: true },
    });
    if (variant) {
      createData.push({ userId, variantId: variant.id, quantity });
    }
  }

  if (createData.length > 0) {
    await prisma.cartItem.createMany({ data: createData, skipDuplicates: true });
  }
}
