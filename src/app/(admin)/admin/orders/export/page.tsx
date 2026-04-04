import { getOrders } from '@/actions/order';
import { ExportView } from './ExportView';
import { redirect } from 'next/navigation';

export default async function ExportPage() {
  const result = await getOrders();

  if (!result.success || !result.data) {
    redirect('/admin/orders');
  }

  return <ExportView orders={result.data} />;
}
