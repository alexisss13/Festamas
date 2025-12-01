'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Eye, Filter, CheckCircle2, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

// Definimos el tipo de dato que esperamos (simplificado para la vista)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface OrdersViewProps {
  orders: any[]; // Usamos any aquí para facilitar la integración rápida con Prisma
}

const statusColor: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800 border-yellow-200",
  PAID: "bg-green-100 text-green-800 border-green-200",
  DELIVERED: "bg-blue-100 text-blue-800 border-blue-200",
  CANCELLED: "bg-red-100 text-red-800 border-red-200",
};

const statusLabel: Record<string, string> = {
  PENDING: "Pendiente",
  PAID: "Pagado",
  DELIVERED: "Entregado",
  CANCELLED: "Cancelado",
};

export function OrdersView({ orders }: OrdersViewProps) {
  // Estado para forzar re-render si fuera necesario, aunque Tabs lo maneja
  const [activeTab, setActiveTab] = useState("all");

  const formatPrice = (value: number) =>
    new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
    }).format(value);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('es-PE', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };

  // Lógica de Filtrado
  const filteredOrders = orders.filter((order) => {
    if (activeTab === "all") return true;
    
    // 🔥 PRIORIDAD: Pagado (isPaid=true) pero NO entregado ni cancelado
    if (activeTab === "priority") {
      return order.isPaid === true && order.status === 'PENDING';
    }

    // ⏳ POR PAGAR: No pagado (isPaid=false) y no cancelado
    if (activeTab === "unpaid") {
      return order.isPaid === false && order.status !== 'CANCELLED';
    }

    // ✅ COMPLETADOS: Entregados
    if (activeTab === "delivered") {
        return order.status === 'DELIVERED';
      }

    return true;
  });

  return (
    <div className="space-y-6">
      <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <TabsList>
            <TabsTrigger value="all">Todos</TabsTrigger>
            <TabsTrigger value="priority" className="gap-2">
                <Filter className="h-4 w-4" />
                Por Despachar
            </TabsTrigger>
            <TabsTrigger value="unpaid" className="gap-2">
                <Clock className="h-4 w-4" />
                Por Pagar
            </TabsTrigger>
            <TabsTrigger value="delivered" className="gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Historial
            </TabsTrigger>
            </TabsList>
            
            <Badge variant="outline" className="text-base px-4 py-1 bg-white">
                Mostrando: {filteredOrders.length}
            </Badge>
        </div>

        {/* CONTENIDO DE LA TABLA (Se reutiliza para todas las tabs ya que filtramos el array) */}
        <div className="rounded-md border bg-white shadow-sm overflow-hidden">
            <Table>
            <TableHeader>
                <TableRow>
                <TableHead className="w-[100px]">ID</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Pago</TableHead>
                <TableHead>Estado Envío</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Fecha</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {filteredOrders.map((order) => {
                const currentStatus = order.status || 'PENDING';
                
                return (
                    <TableRow key={order.id}>
                    <TableCell className="font-mono text-xs font-medium text-slate-500">
                        {order.id.split('-')[0].toUpperCase()}
                    </TableCell>
                    <TableCell>
                        <div className="flex flex-col">
                        <span className="font-medium text-slate-900">{order.clientName}</span>
                        <a href={`https://wa.me/51${order.clientPhone}`} target="_blank" className="text-xs text-blue-600 hover:underline">
                            {order.clientPhone}
                        </a>
                        </div>
                    </TableCell>
                    <TableCell>
                         {/* Badge de PAGO */}
                         {order.isPaid ? (
                            <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none px-2 shadow-none">
                                Pagado
                            </Badge>
                         ) : (
                            <Badge variant="outline" className="text-slate-500 border-slate-300 shadow-none">
                                Pendiente
                            </Badge>
                         )}
                    </TableCell>
                    <TableCell>
                        {/* Badge de ENVÍO */}
                        <Badge variant="outline" className={`font-medium border-none px-2 py-0.5 shadow-none ${statusColor[currentStatus] || statusColor.PENDING}`}>
                        {statusLabel[currentStatus] || statusLabel.PENDING}
                        </Badge>
                    </TableCell>
                    <TableCell className="text-right font-bold text-slate-900">
                        {formatPrice(Number(order.totalAmount))}
                    </TableCell>
                    <TableCell className="text-right text-xs text-slate-500">
                        {formatDate(order.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                        <Button variant="ghost" size="icon" asChild className="hover:bg-slate-100 h-8 w-8">
                        <Link href={`/admin/orders/${order.id}`}>
                            <Eye className="h-4 w-4 text-slate-500" />
                        </Link>
                        </Button>
                    </TableCell>
                    </TableRow>
                );
                })}
            </TableBody>
            </Table>
            
            {filteredOrders.length === 0 && (
                <div className="p-12 text-center flex flex-col items-center justify-center text-slate-500">
                    <p className="mb-2 text-lg font-medium">No se encontraron pedidos en esta sección.</p>
                    <p className="text-sm">Cambia de pestaña para ver otros resultados.</p>
                </div>
            )}
        </div>
        
        {/* Truco: Necesitamos renderizar los TabsContent vacíos o simples para que Shadcn no se queje, 
            aunque estamos manejando el filtrado visualmente arriba */}
        <TabsContent value="all" />
        <TabsContent value="priority" />
        <TabsContent value="unpaid" />
        <TabsContent value="delivered" />
      </Tabs>
    </div>
  );
}