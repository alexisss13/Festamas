import { notFound } from 'next/navigation';
import Image from 'next/image';
import { getOrderById } from '@/actions/order';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { OrderActions } from './OrderActions';

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export default async function OrderDetailPage({ params }: Props) {
  const { id } = await params;
  const result = await getOrderById(id);

  if (!result || !result.order) {
    notFound();
  }

  const { order } = result;

  const formatPrice = (value: number) =>
    new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
    }).format(value);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('es-PE', {
      dateStyle: 'long',
      timeStyle: 'short',
    }).format(date);
  };

  // 1. CÁLCULO DE TOTALES
  // Calculamos cuánto debería costar sin descuento sumando los items
  const subTotalCalculated = order.orderItems.reduce((acc, item) => {
    return acc + (Number(item.price) * item.quantity);
  }, 0);

  const totalPaid = Number(order.totalAmount);
  
  // Si el total pagado es MENOR que la suma de items, hubo descuento
  const discountAmount = subTotalCalculated - totalPaid;
  const hasDiscount = discountAmount > 0.01; // Margen por decimales

  return (
    <div className="p-8 w-full max-w-7xl mx-auto">
      
      {/* HEADER */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Pedido #{order.id.split('-')[0].toUpperCase()}
          </h1>
          <p className="text-slate-500 mt-1">
            Realizado el {formatDate(order.createdAt)}
          </p>
        </div>
        <div className="flex gap-2">
           {/* BADGE DE ESTADO */}
           {order.status === 'PENDING' && (
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 text-lg px-4 py-1">
                Pendiente
              </Badge>
            )}
            {order.status === 'DELIVERED' && (
              <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-100 text-lg px-4 py-1">
                Entregado
              </Badge>
            )}
            {order.status === 'CANCELLED' && (
              <Badge variant="destructive" className="text-lg px-4 py-1">
                Cancelado
              </Badge>
            )}

            {/* BADGE DE PAGO */}
            {order.isPaid ? (
               <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-green-200 text-lg px-4 py-1">
                 Pagado
               </Badge>
            ) : (
               <Badge variant="outline" className="text-slate-500 text-lg px-4 py-1">
                 No Pagado
               </Badge>
            )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* COLUMNA IZQUIERDA (2/3): DETALLE DE ITEMS */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Productos</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Producto</TableHead>
                    <TableHead className="text-right">Precio</TableHead>
                    <TableHead className="text-right">Cant.</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {order.orderItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="flex items-center gap-4">
                        <div className="relative h-12 w-12 overflow-hidden rounded border bg-slate-100">
                          {item.product.images[0] && (
                            <Image 
                              src={item.product.images[0]} 
                              alt={item.product.title} 
                              fill 
                              className="object-cover" 
                            />
                          )}
                        </div>
                        <span className="font-medium text-slate-900">{item.product.title}</span>
                      </TableCell>
                      <TableCell className="text-right">{formatPrice(Number(item.price))}</TableCell>
                      <TableCell className="text-right">{item.quantity}</TableCell>
                      <TableCell className="text-right font-bold">
                        {formatPrice(Number(item.price) * item.quantity)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              <div className="flex justify-end mt-6">
                <div className="w-full md:w-1/3 space-y-2">
                  <div className="flex justify-between text-sm text-slate-600">
                    <span>Subtotal</span>
                    <span>{formatPrice(subTotalCalculated)}</span>
                  </div>
                  
                  {/* 2. MOSTRAR DESCUENTO SI EXISTE */}
                  {hasDiscount && (
                    <div className="flex justify-between text-sm text-green-600 font-medium">
                        <span>Descuento Aplicado</span>
                        <span>- {formatPrice(discountAmount)}</span>
                    </div>
                  )}

                  <Separator />
                  <div className="flex justify-between text-xl font-bold text-slate-900">
                    <span>Total</span>
                    <span>{formatPrice(totalPaid)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* COLUMNA DERECHA (1/3): INFO CLIENTE Y ACCIONES */}
        <div className="space-y-6">
          
          <OrderActions 
            orderId={order.id} 
            initialStatus={order.status} 
            initialIsPaid={order.isPaid} 
          />

          <Card>
            <CardHeader>
              <CardTitle>Cliente</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-slate-500">Nombre</p>
                <p className="text-lg font-medium text-slate-900">{order.clientName}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">WhatsApp</p>
                <div className="flex items-center gap-2">
                    <p className="text-lg font-medium text-slate-900">{order.clientPhone}</p>
                    <a 
                        href={`https://wa.me/51${order.clientPhone}`} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-green-600 text-sm hover:underline"
                    >
                        (Abrir Chat)
                    </a>
                </div>
              </div>
            </CardContent>
          </Card>

        </div>

      </div>
    </div>
  );
}