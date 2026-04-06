import Link from 'next/link';
import { ArrowLeft, Ticket } from 'lucide-react';
import { CouponForm } from '@/components/admin/CouponForm';
import { getAdminBranch } from '@/actions/admin-settings';
import { getEcommerceContextFromCookie } from '@/lib/ecommerce-context';

export default async function NewCouponPage() {
  const branchId = await getAdminBranch();
  const { branches } = await getEcommerceContextFromCookie();
  
  const activeBranch = branches.find(b => b.id === branchId) ?? branches[0];

  // Estilos dinámicos para el badge
  const badgeClass = "bg-primary/10 text-primary border-primary/20";

  return (
    <div className="p-4 md:p-8 w-full max-w-4xl mx-auto animate-in fade-in duration-500">
      <div className="mb-8">
        <Link 
          href="/admin/coupons" 
          className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 mb-4 transition-colors group"
        >
           <ArrowLeft className="h-4 w-4 mr-1 group-hover:-translate-x-1 transition-transform" /> 
           Volver al listado
        </Link>
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
                    <Ticket className="h-8 w-8 text-slate-400" />
                    Nuevo Cupón
                </h1>
                <p className="text-slate-500 mt-2 text-lg">
                    Crea reglas de descuento y promociones limitadas.
                </p>
            </div>
            
            <div className={`px-4 py-2 rounded-full border text-sm font-bold uppercase tracking-wider ${badgeClass}`}>
                Tienda: {activeBranch?.name || 'Tienda'}
            </div>
        </div>
      </div>

      <CouponForm defaultBranchId={activeBranch?.id} />
    </div>
  );
}