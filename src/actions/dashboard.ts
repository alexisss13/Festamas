'use server';

import prisma from '@/lib/prisma';

const startOfDaysAgo = (days: number) => {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - days);
  return date;
};

const dayLabel = (date: Date) => `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}`;

async function getBusinessId(branchId: string) {
  const branch = await prisma.branch.findUnique({ where: { id: branchId }, select: { businessId: true } });
  return branch?.businessId ?? null;
}

export async function getDashboardStats(branchId: string) {
  const businessId = await getBusinessId(branchId);
  if (!businessId) return { productsCount: 0, lowStockProducts: 0, activeCoupons: 0, activeBanners: 0, activeSections: 0, totalRevenue: 0, ordersCount: 0 };

  const since = startOfDaysAgo(30);
  const [products, revenue, ordersCount, coupons, banners, sections] = await Promise.all([
    prisma.product.findMany({
      where: { businessId, OR: [{ branchOwnerId: branchId }, { branchOwnerId: null }], active: true, isAvailable: true, availableChannels: { in: ['ECOMMERCE', 'BOTH'] } },
      select: { minStock: true, variants: { where: { active: true }, select: { stock: { where: { branchId }, select: { quantity: true } } } } },
    }),
    prisma.order.aggregate({ where: { businessId, branchId, source: 'ONLINE', isPaid: true, createdAt: { gte: since } }, _sum: { totalAmount: true } }),
    prisma.order.count({ where: { businessId, branchId, source: 'ONLINE', createdAt: { gte: since } } }),
    prisma.coupon.count({ where: { isActive: true, OR: [{ branchId: null }, { branchId }] } }),
    prisma.banner.count({ where: { active: true, OR: [{ branchId: null }, { branchId }] } }),
    prisma.homeSection.count({ where: { isActive: true, OR: [{ branchId: null }, { branchId }] } }),
  ]);

  const lowStockProducts = products.filter(product => {
    const stock = product.variants.reduce((sum, variant) => sum + variant.stock.reduce((inner, item) => inner + item.quantity, 0), 0);
    return stock <= product.minStock;
  }).length;

  return { productsCount: products.length, lowStockProducts, activeCoupons: coupons, activeBanners: banners, activeSections: sections, totalRevenue: Number(revenue._sum.totalAmount ?? 0), ordersCount };
}

export async function getSalesChartData(branchId: string): Promise<{ name: string; total: number }[]> {
  const businessId = await getBusinessId(branchId);
  if (!businessId) return [];
  const since = startOfDaysAgo(6);
  const orders = await prisma.order.findMany({ where: { businessId, branchId, source: 'ONLINE', isPaid: true, createdAt: { gte: since } }, select: { createdAt: true, totalAmount: true } });
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(since);
    date.setDate(since.getDate() + index);
    const total = orders.filter(order => order.createdAt.toDateString() === date.toDateString()).reduce((sum, order) => sum + Number(order.totalAmount), 0);
    return { name: dayLabel(date), total };
  });
}

export async function getLogisticsStats(branchId: string): Promise<{ name: string; pickup: number; delivery: number }[]> {
  const businessId = await getBusinessId(branchId);
  if (!businessId) return [];
  const since = startOfDaysAgo(6);
  const orders = await prisma.order.findMany({ where: { businessId, branchId, source: 'ONLINE', createdAt: { gte: since } }, select: { createdAt: true, deliveryMethod: true } });
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(since);
    date.setDate(since.getDate() + index);
    const dayOrders = orders.filter(order => order.createdAt.toDateString() === date.toDateString());
    return { name: dayLabel(date), pickup: dayOrders.filter(order => order.deliveryMethod === 'PICKUP').length, delivery: dayOrders.filter(order => order.deliveryMethod !== 'PICKUP').length };
  });
}

export async function getRecentSales(branchId: string) {
  const businessId = await getBusinessId(branchId);
  if (!businessId) return [];
  const orders = await prisma.order.findMany({ where: { businessId, branchId, source: 'ONLINE', isPaid: true }, orderBy: { createdAt: 'desc' }, take: 5, select: { id: true, clientName: true, clientPhone: true, totalAmount: true } });
  return orders.map(order => ({ ...order, totalAmount: Number(order.totalAmount) }));
}

export async function getTopProducts(branchId: string) {
  const businessId = await getBusinessId(branchId);
  if (!businessId) return [];
  const orderItems = await prisma.orderItem.findMany({ where: { order: { businessId, branchId, source: 'ONLINE', isPaid: true } }, select: { variantId: true, quantity: true, price: true, productName: true } });
  const grouped = new Map<string, { quantity: number; revenue: number; title: string }>();
  for (const item of orderItems) {
    const key = item.variantId ?? item.productName;
    const current = grouped.get(key) ?? { quantity: 0, revenue: 0, title: item.productName };
    current.quantity += item.quantity;
    current.revenue += Number(item.price) * item.quantity;
    grouped.set(key, current);
  }
  const variants = await prisma.productVariant.findMany({ where: { id: { in: [...grouped.keys()] } }, select: { id: true, product: { select: { id: true, title: true, images: true, isAvailable: true } }, stock: { where: { branchId }, select: { quantity: true } } } });
  const byProduct = new Map<string, { id: string; title: string; images: string[]; isAvailable: boolean; stock: number; quantity: number; revenue: number }>();
  for (const variant of variants) {
    const metrics = grouped.get(variant.id)!;
    const current = byProduct.get(variant.product.id) ?? { id: variant.product.id, title: variant.product.title, images: variant.product.images, isAvailable: variant.product.isAvailable, stock: 0, quantity: 0, revenue: 0 };
    current.stock += variant.stock.reduce((sum, item) => sum + item.quantity, 0);
    current.quantity += metrics.quantity;
    current.revenue += metrics.revenue;
    byProduct.set(variant.product.id, current);
  }
  return [...byProduct.values()].map(product => ({ id: product.id, title: product.title, images: product.images, isAvailable: product.isAvailable, stock: product.stock, price: product.revenue / product.quantity, _count: { orderItems: product.quantity } })).sort((a, b) => b._count.orderItems - a._count.orderItems).slice(0, 8);
}

// Rendimiento de catálogo: cruza vistas reales (Product.viewCount, sí se
// incrementa en cada visita — ver actions/products.ts) contra ventas reales
// computadas desde OrderItem (igual que getTopProducts). No usa
// Product.salesCount: ese campo nunca se incrementó en ningún lado hasta
// ahora (bug corregido en actions/payments.ts, finalizePaidOrder) — para
// pedidos ya pagados ANTES de ese fix, salesCount seguiría en 0 aunque sí se
// vendieron, así que para el histórico completo hay que seguir calculando
// desde OrderItem, no confiar en el contador.
export async function getProductPerformance(branchId: string) {
  const businessId = await getBusinessId(branchId);
  if (!businessId) return [];

  const [products, orderItems] = await Promise.all([
    prisma.product.findMany({
      where: { businessId, OR: [{ branchOwnerId: branchId }, { branchOwnerId: null }], active: true },
      select: { id: true, title: true, images: true, viewCount: true, isAvailable: true },
    }),
    prisma.orderItem.findMany({
      where: { order: { businessId, branchId, source: 'ONLINE', isPaid: true } },
      select: { productName: true, quantity: true, price: true, variant: { select: { productId: true } } },
    }),
  ]);

  const soldByProduct = new Map<string, { quantity: number; revenue: number }>();
  for (const item of orderItems) {
    const productId = item.variant?.productId;
    if (!productId) continue;
    const current = soldByProduct.get(productId) ?? { quantity: 0, revenue: 0 };
    current.quantity += item.quantity;
    current.revenue += Number(item.price) * item.quantity;
    soldByProduct.set(productId, current);
  }

  return products
    .map(product => {
      const sold = soldByProduct.get(product.id) ?? { quantity: 0, revenue: 0 };
      return {
        id: product.id,
        title: product.title,
        images: product.images,
        isAvailable: product.isAvailable,
        viewCount: product.viewCount,
        unitsSold: sold.quantity,
        revenue: sold.revenue,
        // Sin vistas registradas todavía no hay base para calcular una tasa —
        // null en vez de 0 para no sugerir "0% de conversión" cuando en
        // realidad es "sin datos suficientes".
        conversionRate: product.viewCount > 0 ? sold.quantity / product.viewCount : null,
      };
    })
    .sort((a, b) => b.viewCount - a.viewCount);
}

export async function getOrderStatuses(branchId: string) {
  const businessId = await getBusinessId(branchId);
  if (!businessId) return { PENDING: 0, PAID: 0, DELIVERED: 0 };
  const grouped = await prisma.order.groupBy({ by: ['status'], where: { businessId, branchId, source: 'ONLINE' }, _count: { _all: true } });
  return { PENDING: grouped.find(item => item.status === 'PENDING')?._count._all ?? 0, PAID: (grouped.find(item => item.status === 'PAID')?._count._all ?? 0) + (grouped.find(item => item.status === 'PROCESSING')?._count._all ?? 0) + (grouped.find(item => item.status === 'SHIPPED')?._count._all ?? 0) + (grouped.find(item => item.status === 'READY_FOR_PICKUP')?._count._all ?? 0), DELIVERED: grouped.find(item => item.status === 'DELIVERED')?._count._all ?? 0 };
}
