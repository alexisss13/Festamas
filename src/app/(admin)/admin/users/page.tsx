import Link from 'next/link';
import { UserPlus, Search, Users, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { getStaffUsers, getCustomerStats } from '@/actions/admin-users';
import { UserList } from '@/components/admin/UserList';
import { CustomerStats } from '@/components/admin/CustomerStats';
import { CustomerFinder } from '@/components/admin/CustomerFinder';

export default async function AdminUsersPage() {
  const [staffData, customerStats] = await Promise.all([
    getStaffUsers(),
    getCustomerStats()
  ]);

  return (
    <div className="w-full p-4 sm:p-6 lg:p-8 space-y-6 lg:space-y-8 bg-slate-50/50 min-h-[calc(100vh-4rem)] [&_::selection]:bg-slate-200 [&_::selection]:text-slate-900">
      {/* Header */}
      <div className="pb-2 lg:pb-4">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
          Usuarios & Roles
        </h1>
        <p className="text-sm sm:text-base text-slate-500 mt-1 sm:mt-2">
          Control de equipo, métricas y soporte a clientes.
        </p>
      </div>

      <Separator />

      {/* Métricas Globales */}
      <section>
        <div className="mb-4">
          <h2 className="text-base sm:text-lg font-semibold text-slate-800">
            Métricas Globales
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Estadísticas de clientes registrados en la plataforma.
          </p>
        </div>
        <CustomerStats stats={customerStats} staffCount={staffData.users?.length || 0} />
      </section>

      {/* Equipo de Trabajo */}
      <section>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-base sm:text-lg font-semibold text-slate-800">
              Equipo de Trabajo
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Administradores y vendedores con acceso al panel.
            </p>
          </div>
          
          <Button 
            asChild 
            className="shadow-sm transition-all hover:shadow-md bg-slate-900 hover:bg-slate-800 text-white font-medium h-9"
          >
            <Link href="/admin/users/new">
              <UserPlus className="mr-2 h-4 w-4" />
              Nuevo Usuario
            </Link>
          </Button>
        </div>
        <UserList users={staffData.users || []} />
      </section>

      {/* Soporte a Clientes */}
      <section className="bg-white rounded-xl p-4 sm:p-6 border border-slate-200 shadow-sm overflow-hidden">
        <div className="mb-6">
          <h2 className="text-base sm:text-lg font-semibold text-slate-800">
            Soporte & Búsqueda de Clientes
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Busca un cliente específico para editar sus datos o restablecer su contraseña.
          </p>
        </div>
        
        <CustomerFinder />
      </section>
    </div>
  );
}