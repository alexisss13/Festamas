import { getOrders } from '@/actions/order';
import { OrdersView } from './OrdersView';
import { ExportButton } from './ExportButton';

export default async function AdminOrdersPage() {
  const { success, data: orders } = await getOrders();

  if (!success || !orders) {
    return (
      <div className="p-8 text-center text-red-500">
        Error al cargar los pedidos. Intenta recargar.
      </div>
    );
  }

  // 🧹 SANITIZACIÓN DE DATOS (El Fix)
  // Convertimos todos los objetos Decimal de Prisma a Number de JS
  // para que Next.js pueda serializarlos y mandarlos al Cliente sin explotar.
  const plainOrders = orders.map((order: any) => ({
    ...order,
    totalAmount: Number(order.totalAmount),
    shippingCost: Number(order.shippingCost),
    orderItems: order.orderItems.map((item: any) => ({
        ...item,
        price: Number(item.price),
        product: {
            ...item.product,
            price: Number(item.product.price),
            // El error específico que te salía era por esto 👇
            wholesalePrice: item.product.wholesalePrice 
                ? Number(item.product.wholesalePrice) 
                : 0,
        }
    }))
  }));

  return (
    <div className="flex flex-col gap-6 w-full p-6 md:p-8 max-w-[1600px] mx-auto">
       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900">
              Pedidos
            </h1>
            <p className="text-slate-500 mt-1">
              Gestiona, filtra y exporta las ventas de ambas tiendas.
            </p>
          </div>
          
          <div className="flex-shrink-0">
             {/* Ahora pasamos 'plainOrders' que ya está limpio */}
             <ExportButton orders={plainOrders} />
          </div>
       </div>

       {/* Asumo que OrdersView también necesita los datos limpios */}
       <OrdersView orders={plainOrders} />
    </div>
  );
}