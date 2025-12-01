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
      
      // 3. Suma de ingresos
      // Sumamos basándonos en la bandera "isPaid", independientemente del estado de envío.
      prisma.order.aggregate({
        _sum: { totalAmount: true },
        where: { isPaid: true } 
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
