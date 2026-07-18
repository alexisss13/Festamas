'use server';

import prisma from '@/lib/prisma';
import { auth } from '@/auth';
import { getEcommerceContextFromCookie } from '@/lib/ecommerce-context';

const RESERVATION_TTL_MIN = 15;

export interface ReservationItem {
  productId: string;
  variantId?: string;
  quantity: number;
}

export interface ReservationResult {
  success: boolean;
  message?: string;
  branchId?: string;
  reservedVariantIds?: string[];
}

async function getVariantAvailableStock(variantId: string, branchId: string): Promise<number> {
  const now = new Date();
  const [stock, reserved] = await Promise.all([
    prisma.stock.findUnique({
      where: { branchId_variantId: { branchId, variantId } },
      select: { quantity: true },
    }),
    prisma.stockReservation.aggregate({
      where: { variantId, branchId, expiresAt: { gt: now } },
      _sum: { quantity: true },
    }),
  ]);

  return Math.max(0, (stock?.quantity ?? 0) - (reserved._sum.quantity ?? 0));
}

/**
 * Elige una sola sucursal capaz de preparar todo el pedido.
 * Se prioriza la sucursal propietaria de cada producto y luego la sucursal
 * activa; esto evita repartir un pedido entre sucursales sin necesidad.
 */
export async function resolveOrderFulfillment(items: ReservationItem[]) {
  const { business, activeBranch } = await getEcommerceContextFromCookie();
  const productIds = [...new Set(items.map(item => item.productId))];

  const [products, branches] = await Promise.all([
    prisma.product.findMany({
      where: {
        id: { in: productIds },
        businessId: business.id,
        active: true,
        isAvailable: true,
        availableChannels: { in: ['ECOMMERCE', 'BOTH'] },
      },
      select: {
        id: true,
        branchOwnerId: true,
        variants: {
          where: { active: true },
          select: { id: true },
          orderBy: { createdAt: 'asc' },
        },
      },
    }),
    prisma.branch.findMany({
      where: { businessId: business.id },
      select: { id: true },
    }),
  ]);

  if (products.length !== productIds.length) {
    return { success: false as const, message: 'Uno de los productos ya no está disponible.' };
  }

  const variantsByProduct = new Map(products.map(product => [product.id, product.variants]));
  const resolvedItems = items.map(item => {
    const variants = variantsByProduct.get(item.productId) ?? [];
    const variant = item.variantId
      ? variants.find(candidate => candidate.id === item.variantId)
      : variants[0];
    return variant ? { ...item, variantId: variant.id } : null;
  });

  if (resolvedItems.some(item => !item)) {
    return { success: false as const, message: 'Una variante del carrito ya no está disponible.' };
  }

  const normalizedItems = resolvedItems as Array<ReservationItem & { variantId: string }>;
  const ownerByProduct = new Map(products.map(product => [product.id, product.branchOwnerId]));
  const candidateBranchIds = [...new Set([
    ...products.map(product => product.branchOwnerId).filter(Boolean),
    activeBranch.id,
    ...branches.map(branch => branch.id),
  ])] as string[];

  const candidates = [] as Array<{ branchId: string; score: number }>;
  for (const branchId of candidateBranchIds) {
    const availability = await Promise.all(normalizedItems.map(item =>
      getVariantAvailableStock(item.variantId, branchId).then(quantity => quantity >= item.quantity)
    ));
    if (!availability.every(Boolean)) continue;

    const ownerMatches = normalizedItems.filter(item => ownerByProduct.get(item.productId) === branchId).length;
    const score = ownerMatches * 1000 + (branchId === activeBranch.id ? 100 : 0);
    candidates.push({ branchId, score });
  }

  candidates.sort((a, b) => b.score - a.score);
  const selected = candidates[0];
  if (!selected) {
    return { success: false as const, message: 'No existe una sucursal con stock suficiente para preparar todo el pedido.' };
  }

  return { success: true as const, branchId: selected.branchId, items: normalizedItems };
}

export async function reserveCartItems(items: ReservationItem[]): Promise<ReservationResult> {
  const session = await auth();
  const userId = session?.user?.id ?? null;
  const now = new Date();
  const expiresAt = new Date(now.getTime() + RESERVATION_TTL_MIN * 60_000);

  await prisma.stockReservation.deleteMany({
    where: {
      expiresAt: { lt: now },
      ...(userId ? { userId } : {}),
    },
  });

  if (userId) {
    await prisma.stockReservation.deleteMany({ where: { userId } });
  }

  const fulfillment = await resolveOrderFulfillment(items);
  if (!fulfillment.success) return fulfillment;

  // La validación anterior es una precomprobación. La reserva es deliberadamente
  // branch-scoped; el descuento definitivo vuelve a validar stock en una transacción.
  await prisma.stockReservation.createMany({
    data: fulfillment.items.map(item => ({
      variantId: item.variantId,
      branchId: fulfillment.branchId,
      userId,
      quantity: item.quantity,
      expiresAt,
    })),
  });

  return {
    success: true,
    branchId: fulfillment.branchId,
    reservedVariantIds: fulfillment.items.map(item => item.variantId),
  };
}

export async function releaseUserReservations(): Promise<void> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return;
  await prisma.stockReservation.deleteMany({ where: { userId } });
}
