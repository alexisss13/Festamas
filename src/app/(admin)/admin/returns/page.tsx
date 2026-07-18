import { getReturnRequestsAdmin } from '@/actions/returns';
import { ReturnsView } from './ReturnsView';

export const dynamic = 'force-dynamic';

export default async function ReturnsPage() {
  const result = await getReturnRequestsAdmin();
  return <ReturnsView initialRequests={result.success ? result.data : []} />;
}
