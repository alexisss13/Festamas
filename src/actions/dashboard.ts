'use server';

import prisma from '@/lib/prisma';

export async function getDashboardStats() {
  try {
    // Ejecutamos todas las consultas en paralelo para que sea rapidísimo
    const [
      ordersCount,
      productsCount,
      paidOrders,
      lowStockProducts
    ] = await Promise.all([
      // 1. Total de pedidos
      prisma.order.count(),
      
      // 2. Total de productos activos
      prisma.product.count({ where: { isAvailable: true } }),
      
      // 3. Suma de ingresos (Solo de ordenes PAGADAS)
      // Ojo: Como en tu MVP marcas manual, asumiremos que 'PAID' es lo que cuenta.
      // Si quieres proyectar todo, quita el 'where'.
      prisma.order.aggregate({
        _sum: { totalAmount: true },
        where: { status: 'PAID' } // O 'PENDING' si quieres ver proyección
      }),

      // 4. Productos con poco stock (menos de 5)
      prisma.product.count({
        where: { stock: { lte: 5 }, isAvailable: true }
      })
    ]);

    const totalRevenue = paidOrders._sum.totalAmount || 0;

    return {
      success: true,
      data: {
        ordersCount,
        productsCount,
        totalRevenue: Number(totalRevenue), // Convertir Decimal a Number
        lowStockProducts
      }
    };

  } catch (error) {
    console.error('Error cargando dashboard:', error);
    return { success: false, message: 'Error al calcular estadísticas' };
  }
}