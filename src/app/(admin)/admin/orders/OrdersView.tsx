'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, X, ChevronLeft, ChevronRight, Store, Globe, Pencil, Trash2, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ExportButton } from './ExportButton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';

interface Order {
  id: string;
  clientName: string;
  clientPhone: string;
  status: string;
  isPaid: boolean;
  totalAmount: number;
  createdAt: Date | string;
  deliveryMethod: string;
  notes?: string | null;
  receiptNumber?: string | null;
  shippingCost: number;
  shippingAddress?: string | null;
  orderItems: {
    quantity: number;
    product: {
      title: string;
    };
  }[];
}

interface OrdersViewProps {
  orders: Order[];
  initialFilter?: string;
}

const PAGE_SIZE = 10;

const statusConfig: Record<string, { label: string; className: string }> = {
  PENDING:   { label: 'Pendiente',  className: 'bg-slate-100 text-slate-700 border-slate-300' },
  PAID:      { label: 'Pagado',     className: 'bg-primary/10 text-primary border-primary/30' },
  DELIVERED: { label: 'Entregado', className: 'bg-slate-100 text-slate-700 border-slate-300' },
  CANCELLED: { label: 'Cancelado', className: 'bg-red-50 text-red-600 border-red-200' },
};

const deliveryLabel: Record<string, string> = {
  PICKUP:   'Recoger',
  DELIVERY: 'Delivery',
  PROVINCE: 'Provincia',
};

const isPhone = (value: string) => /^9\d{8}$/.test(value?.trim() ?? '');

const isPOS = (order: Order) =>
  order.notes?.trimStart().startsWith('[VENTA POS]') ||
  Boolean(order.receiptNumber);

export function OrdersView({ orders, initialFilter }: OrdersViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [deliveryFilter, setDeliveryFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(1);

  // Aplicar filtro inicial desde las cards
  useEffect(() => {
    if (initialFilter) {
      switch (initialFilter) {
        case 'toDispatch':
          setStatusFilter('PAID');
          setPaymentFilter('paid');
          break;
        case 'toPay':
          setStatusFilter('PENDING');
          setPaymentFilter('unpaid');
          break;
        case 'completed':
          setStatusFilter('DELIVERED');
          break;
        case 'all':
        default:
          setStatusFilter('all');
          setPaymentFilter('all');
          break;
      }
    }
  }, [initialFilter]);

  const formatPrice = (value: number) =>
    new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(value);

  const formatDateParts = (date: Date | string) => {
    const d = new Date(date);
    const datePart = new Intl.DateTimeFormat('es-PE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(d);
    const timePart = new Intl.DateTimeFormat('es-PE', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(d);
    return { datePart, timePart };
  };

  const toTitleCase = (str: string) =>
    str.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());

  const handleSearch = (v: string) => {
    setSearchTerm(v);
    setPage(1);
  };

  const resetFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setPaymentFilter('all');
    setDeliveryFilter('all');
    setStartDate('');
    setEndDate('');
    setPage(1);
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch = 
      order.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.clientPhone?.includes(searchTerm);
    
    if (searchTerm && !matchesSearch) return false;
    if (statusFilter !== 'all' && order.status !== statusFilter) return false;
    if (paymentFilter === 'paid' && !order.isPaid) return false;
    if (paymentFilter === 'unpaid' && order.isPaid) return false;
    if (deliveryFilter !== 'all' && order.deliveryMethod !== deliveryFilter) return false;

    if (startDate) {
      const orderDate = new Date(order.createdAt);
      const start = new Date(startDate);
      if (orderDate < start) return false;
    }
    if (endDate) {
      const orderDate = new Date(order.createdAt);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      if (orderDate > end) return false;
    }

    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginatedOrders = filteredOrders.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  return (
    <div className="space-y-6 [&_::selection]:bg-slate-200 [&_::selection]:text-slate-900">
      {/* Card de filtros */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-5 sm:p-6">
        {/* Superior: Buscador */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <Input
              placeholder="Buscar por nombre, DNI o email"
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 pr-10 h-11 text-base bg-slate-50/50 border-slate-200 focus-visible:border-primary focus-visible:ring-primary/20"
            />
            {searchTerm && (
              <button
                onClick={() => handleSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>

        {/* Medio: Filtros y Acciones */}
        <div className="flex flex-wrap xl:flex-nowrap items-end gap-x-4 md:gap-x-6 lg:gap-x-6 gap-y-5 mb-6">
          {/* Estado */}
          <div className="w-[180px] shrink-0">
            <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2.5 block">
              Estado
            </label>
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
              <SelectTrigger className="h-10 bg-white border-slate-300 hover:border-primary/50 transition-colors">
                <SelectValue placeholder="Todos los estados" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="PENDING">Pendiente</SelectItem>
                <SelectItem value="PAID">Pagado</SelectItem>
                <SelectItem value="DELIVERED">Entregado</SelectItem>
                <SelectItem value="CANCELLED">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Pago */}
          <div className="shrink-0">
            <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2.5 block">
              Pago
            </label>
            <div className="bg-slate-50/80 p-1 rounded-lg inline-flex flex-wrap items-center gap-1 sm:gap-2 border border-slate-100/50">
              {[
                { id: 'all', label: 'Todos' },
                { id: 'paid', label: 'Pagado' },
                { id: 'unpaid', label: 'Pendiente' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => { setPaymentFilter(opt.id); setPage(1); }}
                  className={cn(
                    "px-4 py-1.5 text-[13px] font-medium transition-colors rounded-md",
                    paymentFilter === opt.id 
                      ? "bg-primary text-white shadow-sm"
                      : "text-slate-500 bg-transparent hover:text-slate-800 hover:bg-slate-200/50"
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Envío */}
          <div className="shrink-0">
            <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2.5 block">
              Envío
            </label>
            <div className="bg-slate-50/80 p-1 rounded-lg inline-flex flex-wrap items-center gap-1 sm:gap-2 border border-slate-100/50">
              {[
                { id: 'all', label: 'Todos' },
                { id: 'PICKUP', label: 'Recoger' },
                { id: 'DELIVERY', label: 'Delivery' },
                { id: 'PROVINCE', label: 'Provincia' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => { setDeliveryFilter(opt.id); setPage(1); }}
                  className={cn(
                    "px-4 py-1.5 text-[13px] font-medium transition-colors rounded-md",
                    deliveryFilter === opt.id 
                      ? "bg-primary text-white shadow-sm"
                      : "text-slate-500 bg-transparent hover:text-slate-800 hover:bg-slate-200/50"
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Acciones */}
          <div className="flex-1 min-w-[60px] mt-2 sm:mt-0 flex flex-col">
            <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2.5 self-start">
              Acciones
            </label>
            <div className="w-full">
              <ExportButton orders={filteredOrders} />
            </div>
          </div>
        </div>

        {/* Inferior: Contador y Paginador de filtros */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-600">
            <span className="font-bold text-slate-900">{filteredOrders.length}</span> {filteredOrders.length === 1 ? 'pedido' : 'pedidos'}
          </p>
          {(startDate || endDate || statusFilter !== 'all' || paymentFilter !== 'all' || deliveryFilter !== 'all' || searchTerm) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={resetFilters}
              className="h-8 text-xs text-slate-500 hover:text-primary hover:bg-primary/10 transition-colors"
            >
              Limpiar filtros
            </Button>
          )}
        </div>
      </div>

      {/* Card de tabla */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
        <div className="w-full overflow-x-auto">
          <Table className="min-w-[860px]">
            <TableHeader>
              <TableRow className="bg-slate-50 hover:bg-slate-50 border-b border-slate-200">
                <TableHead className="h-11 px-4 lg:px-6 font-semibold text-slate-700 w-[130px]">Fecha</TableHead>
                <TableHead className="h-11 px-4 font-semibold text-slate-700 w-[180px]">Cliente</TableHead>
                <TableHead className="h-11 px-4 font-semibold text-slate-700 w-[100px]">Pago</TableHead>
                <TableHead className="h-11 px-4 font-semibold text-slate-700 w-[100px]">Estado</TableHead>
                <TableHead className="h-11 px-4 font-semibold text-slate-700 w-[100px]">Envío</TableHead>
                <TableHead className="h-11 px-4 font-semibold text-slate-700 w-[110px] text-right">Total</TableHead>
                <TableHead className="h-11 px-4 lg:px-6 font-semibold text-slate-700 w-[120px] text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedOrders.map((order) => {
                const currentStatus = order.status || 'PENDING';
                const cfg = statusConfig[currentStatus] || statusConfig.PENDING;

                return (
                  <TableRow key={order.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <TableCell className="py-3 px-4 lg:px-6">
                      {(() => { const { datePart, timePart } = formatDateParts(order.createdAt); return (
                        <div className="flex flex-col tabular-nums">
                          <span className="text-xs font-medium text-slate-600">{datePart}</span>
                          <span className="text-xs text-slate-400 mt-0.5">{timePart}</span>
                        </div>
                      ); })()}
                    </TableCell>
                    <TableCell className="py-3 px-4">
                      <div className="flex flex-col min-w-0">
                        <span className="font-medium text-slate-900 text-sm truncate">{toTitleCase(order.clientName)}</span>
                        {isPhone(order.clientPhone) ? (
                          <span className="text-xs mt-0.5">
                            <span className="text-slate-400">TEL: </span>
                            <a
                              href={`https://wa.me/51${order.clientPhone}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-slate-500 hover:text-primary hover:underline transition-colors"
                            >
                              {order.clientPhone}
                            </a>
                          </span>
                        ) : order.clientPhone && order.clientPhone !== '-' ? (
                          <span className="text-xs text-slate-400 mt-0.5">
                            DNI: {order.clientPhone}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-300 mt-0.5 italic">Sin doc.</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="py-3 px-4">
                      <Badge
                        variant="outline"
                        className={cn(
                          'text-xs font-medium',
                          order.isPaid
                            ? 'bg-primary/10 text-primary border-primary/30'
                            : 'bg-slate-100 text-slate-600 border-slate-300'
                        )}
                      >
                        {order.isPaid ? 'Pagado' : 'Pendiente'}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-3 px-4">
                      <Badge variant="outline" className={cn('text-xs font-medium', cfg.className)}>
                        {cfg.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-3 px-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-sm font-medium text-slate-900">
                          {deliveryLabel[order.deliveryMethod || ''] || order.deliveryMethod || '—'}
                        </span>
                        {isPOS(order) ? (
                          <div className="flex items-center gap-1.5 text-xs text-slate-500">
                            <Store className="w-3.5 h-3.5 text-primary/70" />
                            <span>POS</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-xs text-slate-500">
                            <Globe className="w-3.5 h-3.5 text-primary/70" />
                            <span>WEB</span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="py-3 px-4 text-right">
                      <span className="text-sm font-medium text-slate-700 tabular-nums">
                        {formatPrice(Number(order.totalAmount))}
                      </span>
                    </TableCell>
                    <TableCell className="py-3 px-4 lg:px-6 text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          asChild
                          title="Ver detalle del pedido"
                          className="h-8 w-8 p-0 text-slate-600 hover:text-primary hover:bg-primary/10 cursor-pointer transition-colors"
                        >
                          <Link href={`/admin/orders/${order.id}`}>
                            <Eye className="w-3.5 h-3.5" />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          title="Editar pedido"
                          className="h-8 w-8 p-0 text-slate-600 hover:text-primary hover:bg-primary/10 cursor-pointer transition-colors"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          title="Eliminar pedido"
                          className="h-8 w-8 p-0 text-slate-400 hover:text-red-600 hover:bg-red-50 cursor-pointer transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}

              {filteredOrders.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-400">
                      <Search className="w-10 h-10 mb-2 opacity-20" />
                      <p className="text-sm font-medium">No se encontraron pedidos</p>
                      <p className="text-xs mt-1">Intenta ajustar los filtros de búsqueda</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Paginación */}
        {filteredOrders.length > PAGE_SIZE && (
          <div className="flex items-center justify-between px-4 lg:px-6 py-3 border-t border-slate-100 bg-slate-50/50">
            <p className="text-xs text-slate-500">
              Página <span className="font-semibold text-slate-700">{safePage}</span> de{' '}
              <span className="font-semibold text-slate-700">{totalPages}</span>
              <span className="hidden sm:inline"> · {filteredOrders.length} pedidos en total</span>
            </p>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={safePage <= 1}
                className="h-8 w-8 p-0 text-slate-600 hover:text-primary hover:bg-primary/10 disabled:opacity-40 transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((n) => n === 1 || n === totalPages || Math.abs(n - safePage) <= 1)
                .reduce<(number | '...')[]>((acc, n, idx, arr) => {
                  if (idx > 0 && n - (arr[idx - 1] as number) > 1) acc.push('...');
                  acc.push(n);
                  return acc;
                }, [])
                .map((item, idx) =>
                  item === '...' ? (
                    <span key={`ellipsis-${idx}`} className="px-1.5 text-xs text-slate-400">…</span>
                  ) : (
                    <Button
                      key={item}
                      variant="ghost"
                      size="sm"
                      onClick={() => setPage(item as number)}
                      className={cn(
                        'h-8 w-8 p-0 text-xs font-medium transition-colors',
                        safePage === item
                          ? 'bg-primary text-white hover:bg-primary/90'
                          : 'text-slate-600 hover:text-primary hover:bg-primary/10'
                      )}
                    >
                      {item}
                    </Button>
                  )
                )}

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={safePage >= totalPages}
                className="h-8 w-8 p-0 text-slate-600 hover:text-primary hover:bg-primary/10 disabled:opacity-40 transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
