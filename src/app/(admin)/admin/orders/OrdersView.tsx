'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Filter, CheckCircle2, Clock, ShoppingCart, Search, X, ChevronLeft, ChevronRight, Store, Globe, Pencil, Trash2, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ExportButton } from './ExportButton';
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
  notes?: string | null;
  receiptNumber?: string | null;
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
  PICKUP:   'Recoger',
  DELIVERY: 'Delivery',
  PROVINCE: 'Provincia',
};

// Un celular peruano tiene 9 dígitos y empieza con 9
const isPhone = (value: string) => /^9\d{8}$/.test(value?.trim() ?? '');

// Orden creada desde el POS (siempre deja el prefijo [VENTA POS] en notes)
const isPOS = (order: Order) =>
  order.notes?.trimStart().startsWith('[VENTA POS]') ||
  Boolean(order.receiptNumber);

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
    <div className="space-y-6 [&_::selection]:bg-slate-200 [&_::selection]:text-slate-900">
      <Tabs defaultValue="all" className="w-full" onValueChange={handleTabChange}>

        {/* Barra superior: tabs + buscador + contador */}
        <div className="flex flex-col gap-4">
          {/* Tabs y contador en la misma línea */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
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

            <div className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg">
              <ShoppingCart className="h-4 w-4 text-slate-400" />
              <span className="text-sm font-semibold text-slate-900">{filteredOrders.length}</span>
              <span className="text-sm text-slate-500">{filteredOrders.length === 1 ? 'pedido' : 'pedidos'}</span>
            </div>
          </div>

          {/* Buscador y Exportar en su propia línea */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Buscar por cliente o teléfono..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 pr-8 h-10 bg-white border-slate-200 focus-visible:border-slate-400 focus-visible:ring-slate-400/20"
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
            <div className="ml-auto">
              <ExportButton orders={filteredOrders} />
            </div>
          </div>
        </div>

        {/* Tabla */}
        <div className="w-full border border-slate-200 rounded-lg overflow-hidden bg-white shadow-sm mt-6">
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
                    <TableRow key={order.id} className="border-b border-slate-100 hover:bg-slate-50/50">
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
                                className="text-slate-500 hover:text-slate-700 hover:underline transition-colors"
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
                              ? 'bg-slate-900 text-white border-slate-900'
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
                          <span className="text-sm font-medium text-slate-700">
                            {deliveryLabel[order.deliveryMethod || ''] || order.deliveryMethod || '—'}
                          </span>
                          {isPOS(order) ? (
                            <div className="flex items-center gap-1.5 text-xs text-slate-500">
                              <Store className="w-3.5 h-3.5 text-slate-400" />
                              <span>POS</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 text-xs text-slate-500">
                              <Globe className="w-3.5 h-3.5 text-slate-400" />
                              <span>WEB</span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="py-3 px-4 text-right">
                        <span className="text-sm font-bold text-slate-900 tabular-nums">
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
                            className="h-8 w-8 p-0 text-slate-600 hover:text-slate-900 hover:bg-slate-100 cursor-pointer"
                          >
                            <Link href={`/admin/orders/${order.id}`}>
                              <Eye className="w-3.5 h-3.5" />
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            title="Editar pedido"
                            className="h-8 w-8 p-0 text-slate-600 hover:text-slate-900 hover:bg-slate-100 cursor-pointer"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            title="Eliminar pedido"
                            className="h-8 w-8 p-0 text-slate-400 hover:text-red-600 hover:bg-red-50 cursor-pointer"
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