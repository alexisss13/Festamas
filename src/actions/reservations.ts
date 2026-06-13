'use server';

import prisma from '@/lib/prisma';
import { auth } from '@/auth';

const RESERVATION_TTL_MIN = 15;

export async function getVariantAvailableStock(variantId: string): Promise<number> {
  const now = new Date();
  const [stock, reserved] = await Promise.all([
    prisma.stock.aggregate({
      where: { variantId },
      _sum: { quantity: true },
    }),
    prisma.stockReservation.aggregate({
      where: { variantId, expiresAt: { gt: now } },
      _sum: { quantity: true },
    }),
  ]);
  return Math.max(0, (stock._sum.quantity ?? 0) - (reserved._sum.quantity ?? 0));
}

export async function reserveCartItems(
  items: { productId: string; quantity: number }[]
): Promise<{ success: boolean; message?: string; reservedVariantIds?: string[] }> {
  const session = await auth();
  const userId = (session?.user as any)?.id ?? null;

  const now = new Date();
  const expiresAt = new Date(now.getTime() + RESERVATION_TTL_MIN * 60_000);

  // Purge globally expired reservations
  await prisma.stockReservation.deleteMany({ where: { expiresAt: { lt: now } } });

  // Release previous reservations from this user
  if (userId) {
    await prisma.stockReservation.deleteMany({ where: { userId } });
  }

  const rows: { variantId: string; userId: string | null; quantity: number; expiresAt: Date }[] = [];

  for (const { productId, quantity } of items) {
    const variant = await prisma.productVariant.findFirst({
      where: { productId, active: true },
      orderBy: { createdAt: 'asc' },
      select: { id: true },
    });
    if (!variant) continue;

    const available = await getVariantAvailableStock(variant.id);
    if (available < quantity) {
      return { success: false, message: 'Stock insuficiente para uno o más productos en el carrito' };
    }
    rows.push({ variantId: variant.id, userId, quantity, expiresAt });
  }

  if (rows.length > 0) {
    await prisma.stockReservation.createMany({ data: rows, skipDuplicates: true });
  }

  return { success: true, reservedVariantIds: rows.map(r => r.variantId) };
}

export async function releaseUserReservations(): Promise<void> {
  const session = await auth();
  const userId = (session?.user as any)?.id;
  if (!userId) return;
  await prisma.stockReservation.deleteMany({ where: { userId } });
}
