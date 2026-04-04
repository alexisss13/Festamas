'use client';

import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RotateCcw, Tag, CreditCard, Truck } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatusFiltersProps {
  statusFilter: string;
  paymentFilter: string;
  deliveryFilter: string;
  onStatusChange: (value: string) => void;
  onPaymentChange: (value: string) => void;
  onDeliveryChange: (value: string) => void;
  onReset: () => void;
}

export function StatusFilters({
  statusFilter,
  paymentFilter,
  deliveryFilter,
  onStatusChange,
  onPaymentChange,
  onDeliveryChange,
  onReset
}: StatusFiltersProps) {
  
  // Verificamos si hay algún filtro aplicado para mostrar el botón de reset
  const hasActiveFilters = statusFilter !== 'all' || paymentFilter !== 'all' || deliveryFilter !== 'all';

  return (
    <div className="flex flex-col gap-3">
      <Label className="text-[13px] font-medium text-slate-500">
        Atributos del Pedido
      </Label>

      <div className="flex flex-col sm:flex-row flex-wrap gap-3">
        
        {/* 1. Selector de Estado */}
        <Select value={statusFilter} onValueChange={onStatusChange}>
          <SelectTrigger 
            className={cn(
              "h-10 bg-white transition-all w-full sm:w-[180px]", // <--- Reducido a 180px
              "focus:ring-2 focus:ring-slate-200 focus:ring-offset-0 focus:border-slate-300",
              "focus-visible:ring-2 focus-visible:ring-slate-200 focus-visible:ring-offset-0 focus-visible:border-slate-300",
              statusFilter !== 'all' 
                ? "border-slate-300 shadow-sm" 
                : "border-slate-200 text-slate-600"
            )}
          >
            <div className="flex items-center gap-2.5 w-full">
              <Tag className={cn("w-4 h-4 transition-colors shrink-0", statusFilter !== 'all' ? "text-slate-600" : "text-slate-400")} />
              <span className="text-sm truncate text-slate-700">
                <SelectValue placeholder="Estado" />
              </span>
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Cualquier estado</SelectItem>
            <SelectItem value="PENDING">Pendiente</SelectItem>
            <SelectItem value="PAID">Pagado</SelectItem>
            <SelectItem value="DELIVERED">Entregado</SelectItem>
            <SelectItem value="CANCELLED">Cancelado</SelectItem>
          </SelectContent>
        </Select>

        {/* 2. Selector de Pago */}
        <Select value={paymentFilter} onValueChange={onPaymentChange}>
          <SelectTrigger 
            className={cn(
              "h-10 bg-white transition-all w-full sm:w-[180px]", // <--- Reducido a 180px
              "focus:ring-2 focus:ring-slate-200 focus:ring-offset-0 focus:border-slate-300",
              "focus-visible:ring-2 focus-visible:ring-slate-200 focus-visible:ring-offset-0 focus-visible:border-slate-300",
              paymentFilter !== 'all' 
                ? "border-slate-300 shadow-sm" 
                : "border-slate-200 text-slate-600"
            )}
          >
            <div className="flex items-center gap-2.5 w-full">
              <CreditCard className={cn("w-4 h-4 transition-colors shrink-0", paymentFilter !== 'all' ? "text-slate-600" : "text-slate-400")} />
              <span className="text-sm truncate text-slate-700">
                <SelectValue placeholder="Pago" />
              </span>
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Cualquier pago</SelectItem>
            <SelectItem value="paid">Pagado</SelectItem>
            <SelectItem value="unpaid">Pendiente</SelectItem>
          </SelectContent>
        </Select>

        {/* 3. Selector de Envío */}
        <Select value={deliveryFilter} onValueChange={onDeliveryChange}>
          <SelectTrigger 
            className={cn(
              "h-10 bg-white transition-all w-full sm:w-[180px]", // <--- Reducido a 180px
              "focus:ring-2 focus:ring-slate-200 focus:ring-offset-0 focus:border-slate-300",
              "focus-visible:ring-2 focus-visible:ring-slate-200 focus-visible:ring-offset-0 focus-visible:border-slate-300",
              deliveryFilter !== 'all' 
                ? "border-slate-300 shadow-sm" 
                : "border-slate-200 text-slate-600"
            )}
          >
            <div className="flex items-center gap-2.5 w-full">
              <Truck className={cn("w-4 h-4 transition-colors shrink-0", deliveryFilter !== 'all' ? "text-slate-600" : "text-slate-400")} />
              <span className="text-sm truncate text-slate-700">
                <SelectValue placeholder="Envío" />
              </span>
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Cualquier envío</SelectItem>
            <SelectItem value="PICKUP">Recoger</SelectItem>
            <SelectItem value="DELIVERY">Delivery</SelectItem>
            <SelectItem value="PROVINCE">Provincia</SelectItem>
          </SelectContent>
        </Select>

      </div>
    </div>
  );
}