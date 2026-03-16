'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Eye, Filter, CheckCircle2, Clock, ShoppingCart, Search, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  deliveryMethod?: string;
}

interface OrdersViewProps {
  orders: Order[];
}

const PAGE_SIZE = 10;

const statusConfig: Record<string, { label: string; className: string }> = {
  PENDING:   { label: 'Pendiente',  className: 'bg-slate-100 text-slate-700 border-slate-300' },
  PAID:      { label: 'Pagado',     className: 'bg-slate-900 text-white border-slate-900' },
  DELIVERED: { label: 'Entregado', className: 'bg-slate-100 text-slate-600 border-slate-300' },
  CANCELLED: { label: 'Cancelado', className: 'bg-red-50 text-red-600 border-red-200' },
};

const deliveryLabel: Record<string, string> = {
  PICKUP:   'Recojo',
  DELIVERY: 'Delivery',
  PROVINCE: 'Provincia',
};

export function OrdersView({ orders }: OrdersViewProps) {
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);

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

  const handleTabChange = (v: string) => {
    setActiveTab(v);
    setSearchTerm('');
    setPage(1);
  };

  const handleSearch = (v: string) => {
    setSearchTerm(v);
    setPage(1);
  };

  // Filtro por tab
  const tabFiltered = orders.filter((order) => {
    if (activeTab === 'priority') return order.isPaid === true && order.status === 'PENDING';
    if (activeTab === 'unpaid')   return order.isPaid === false && order.status !== 'CANCELLED';
    if (activeTab === 'delivered') return order.status === 'DELIVERED';
    return true;
  });

  // Filtro por búsqueda
  const filteredOrders = tabFiltered.filter((order) =>
    order.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.clientPhone?.includes(searchTerm)
  );

  // Paginación
  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginatedOrders = filteredOrders.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  return (
    <div className="space-y-4 [&_::selection]:bg-slate-200 [&_::selection]:text-slate-900">
      <Tabs defaultValue="all" className="w-full" onValueChange={handleTabChange}>

        {/* Barra superior: tabs + buscador + contador */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
          <TabsList className="bg-slate-100 border border-slate-200 h-auto p-1 flex-wrap gap-1">
            <TabsTrigger
              value="all"
              className="data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm text-slate-500 text-xs sm:text-sm"
            >
              Todos
            </TabsTrigger>
            <TabsTrigger
              value="priority"
              className="gap-1.5 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm text-slate-500 text-xs sm:text-sm"
            >
              <Filter className="h-3.5 w-3.5" />
              Por Despachar
            </TabsTrigger>
            <TabsTrigger
              value="unpaid"
              className="gap-1.5 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm text-slate-500 text-xs sm:text-sm"
            >
              <Clock className="h-3.5 w-3.5" />
              Por Pagar
            </TabsTrigger>
            <TabsTrigger
              value="delivered"
              className="gap-1.5 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm text-slate-500 text-xs sm:text-sm"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              Historial
            </TabsTrigger>
          </TabsList>

          {/* Buscador */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative max-w-full sm:max-w-sm flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Buscar cliente o teléfono..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 pr-8 h-9 bg-white border-slate-200 focus-visible:border-slate-400 focus-visible:ring-slate-400/20"
              />
              {searchTerm && (
                <button
                  onClick={() => handleSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <div className="text-sm text-slate-500 text-center sm:text-left whitespace-nowrap">
              {filteredOrders.length} {filteredOrders.length === 1 ? 'pedido' : 'pedidos'}
            </div>
          </div>
        </div>

        {/* Tabla */}
        <div className="w-full border border-slate-200 rounded-lg overflow-hidden bg-white shadow-sm">
          <div className="w-full overflow-x-auto">
            <Table className="w-full min-w-[520px]">
              <TableHeader>
                <TableRow className="bg-slate-50 hover:bg-slate-50 border-b border-slate-200">
                  <TableHead className="h-11 px-3 lg:px-4 font-semibold text-slate-700 whitespace-nowrap">Fecha</TableHead>
                  <TableHead className="h-11 px-3 font-semibold text-slate-700 w-full">Cliente</TableHead>
                  <TableHead className="h-11 px-3 font-semibold text-slate-700 whitespace-nowrap">Celular</TableHead>
                  <TableHead className="h-11 px-3 font-semibold text-slate-700 whitespace-nowrap">Pago</TableHead>
                  <TableHead className="h-11 px-3 font-semibold text-slate-700 whitespace-nowrap">Estado</TableHead>
                  <TableHead className="h-11 px-3 font-semibold text-slate-700 whitespace-nowrap">Envío</TableHead>
                  <TableHead className="h-11 px-3 font-semibold text-slate-700 text-right whitespace-nowrap">Total</TableHead>
                  <TableHead className="h-11 px-3 lg:px-4 font-semibold text-slate-700 text-right w-10">Ver</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedOrders.map((order) => {
                  const currentStatus = order.status || 'PENDING';
                  const cfg = statusConfig[currentStatus] || statusConfig.PENDING;

                  return (
                    <TableRow key={order.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                      <TableCell className="py-3 px-3 lg:px-4 whitespace-nowrap align-middle">
                        {(() => { const { datePart, timePart } = formatDateParts(order.createdAt); return (
                          <div className="flex flex-col tabular-nums">
                            <span className="text-xs font-medium text-slate-600">{datePart}</span>
                            <span className="text-xs text-slate-400 mt-0.5">{timePart}</span>
                          </div>
                        ); })()}
                      </TableCell>
                      <TableCell className="py-3 px-3 align-middle">
                        <span className="font-medium text-slate-900 text-sm">{toTitleCase(order.clientName)}</span>
                      </TableCell>
                      <TableCell className="py-3 px-3 whitespace-nowrap align-middle">
                        <a
                          href={`https://wa.me/51${order.clientPhone}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 hover:underline transition-colors"
                        >
                          {/* WhatsApp icon inline SVG */}
                          <svg className="w-3.5 h-3.5 text-[#25D366] shrink-0" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                          </svg>
                          {order.clientPhone}
                        </a>
                      </TableCell>
                      <TableCell className="py-3 px-3 whitespace-nowrap align-middle">
                        <Badge
                          variant="outline"
                          className={cn(
                            'text-xs font-medium',
                            order.isPaid
                              ? 'bg-slate-900 text-white border-slate-900'
                              : 'bg-slate-100 text-slate-600 border-slate-300'
                          )}
                        >
                          {order.isPaid ? 'Pagado' : 'Pendiente'}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-3 px-3 whitespace-nowrap align-middle">
                        <Badge variant="outline" className={cn('text-xs font-medium', cfg.className)}>
                          {cfg.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-3 px-3 whitespace-nowrap align-middle text-slate-600 text-sm">
                        {deliveryLabel[order.deliveryMethod || ''] || order.deliveryMethod || '—'}
                      </TableCell>
                      <TableCell className="py-3 px-3 text-right whitespace-nowrap align-middle font-medium text-slate-900 text-sm">
                        {formatPrice(Number(order.totalAmount))}
                      </TableCell>
                      <TableCell className="py-3 px-3 lg:px-4 text-right align-middle">
                        <Button
                          variant="ghost"
                          size="sm"
                          asChild
                          title="Ver detalle del pedido"
                          className="h-8 w-8 p-0 text-slate-600 hover:text-slate-900 hover:bg-slate-100 cursor-pointer"
                        >
                          <Link href={`/admin/orders/${order.id}`}>
                            <Eye className="w-3.5 h-3.5" />
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}

                {filteredOrders.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="h-32 text-center">
                      <div className="flex flex-col items-center justify-center text-slate-400">
                        <ShoppingCart className="w-10 h-10 mb-2 opacity-20" />
                        <p className="text-sm font-medium">No se encontraron pedidos</p>
                        <p className="text-xs mt-1">Cambia el filtro o el término de búsqueda</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Paginación — dentro del card, separada por borde superior */}
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
                  className="h-8 w-8 p-0 text-slate-600 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-40"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                {/* Números de página */}
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
                          'h-8 w-8 p-0 text-xs font-medium',
                          safePage === item
                            ? 'bg-slate-900 text-white hover:bg-slate-800'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
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
                  className="h-8 w-8 p-0 text-slate-600 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-40"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* TabsContent vacíos requeridos por Radix */}
        <TabsContent value="all" />
        <TabsContent value="priority" />
        <TabsContent value="unpaid" />
        <TabsContent value="delivered" />
      </Tabs>
    </div>
  );
}