import { Avatar, AvatarFallback } from "@/components/ui/avatar";

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

  if (sales.length === 0) {
    return <div className="text-sm text-slate-500">No hay ventas registradas aún.</div>;
  }

  return (
    <div className="space-y-8">
      {sales.map((sale) => (
        <div key={sale.id} className="flex items-center">
          <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-slate-900 text-white font-medium text-xs">
              {sale.clientName.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none text-slate-900">{sale.clientName}</p>
            <p className="text-xs text-slate-500">{sale.clientPhone}</p>
          </div>
          <div className="ml-auto font-medium text-slate-900">
            +{formatPrice(sale.totalAmount)}
          </div>
        </div>
      ))}
    </div>
  );
}