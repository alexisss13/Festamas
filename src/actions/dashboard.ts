'use server';

import prisma from '@/lib/prisma';

export async function getDashboardStats(branchId: string) {
  const paidOrders = await prisma.order.count({ where: { isPaid: true } });
  return {
    productsCount: 0,
    lowStockProducts: 0,
    activeCoupons: 0,
    activeBanners: 0,
    activeSections: 0,
    totalRevenue: 0,
    ordersCount: paidOrders,
  };
}

export async function getLogisticsStats(branchId: string): Promise<any[]> {
  return [];
}

export async function getSalesChartData(branchId: string): Promise<any[]> {
  return [];
}

export async function getRecentSales(branchId: string): Promise<any[]> {
  return [];
}

export async function getTopProducts(branchId: string): Promise<any[]> {
  return [];
}

export async function getOrderStatuses(branchId: string): Promise<any> {
  return { PENDING: 0, PAID: 0, DELIVERED: 0 };
}
