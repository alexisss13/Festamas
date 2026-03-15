import { ShoppingBag, ArrowUpRight } from "lucide-react";

interface Sale {
  id: string;
  clientName: string;
  clientPhone: string;
  totalAmount: number;
}

interface RecentSalesProps {
  sales: Sale[];
}

export function RecentSales({ sales }: RecentSalesProps) {
  const formatPrice = (value: number) =>
    new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
    }).format(value);

  const truncateName = (name: string) => {
    const words = name.split(' ');
    if (words.length > 3) {
      return words.slice(0, 3).join(' ') + '...';
    }
    return name;
  };

  if (sales.length === 0) {
    return (
      <div className="h-[300px] flex flex-col items-center justify-center">
        <ShoppingBag className="w-10 h-10 sm:w-12 sm:h-12 text-slate-200 mb-3" />
        <p className="text-xs sm:text-sm font-medium text-slate-500">No hay ventas registradas aún.</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {sales.map((sale, index) => (
        <div key={sale.id} className="flex items-center justify-between py-3 px-2 hover:bg-slate-50/30 rounded-lg transition-colors group">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <ArrowUpRight className="w-5 h-5 text-slate-400 shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-900 group-hover:text-primary transition-colors">
                {truncateName(sale.clientName)}
              </p>
              <p className="text-xs text-slate-500 truncate mt-0.5">
                {sale.clientPhone}
              </p>
            </div>
          </div>
          <div className="text-right shrink-0">
            <p className="text-sm font-bold text-slate-900">
              {formatPrice(sale.totalAmount)}
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              Hace {index === 0 ? '5min' : index === 1 ? '1h' : index === 2 ? '3h' : index === 3 ? '1d' : '2d'}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}