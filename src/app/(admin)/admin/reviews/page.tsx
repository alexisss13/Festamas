import { getAllReviews } from '@/actions/reviews';
import { ReviewsManagement } from './ReviewsManagement';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, Clock, XCircle, LucideIcon } from 'lucide-react';
import { getAdminBranch } from '@/actions/admin-settings';
import { getEcommerceContextFromCookie } from '@/lib/ecommerce-context';

export const metadata = {
  title: 'Gestión de Reseñas | Admin',
  description: 'Administra las reseñas de productos',
};

interface Props {
  searchParams: Promise<{
    page?: string;
    status?: string;
  }>;
}

export default async function ReviewsPage({ searchParams }: Props) {
  const session = await auth();

  if (!session?.user || !['ADMIN', 'SUPER_ADMIN', 'OWNER', 'MANAGER'].includes(session.user.role as string)) {
    redirect('/');
  }

  const branchId = await getAdminBranch();
  const { branches } = await getEcommerceContextFromCookie();
  
  const activeBranch = branches.find(b => b.id === branchId) ?? branches[0];
  const storeName = activeBranch ? activeBranch.name : 'Tienda';

  const { page, status } = await searchParams;
  const currentPage = Number(page) || 1;
  const currentStatus = status || 'PENDING';

  const result = await getAllReviews(currentPage, currentStatus);
  const reviews = result.success ? result.reviews : [];
  const totalPages = result.totalPages || 1;
  const totalCount = result.totalCount || 0;

  // Componente de KPI card
  function StatCard({ 
    title, 
    value, 
    icon: Icon, 
    description,
    color = 'primary'
  }: { 
    title: string; 
    value: number; 
    icon: LucideIcon; 
    description: string;
    color?: string;
  }) {
    const colorClasses = {
      primary: 'bg-primary/10 text-primary',
      green: 'bg-green-100 text-green-700',
      yellow: 'bg-yellow-100 text-yellow-700',
      red: 'bg-red-100 text-red-700',
    };

    return (
      <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs sm:text-sm font-semibold text-slate-600 leading-tight">{title}</span>
          <div className={`p-2 sm:p-2.5 rounded-full shrink-0 ${colorClasses[color as keyof typeof colorClasses] || colorClasses.primary}`}>
            <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>
        <div className="text-2xl sm:text-3xl font-bold text-slate-900 tabular-nums">{value}</div>
        <p className="text-[10px] sm:text-xs text-slate-500 mt-1.5 font-medium leading-tight">{description}</p>
      </div>
    );
  }

  // Obtener estadísticas de cada estado
  const [pendingResult, approvedResult, rejectedResult] = await Promise.all([
    getAllReviews(1, 'PENDING'),
    getAllReviews(1, 'APPROVED'),
    getAllReviews(1, 'REJECTED'),
  ]);
  
  const stats = {
    total: (pendingResult.totalCount || 0) + (approvedResult.totalCount || 0) + (rejectedResult.totalCount || 0),
    pending: pendingResult.totalCount || 0,
    approved: approvedResult.totalCount || 0,
    rejected: rejectedResult.totalCount || 0,
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 lg:space-y-8 bg-white min-h-[calc(100vh-4rem)]">
      
      {/* Header */}
      <div className="pb-2 lg:pb-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Gestión de <span className="text-primary">Reseñas</span>
            </h1>
            <p className="text-sm sm:text-base text-slate-500 mt-1 sm:mt-2">
              Revisa y aprueba las opiniones de los clientes de {storeName}.
            </p>
          </div>
        </div>
      </div>

      <Separator />

      {/* KPIs - Indicadores visuales */}
      <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Pendientes"
          value={stats.pending}
          icon={Clock}
          description="Por revisar"
          color="yellow"
        />
        <StatCard
          title="Aprobadas"
          value={stats.approved}
          icon={CheckCircle}
          description="Publicadas"
          color="green"
        />
        <StatCard
          title="Rechazadas"
          value={stats.rejected}
          icon={XCircle}
          description="No publicadas"
          color="red"
        />
      </div>

      {/* Lista de reseñas */}
      <section>
        <ReviewsManagement 
          initialReviews={reviews} 
          initialPage={currentPage}
          totalPages={totalPages}
          totalCount={totalCount}
          initialStatus={currentStatus}
        />
      </section>

    </div>
  );
}
