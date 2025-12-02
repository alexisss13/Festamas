'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, Loader2, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCartStore } from '@/store/cart';
import { createOrder } from '@/actions/order';
import { getStoreConfig } from '@/actions/settings';
import { validateCoupon } from '@/actions/coupon';
import { toast } from 'sonner';

export default function CartPage() {
  const { items, removeItem, updateQuantity, getTotalPrice, clearCart, applyCoupon, removeCoupon, getDiscountAmount, getFinalPrice, coupon } = useCartStore();
  const [isMounted, setIsMounted] = useState(false);
  
  // Estados del Formulario
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ name?: string[], phone?: string[] }>({});

  const [storeConfig, setStoreConfig] = useState({
    whatsappPhone: '51999999999',
    welcomeMessage: 'Hola, quiero confirmar mi pedido.'
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMounted(true);
    }, 100);

    getStoreConfig().then((config) => {
      if (config) {
        setStoreConfig({
          whatsappPhone: config.whatsappPhone,
          welcomeMessage: config.welcomeMessage
        });
      }
    });

    return () => clearTimeout(timer);
  }, []);

  const handleApplyCoupon = async () => {
      if (!couponCode) return;
      const res = await validateCoupon(couponCode);
      if (res.success && res.coupon) {
          applyCoupon(res.coupon);
          toast.success('Cupón aplicado');
          setCouponCode(''); // Limpiar input tras aplicar
      } else {
          toast.error(res.message);
      }
  };

  const formatPrice = (value: number) =>
    new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
    }).format(value);

  const handleCheckout = async () => {
    setErrors({});
    setIsSubmitting(true);

    const result = await createOrder({
      name,
      phone,
      total: getFinalPrice(), // Enviamos el precio final con descuento
      items: items.map((item) => ({
        productId: item.id,
        quantity: item.quantity,
        price: item.price,
      })),
    });

    if (!result.success) {
      setIsSubmitting(false);
      if (result.errors) {
        setErrors(result.errors);
        return;
      }
      toast.error(result.message || 'Error desconocido');
      return;
    }

    const shortId = result.orderId!.split('-')[0].toUpperCase();

    let message = `${storeConfig.welcomeMessage}\n\n`; 
    message += `--------------------------------\n`;
    message += `*Pedido:* #${shortId}\n`;
    message += `*Cliente:* ${name}\n`;
    message += `--------------------------------\n\n`;
    message += `*Detalle:*\n`;
    
    items.forEach((item) => {
      message += `• ${item.quantity}x ${item.title}\n`;
    });
    
    // Agregamos info del descuento al mensaje si existe
    if (coupon) {
        message += `\nSubtotal: ${formatPrice(getTotalPrice())}`;
        message += `\nDescuento (${coupon.code}): -${formatPrice(getDiscountAmount())}`;
    }
    
    message += `\n*TOTAL A PAGAR: ${formatPrice(getFinalPrice())}*`;
    message += `\n\nQuedo atento a los datos de pago.`;

    clearCart();
    
    const url = `https://wa.me/${storeConfig.whatsappPhone}?text=${encodeURIComponent(message)}`;
    
    setTimeout(() => {
        window.open(url, '_blank');
        setIsSubmitting(false);
    }, 500);
  };

  if (!isMounted) return <div className="min-h-[60vh] flex items-center justify-center text-slate-500">Cargando...</div>;

  if (items.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center px-4">
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

        <div className="lg:col-span-5">
          <Card className="bg-slate-50 border-slate-200 sticky top-24">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">Resumen del Pedido</h2>
              
              <div className="space-y-4 mb-6">
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
                      if (errors.name) setErrors({ ...errors, name: undefined });
                    }}
                    className={errors.name ? "border-red-500 bg-red-50 focus-visible:ring-red-500" : "bg-white"}
                  />
                  {errors.name && <p className="text-sm text-red-500 animate-pulse">{errors.name[0]}</p>}
                </div>

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
                      if (errors.phone) setErrors({ ...errors, phone: undefined });
                    }}
                    maxLength={9}
                    className={errors.phone ? "border-red-500 bg-red-50 focus-visible:ring-red-500" : "bg-white"}
                  />
                  {errors.phone && <p className="text-sm text-red-500 animate-pulse">{errors.phone[0]}</p>}
                </div>
              </div>

              <Separator className="my-4" />
              
              {/* SECCIÓN CUPÓN MEJORADA */}
              <div className="mb-4">
                  {!coupon ? (
                      <div className="flex gap-2">
                          <div className="relative w-full">
                            <Tag className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                            <Input 
                                placeholder="Código de cupón" 
                                value={couponCode}
                                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                className="bg-white pl-9"
                            />
                          </div>
                          <Button variant="outline" onClick={handleApplyCoupon} className="shrink-0">Aplicar</Button>
                      </div>
                  ) : (
                      <div className="flex items-center justify-between bg-green-50 p-3 rounded-md border border-green-200">
                          <div className="flex items-center gap-2">
                             <Tag className="h-4 w-4 text-green-600" />
                             <span className="text-sm text-green-700 font-medium">
                                Cupón <strong>{coupon.code}</strong> aplicado
                             </span>
                          </div>
                          <Button variant="ghost" size="icon" onClick={removeCoupon} className="h-6 w-6 text-green-700 hover:text-green-900 hover:bg-green-100">
                              <span className="sr-only">Quitar</span>
                              <Trash2 className="h-4 w-4" />
                          </Button>
                      </div>
                  )}
              </div>

              {/* TOTALES */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span>{formatPrice(getTotalPrice())}</span>
                </div>
                
                {/* Descuento condicional */}
                {coupon && (
                  <div className="flex justify-between text-green-600 font-medium">
                    <span>Descuento</span>
                    <span>- {formatPrice(getDiscountAmount())}</span>
                  </div>
                )}

                <div className="flex justify-between text-slate-600">
                  <span>Envío</span>
                  <span className="text-xs font-medium bg-slate-100 px-2 py-0.5 rounded text-slate-500">A coordinar</span>
                </div>
              </div>

              <Separator className="my-4" />

              <div className="flex justify-between items-end mb-6">
                  <span className="text-base font-medium text-slate-900">Total a Pagar</span>
                  <span className="text-2xl font-bold text-slate-900">{formatPrice(getFinalPrice())}</span>
              </div>

              <Button 
                size="lg" 
                className="w-full bg-green-600 hover:bg-green-700 text-lg shadow-md shadow-green-900/10 transition-all hover:scale-[1.01]"
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
              
              <p className="mt-4 text-xs text-center text-slate-500 leading-relaxed">
                Al confirmar, se guardará tu pedido y te redirigiremos a WhatsApp para coordinar el pago y la entrega.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}