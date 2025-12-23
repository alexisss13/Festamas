'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useUIStore } from '@/store/ui';
import { getUserOrders } from '@/actions/order';
import { OrderStatusBadge } from '@/components/orders/OrderStatusBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Package, Calendar, MapPin, ChevronRight, ShoppingBag, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

export default function OrdersPage() {
  const { currentDivision } = useUIStore();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 🎨 Lógica de Tema Dinámico
  const isToys = currentDivision === 'JUGUETERIA';
  const themeText = isToys ? 'text-[#fc4b65]' : 'text-[#ec4899]';
  // const themeBorder = isToys ? 'border-[#fc4b65]' : 'border-[#ec4899]'; // (Opcional si quieres bordes de color)
  
  useEffect(() => {
    async function loadOrders() {
      const { ok, orders } = await getUserOrders();
      if (ok) {
        setOrders(orders || []);
      }
      setLoading(false);
    }
    loadOrders();
  }, []);

  const formatPrice = (value: number) =>
    new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
    }).format(value);

  const formatDate = (dateString: Date) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-PE', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 min-h-[60vh] flex items-center justify-center">
        <Loader2 className={cn("h-10 w-10 animate-spin", themeText)} />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="container mx-auto px-4 mt-8 md:mt-12 pb-24">
        <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in bg-slate-50 rounded-xl border border-slate-100 border-dashed">
            <div className="bg-white p-6 rounded-full mb-4 shadow-sm">
            <ShoppingBag className="h-12 w-12 text-slate-300" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">No tienes pedidos aún</h2>
            <p className="text-slate-500 max-w-sm mb-6">
            Parece que aún no has realizado ninguna compra. ¡Explora nuestro catálogo!
            </p>
            <Button asChild className={cn("text-white font-bold shadow-md", isToys ? "bg-[#fc4b65] hover:bg-[#e11d48]" : "bg-[#ec4899] hover:bg-[#db2777]")}>
            <Link href="/">
                Ir a la Tienda
            </Link>
            </Button>
        </div>
      </div>
    );
  }

  return (
    // 🏗️ CONTENEDOR PRINCIPAL AJUSTADO (Igual al Home)
    <div className="container mx-auto px-4 mt-8 md:mt-12 pb-24 animate-in slide-in-from-bottom-4">
      
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-3 tracking-tight">
          <Package className={cn("h-8 w-8", themeText)} />
          Mis Pedidos
        </h1>
        <span className="hidden sm:block text-sm text-slate-500 font-medium bg-slate-100 px-4 py-2 rounded-full border border-slate-200">
          {orders.length} {orders.length === 1 ? 'pedido registrado' : 'pedidos registrados'}
        </span>
      </div>

      <div className="grid gap-8">
        {orders.map((order) => (
          <Card key={order.id} className="overflow-hidden border-slate-200 shadow-sm hover:shadow-md transition-all duration-200">
            <CardHeader className="bg-slate-50/80 p-4 sm:p-6 border-b border-slate-100">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <p className="font-bold text-lg text-slate-900">
                      Pedido #{order.id.split('-')[0].toUpperCase()}
                    </p>
                    <OrderStatusBadge status={order.status} isPaid={order.isPaid} />
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                    <Calendar className="h-4 w-4" />
                    {formatDate(order.createdAt)}
                  </div>
                </div>

                <div className="text-left sm:text-right bg-white sm:bg-transparent p-3 sm:p-0 rounded-lg border sm:border-0 border-slate-100">
                  <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-1">Total Pagado</p>
                  <p className={cn("text-2xl font-extrabold leading-none", themeText)}>
                    {formatPrice(Number(order.totalAmount))}
                  </p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-4 sm:p-6">
              {/* Información de entrega */}
              <div className="flex items-start gap-3 mb-6 text-sm text-slate-600 bg-white p-4 rounded-lg border border-slate-100 shadow-sm">
                 <div className={cn("p-2 rounded-full bg-slate-50", themeText)}>
                    <MapPin className="h-5 w-5" />
                 </div>
                 <div>
                    <span className="font-bold block text-slate-900 mb-0.5">
                        {order.deliveryMethod === 'PICKUP' ? 'Recojo en Tienda' : 'Envío a Domicilio'}
                    </span>
                    <span className="text-slate-500 block leading-relaxed">
                        {order.deliveryMethod === 'PICKUP' 
                            ? 'Av. España 123, Trujillo' 
                            : (order.shippingAddress || 'Dirección no registrada')}
                    </span>
                 </div>
              </div>

              <Separator className="mb-6" />

              {/* Grid de productos */}
              <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-slate-900">Productos ({order.totalItems})</h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {order.orderItems.slice(0, 4).map((item: any) => (
                    <div key={`${order.id}-${item.productId}`} className="group flex gap-4 items-center p-2 rounded-lg hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md border bg-white shadow-sm">
                        <Image 
                            src={item.product.images[0] 
                                ? (item.product.images[0].startsWith('http') ? item.product.images[0] : `/products/${item.product.images[0]}`) 
                                : '/placeholder.jpg'} 
                            alt={item.product.title}
                            fill
                            className="object-contain p-1 group-hover:scale-105 transition-transform"
                        />
                        </div>
                        <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-900 truncate leading-tight mb-1">
                            {item.product.title}
                        </p>
                        <p className="text-xs text-slate-500 font-medium">
                            {item.quantity} x {formatPrice(Number(item.price))}
                        </p>
                        </div>
                    </div>
                    ))}
                    
                    {/* Indicador de más items */}
                    {order.orderItems.length > 4 && (
                        <div className="flex flex-col items-center justify-center h-20 rounded-lg bg-slate-50 border border-slate-100 text-slate-500 hover:bg-slate-100 transition-colors cursor-pointer">
                            <span className="text-lg font-bold">+{order.orderItems.length - 4}</span>
                            <span className="text-xs font-medium">más</span>
                        </div>
                    )}
                  </div>
              </div>
            </CardContent>

            <Separator />
            
            <CardFooter className="p-4 bg-slate-50/50 flex justify-end">
                <Button variant="ghost" className="gap-2 text-slate-600 hover:text-slate-900 hover:bg-white border border-transparent hover:border-slate-200 shadow-sm" asChild>
                    <Link href={`#`}>
                        Ver detalle completo <ChevronRight className="h-4 w-4" />
                    </Link>
                </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}