import { getAdminPopup } from '@/actions/popups';
import { PopupManager } from '@/components/admin/PopupManager';

export default async function AdminPopupsPage() {
  const result = await getAdminPopup();
  return <div className="p-6"><div className="mb-6"><h1 className="text-2xl font-bold text-slate-900">Popups y campañas</h1><p className="text-sm text-slate-500">Personalización de la sucursal activa</p></div><PopupManager initialPopup={result.success ? result.popup : null} /></div>;
}
