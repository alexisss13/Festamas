import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, XCircle, Truck } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  status: string; // O el enum OrderStatus
  isPaid: boolean;
}

export const OrderStatusBadge = ({ status, isPaid }: Props) => {
  
  if (status === 'PENDING') {
    return (
      <Badge variant="outline" className="gap-2 bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-50">
        <Clock className="w-3 h-3" />
        Pendiente de Pago
      </Badge>
    );
  }

  if (status === 'PAID' || isPaid) {
    return (
      <Badge className="gap-2 bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100 shadow-none">
        <CheckCircle className="w-3 h-3" />
        Pagado
      </Badge>
    );
  }

  if (status === 'DELIVERED') {
    return (
      <Badge className="gap-2 bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-100 shadow-none">
        <Truck className="w-3 h-3" />
        Entregado
      </Badge>
    );
  }

  return (
    <Badge variant="destructive" className="gap-2">
      <XCircle className="w-3 h-3" />
      Cancelado
    </Badge>
  );
};