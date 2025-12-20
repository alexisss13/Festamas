import Link from 'next/link';
import { UserPlus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getStaffUsers, getCustomerStats } from '@/actions/admin-users';
import { getAdminDivision } from '@/actions/admin-settings';
import { UserList } from '@/components/admin/UserList';
import { CustomerStats } from '@/components/admin/CustomerStats';
import { CustomerFinder } from '@/components/admin/CustomerFinder'; // 👈 Importamos
import { cn } from '@/lib/utils';

export default async function AdminUsersPage() {
  const selectedDivision = await getAdminDivision();
  
  const [staffData, customerStats] = await Promise.all([
    getStaffUsers(),
    getCustomerStats()
  ]);
  
  const isFestamas = selectedDivision === 'JUGUETERIA';

  return (
    <div className="p-4 md:p-8 w-full max-w-7xl mx-auto animate-in fade-in duration-500 pb-20">
      
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">Gestión de Usuarios</h1>
        <p className="text-sm text-slate-500 mt-1">Control de equipo, métricas y soporte a clientes.</p>
      </div>

      {/* 1. MÉTRICAS */}
      <section className="mb-10">
        <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            Métricas Globales
        </h2>
        <CustomerStats stats={customerStats} division={selectedDivision} />
      </section>

      {/* 2. STAFF (EQUIPO) */}
      <section className="mb-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-b pb-4">
            <div>
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    Equipo de Trabajo (Staff)
                </h2>
                <p className="text-xs text-slate-500">
                    Administradores y Vendedores con acceso al panel.
                </p>
            </div>
            
            <Button 
              asChild 
              className={cn(
                "shadow-md transition-all active:scale-[0.98] text-white font-bold",
                isFestamas 
                  ? "bg-festamas-primary hover:bg-festamas-primary/90" 
                  : "bg-fiestasya-accent hover:bg-fiestasya-accent/90"
              )}
            >
              <Link href="/admin/users/new">
                <UserPlus className="mr-2 h-4 w-4" />
                Registrar Staff
              </Link>
            </Button>
        </div>
        <UserList users={staffData.users || []} division={selectedDivision} />
      </section>

      {/* 3. SOPORTE A CLIENTES (BUSCADOR) */}
      <section className="bg-slate-50 rounded-xl p-6 border border-slate-200">
        <div className="mb-6">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Search className="w-5 h-5 text-slate-500" /> Soporte & Búsqueda de Clientes
            </h2>
            <p className="text-sm text-slate-500 mt-1">
                Busca un cliente específico para editar sus datos o restablecer su contraseña en caso de emergencia.
            </p>
        </div>
        
        <CustomerFinder division={selectedDivision} />
      </section>

    </div>
  );
}