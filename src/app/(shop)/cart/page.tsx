'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCartStore } from '@/store/cart';
import { createOrder } from '@/actions/order';

export default function CartPage() {
  const { items, removeItem, updateQuantity, getTotalPrice, clearCart } = useCartStore();
  const [isMounted, setIsMounted] = useState(false);
  
  // Estados del Formulario
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // NUEVO: Estado para errores de validación
  const [errors, setErrors] = useState<{ name?: string[], phone?: string[] }>({});

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMounted(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const formatPrice = (value: number) =>
    new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
    }).format(value);

  const handleCheckout = async () => {
    setErrors({}); // Limpiamos errores previos

    setIsSubmitting(true);

    const result = await createOrder({
      name,
      phone,
      total: getTotalPrice(),
      items: items.map((item) => ({
        productId: item.id,
        quantity: item.quantity,
        price: item.price,
      })),
    });

    // MANEJO DE ERRORES MEJORADO
    if (!result.success) {
      setIsSubmitting(false);
      
      // Si el error es de validación (Zod), lo guardamos en el estado
      if (result.errors) {
        setErrors(result.errors);
        return;
      }

      // Si es otro error (Base de datos caída, etc)
      alert(result.message || 'Error desconocido');
      return;
    }

    // ÉXITO
    const phoneNumber = '960633393'; // ⚠️ TU NÚMERO
    const shortId = result.orderId!.split('-')[0].toUpperCase();

    let message = `Hola FiestasYa. Acabo de generar el pedido *#${shortId}* en la web.\n`;
    message += `Soy *${name}*.\n\n`;
    message += `Detalle del pedido:\n`;
    
    items.forEach((item) => {
      message += `• ${item.quantity}x ${item.title}\n`;
    });
    
    message += `\n*Total a pagar: ${formatPrice(getTotalPrice())}*`;
    message += `\n\nQuedo atento para coordinar el pago y envío.`;

    clearCart();
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    
    setTimeout(() => {
        window.open(url, '_blank');
        setIsSubmitting(false);
    }, 500);
  };

  if (!isMounted) return <div className="min-h-[60vh] flex items-center justify-center text-slate-500">Cargando...</div>;

  if (items.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center px-4">
        {/* ... (Lo mismo de antes) ... */}
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-100">
          <ShoppingBag className="h-10 w-10 text-slate-400" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">Tu carrito está vacío</h2>
        <p className="text-slate-500 max-w-sm">Aún no tienes productos.</p>
        <Button asChild size="lg" className="mt-4">
          <Link href="/">Ver Productos <ArrowRight className="ml-2 h-4 w-4" /></Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold text-slate-900">Carrito de Compras</h1>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* COLUMNA IZQUIERDA (Items) - IGUAL QUE ANTES */}
        <div className="lg:col-span-7 space-y-4">
          {items.map((item) => (
             <Card key={item.id} className="overflow-hidden border-slate-200">
               <CardContent className="flex gap-4 p-4">
                 <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-md border bg-slate-100">
                   <Image src={item.image} alt={item.title} fill className="object-cover" />
                 </div>
                 <div className="flex flex-1 flex-col justify-between">
                   <div className="flex justify-between gap-2">
                     <h3 className="font-semibold text-slate-900 line-clamp-2">{item.title}</h3>
                     <p className="font-bold text-slate-900">{formatPrice(item.price * item.quantity)}</p>
                   </div>
                   <div className="flex items-center justify-between mt-2">
                     <div className="flex items-center gap-2 rounded-md border p-1">
                       <Button variant="ghost" size="icon" className="h-6 w-6" disabled={item.quantity <= 1} onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                         <Minus className="h-3 w-3" />
                       </Button>
                       <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                       <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                         <Plus className="h-3 w-3" />
                       </Button>
                     </div>
                     <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => removeItem(item.id)}>
                       <Trash2 className="mr-2 h-4 w-4" />
                       Eliminar
                     </Button>
                   </div>
                 </div>
               </CardContent>
             </Card>
          ))}
        </div>

        {/* COLUMNA DERECHA (Formulario Actualizado) */}
        <div className="lg:col-span-5">
          <Card className="bg-slate-50 border-slate-200 sticky top-24">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">Datos de Contacto</h2>
              
              <div className="space-y-4 mb-6">
                
                {/* INPUT NOMBRE */}
                <div className="grid w-full items-center gap-1.5">
                  <Label htmlFor="name" className={errors.name ? "text-red-500" : ""}>
                    Nombre completo
                  </Label>
                  <Input 
                    id="name" 
                    placeholder="Ej: Juan Pérez" 
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      // Si hay un error en 'name', lo borramos al escribir
                      if (errors.name) {
                        setErrors({ ...errors, name: undefined });
                      }
                    }}
                    className={errors.name ? "border-red-500 bg-red-50 focus-visible:ring-red-500" : "bg-white"}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-500 animate-pulse">{errors.name[0]}</p>
                  )}
                </div>

                {/* INPUT CELULAR */}
                <div className="grid w-full items-center gap-1.5">
                  <Label htmlFor="phone" className={errors.phone ? "text-red-500" : ""}>
                    Celular (WhatsApp)
                  </Label>
                  <Input 
                    id="phone" 
                    placeholder="Ej: 999111222" 
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      // Si hay un error en 'phone', lo borramos al escribir
                      if (errors.phone) {
                        setErrors({ ...errors, phone: undefined });
                      }
                    }}
                    maxLength={9}
                    className={errors.phone ? "border-red-500 bg-red-50 focus-visible:ring-red-500" : "bg-white"}
                  />
                  {errors.phone && (
                    <p className="text-sm text-red-500 animate-pulse">{errors.phone[0]}</p>
                  )}
                </div>

              </div>

              <Separator className="my-4" />
              
              <div className="space-y-2 text-sm mb-4">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span>{formatPrice(getTotalPrice())}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Envío</span>
                  <span>A coordinar</span>
                </div>
              </div>

              <div className="flex justify-between text-lg font-bold text-slate-900 mb-6">
                <span>Total</span>
                <span>{formatPrice(getTotalPrice())}</span>
              </div>

              <Button 
                size="lg" 
                className="w-full bg-green-600 hover:bg-green-700 text-lg"
                onClick={handleCheckout}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Procesando...
                    </>
                ) : (
                    'Completar pedido por WhatsApp'
                )}
              </Button>
              
              <p className="mt-4 text-xs text-center text-slate-500">
                Al confirmar, se guardará tu pedido y te redirigiremos a WhatsApp para finalizar el pago.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}