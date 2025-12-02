import { getOrders } from '@/actions/order';
import { OrdersView } from './OrdersView';
import { ExportButton } from './ExportButton';

export default async function AdminOrdersPage() {
  const { success, data: orders } = await getOrders();

  if (!success || !orders) {
    return <div className="p-8">Error al cargar pedidos.</div>;
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Pedidos</h1>
        <p className="text-slate-500">Gestiona y filtra tus ventas.</p>
      </div>
      <ExportButton orders={orders} /> {/* 👈 Aquí el botón */}
      {/* Aquí renderizamos el Cliente Component con los datos */}
      <OrdersView orders={orders} />
    </div>
  );
}