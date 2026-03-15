'use server';

import prisma from '@/lib/prisma';
import { Division } from '@prisma/client';

export async function getDashboardStats(division: Division = 'JUGUETERIA') {
  try {
    // Contamos productos de la división
    const productsCount = await prisma.product.count({ 
      where: { isAvailable: true, division } 
    });

    // Contamos productos con bajo stock de la división
    const lowStockProducts = await prisma.product.count({
      where: { stock: { lte: 5 }, isAvailable: true, division }
    });

    // Contamos cupones activos de la división
    const activeCoupons = await prisma.coupon.count({
      where: { isActive: true, division }
    });

    // Contamos banners activos de la división
    const activeBanners = await prisma.banner.count({
      where: { active: true, division }
    });

    // Contamos secciones activas de la división
    const activeSections = await prisma.homeSection.count({
      where: { isActive: true, division }
    });

    // Obtenemos SOLO los orderItems de la división específica
    const orderItems = await prisma.orderItem.findMany({
      where: {
        product: { division },
        order: { isPaid: true }
      },
      select: {
        quantity: true,
        price: true,
        orderId: true
      }
    });

    // Calculamos el total de ingresos SOLO de productos de esta división
    const totalRevenue = orderItems.reduce((sum, item) => {
      return sum + (Number(item.price) * item.quantity);
    }, 0);

    // Contamos órdenes únicas que tienen al menos un producto de esta división
    const uniqueOrderIds = new Set(orderItems.map(item => item.orderId));
    const ordersCount = uniqueOrderIds.size;

    return {
      success: true,
      data: {
        ordersCount,
        productsCount,
        totalRevenue,
        lowStockProducts,
        activeCoupons,
        activeBanners,
        activeSections
      }
    };

  } catch (error) {
    console.error('Error cargando dashboard:', error);
    return { success: false, message: 'Error al calcular estadísticas' };
  }
}

// 👈 NUEVA FUNCIÓN: DATOS REALES DE LOGÍSTICA POR DÍA
export async function getLogisticsStats(division: Division = 'JUGUETERIA') {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Obtenemos las órdenes pagadas de la división en los últimos 7 días
    const orders = await prisma.order.findMany({
      where: {
        isPaid: true,
        createdAt: { gte: sevenDaysAgo },
        orderItems: { some: { product: { division } } }
      },
      select: {
        deliveryMethod: true,
        createdAt: true
      }
    });

    // Agrupamos por día y método de entrega
    const logisticsByDay = orders.reduce((acc, order) => {
      const dateKey = new Intl.DateTimeFormat('es-PE', { day: '2-digit', month: '2-digit' }).format(order.createdAt);
      if (!acc[dateKey]) {
        acc[dateKey] = { pickup: 0, delivery: 0 };
      }
      if (order.deliveryMethod === 'PICKUP') {
        acc[dateKey].pickup += 1;
      } else {
        acc[dateKey].delivery += 1;
      }
      return acc;
    }, {} as Record<string, { pickup: number; delivery: number }>);

    // Convertimos a array para el gráfico
    const chartData = Object.entries(logisticsByDay).map(([name, data]) => ({
      name,
      pickup: data.pickup,
      delivery: data.delivery
    }));

    return chartData.reverse();
  } catch (error) {
    console.error('Error logistics stats:', error);
    return [];
  }
}

export async function getSalesChartData(division: Division = 'JUGUETERIA') {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Obtenemos SOLO los orderItems de la división con sus órdenes pagadas
    const orderItems = await prisma.orderItem.findMany({
      where: {
        product: { division },
        order: { 
          isPaid: true,
          createdAt: { gte: sevenDaysAgo }
        }
      },
      select: {
        quantity: true,
        price: true,
        order: {
          select: {
            createdAt: true
          }
        }
      }
    });

    // Agrupamos por día y sumamos SOLO los items de esta división
    const salesByDay = orderItems.reduce((acc, item) => {
      const dateKey = new Intl.DateTimeFormat('es-PE', { day: '2-digit', month: '2-digit' }).format(item.order.createdAt);
      if (!acc[dateKey]) acc[dateKey] = 0;
      acc[dateKey] += Number(item.price) * item.quantity;
      return acc;
    }, {} as Record<string, number>);

    const chartData = Object.entries(salesByDay).map(([name, total]) => ({ name, total }));
    return chartData.reverse(); 
  } catch (error) {
    console.error('Error chart data:', error);
    return [];
  }
}

export async function getRecentSales(division: Division = 'JUGUETERIA') {
  try {
    // Obtenemos los orderItems de la división y agrupamos por orden
    const orderItems = await prisma.orderItem.findMany({
      where: {
        product: { division },
        order: { isPaid: true }
      },
      select: {
        quantity: true,
        price: true,
        order: {
          select: {
            id: true,
            clientName: true,
            clientPhone: true,
            createdAt: true
          }
        }
      },
      orderBy: {
        order: {
          createdAt: 'desc'
        }
      }
    });

    // Agrupamos por orden y calculamos el total de cada una
    const ordersMap = new Map<string, {
      id: string;
      clientName: string;
      clientPhone: string;
      createdAt: Date;
      totalAmount: number;
    }>();

    orderItems.forEach(item => {
      const orderId = item.order.id;
      if (!ordersMap.has(orderId)) {
        ordersMap.set(orderId, {
          id: item.order.id,
          clientName: item.order.clientName,
          clientPhone: item.order.clientPhone,
          createdAt: item.order.createdAt,
          totalAmount: 0
        });
      }
      const order = ordersMap.get(orderId)!;
      order.totalAmount += Number(item.price) * item.quantity;
    });

    // Convertimos a array, ordenamos y tomamos las 5 más recientes
    const sales = Array.from(ordersMap.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 5);

    return sales;
  } catch (error) {
    console.error('Error recent sales:', error);
    return [];
  }
}

export async function getTopProducts(division: Division = 'JUGUETERIA') {
  try {
    // Primero obtenemos los productos con ventas de esta división
    const topProducts = await prisma.product.findMany({
      where: { 
        division,
        orderItems: {
          some: {
            order: { isPaid: true }
          }
        }
      },
      orderBy: {
        orderItems: { _count: 'desc' }
      },
      take: 5,
      select: {
        id: true,
        title: true,
        stock: true,
        price: true,
        images: true,
        _count: {
          select: { orderItems: true }
        }
      }
    });

    // Solo retornamos productos que realmente tienen ventas
    return topProducts
      .filter(p => p._count.orderItems > 0)
      .map(p => ({
        ...p,
        price: Number(p.price)
      }));
  } catch (error) {
    console.error('Error top products:', error);
    return [];
  }
}

export async function getOrderStatuses(division: Division = 'JUGUETERIA') {
  try {
    // Agrupamos las órdenes por su estado (PENDING, PAID, DELIVERED, CANCELLED) 
    // filtrando por los productos de la división actual
    const statuses = await prisma.order.groupBy({
      by: ['status'],
      where: { orderItems: { some: { product: { division } } } },
      _count: true
    });

    // Mapeamos los resultados a un objeto fácil de leer en el frontend
    const result = { PENDING: 0, PAID: 0, DELIVERED: 0, CANCELLED: 0 };
    statuses.forEach(s => {
      result[s.status] = s._count;
    });

    return result;
  } catch (error) {
    console.error('Error order statuses:', error);
    return { PENDING: 0, PAID: 0, DELIVERED: 0, CANCELLED: 0 };
  }
}