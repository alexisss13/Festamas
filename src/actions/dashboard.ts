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

// Obtener datos para el gráfico (Últimos 7 días)
export async function getSalesChartData() {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Traemos ordenes pagadas de la última semana
    const orders = await prisma.order.findMany({
      where: {
        isPaid: true,
        createdAt: {
          gte: sevenDaysAgo
        }
      },
      select: {
        createdAt: true,
        totalAmount: true
      }
    });

    // Agrupamos por día (JS reduce)
    const salesByDay = orders.reduce((acc, order) => {
      // Formato "DD/MM" (ej: "05/12")
      const dateKey = new Intl.DateTimeFormat('es-PE', { day: '2-digit', month: '2-digit' }).format(order.createdAt);
      
      if (!acc[dateKey]) {
        acc[dateKey] = 0;
      }
      acc[dateKey] += Number(order.totalAmount);
      return acc;
    }, {} as Record<string, number>);

    // Convertimos a array para Recharts: [{ name: "05/12", total: 150 }]
    // Rellenamos días vacíos si quieres ser muy pro, pero para MVP basta con lo que hay.
    const chartData = Object.entries(salesByDay).map(([name, total]) => ({ name, total }));

    return chartData.reverse(); // Para que salga en orden (aunque mejor ordenarlo por fecha real si es crítico)
  } catch (error) {
    console.error('Error chart data:', error);
    return [];
  }
}

// Obtener últimas 5 ventas (para la lista derecha)
export async function getRecentSales() {
  try {
    const sales = await prisma.order.findMany({
      where: { isPaid: true }, // Solo pagadas
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        clientName: true,
        clientPhone: true,
        totalAmount: true,
        createdAt: true // 👈 Asegurarnos de traer la fecha
      }
    });

    // Serializamos Decimal -> Number
    return sales.map(sale => ({
      ...sale,
      totalAmount: Number(sale.totalAmount)
    }));
  } catch (error) {
    console.error('Error recent sales:', error);
    return [];
  }
}