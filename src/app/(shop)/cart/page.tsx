'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, Loader2, Tag, MapPin, Truck, Store, MessageSquarePlus, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useCartStore, getEffectivePrice, CartProduct } from '@/store/cart';
import { useUIStore } from '@/store/ui';
import { createOrder } from '@/actions/order';
import { getStoreConfig } from '@/actions/settings';
import { validateCoupon } from '@/actions/coupon';
import { getProducts } from '@/actions/products'; 
import { ProductCarousel } from '@/components/features/ProductCarousel'; 
import { toast } from 'sonner';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { Division } from '@prisma/client';

export default function CartPage() {
  const { 
    cart: items, 
    removeProduct: removeItem, 
    updateProductQuantity: updateQuantity, 
    getSubtotalPrice, 
    clearCart, 
    applyCoupon, 
    removeCoupon, 
    getDiscountAmount, 
    getFinalPrice, 
    coupon 
  } = useCartStore();

  const { currentDivision } = useUIStore(); 
  
  const [isMounted, setIsMounted] = useState(false);
  const [recommended, setRecommended] = useState<any[]>([]);
  
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ name?: string[], phone?: string[], address?: string[] }>({});
  const [deliveryMethod, setDeliveryMethod] = useState('PICKUP'); 
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');

  const [storeConfig, setStoreConfig] = useState({
    whatsappPhone: '51999999999',
    welcomeMessage: 'Hola, quiero confirmar mi pedido.',
    localDeliveryPrice: 0
  });

  const isToys = currentDivision === 'JUGUETERIA';
  const themeColor = isToys ? 'text-[#fc4b65]' : 'text-[#ec4899]';
  const btnBg = isToys ? 'bg-[#fc4b65] hover:bg-[#e11d48]' : 'bg-[#ec4899] hover:bg-[#db2777]';
  const ringColor = isToys ? 'focus-visible:ring-[#fc4b65]' : 'focus-visible:ring-[#ec4899]';

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMounted(true);
    }, 100);

    getStoreConfig().then((config) => {
      if (config) {
        setStoreConfig({
          whatsappPhone: config.whatsappPhone,
          welcomeMessage: config.welcomeMessage,
          localDeliveryPrice: Number(config.localDeliveryPrice) || 0
        });
      }
    });

    return () => clearTimeout(timer);
  }, []);

  // 🛡️ Cargar Recomendaciones (FIX: No depende de 'items' para evitar re-render al agregar)
  useEffect(() => {
    async function loadRecommended() {
        if (items.length === 0) return;

        const res = await getProducts({ 
            sort: 'newest', 
            division: currentDivision as Division 
        });
        if (res.success) {
            // Filtramos solo al inicio. Si el usuario agrega uno, NO desaparece del carrusel (evita lagueo visual)
            const cartIds = items.map(i => i.id);
            const filtered = res.data.filter((p: any) => !cartIds.includes(p.id)).slice(0, 10);
            setRecommended(filtered);
        }
    }
    if (isMounted) loadRecommended();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDivision, isMounted]); // 👈 Quitamos 'items' de las dependencias intencionalmente

  useEffect(() => {
      if (!coupon) {
          const timer = setTimeout(() => setCouponCode(''), 0);
          return () => clearTimeout(timer);
      }
  }, [coupon]);

  const handleApplyCoupon = async () => {
      if (!couponCode) return;
      const res = await validateCoupon(couponCode);
      if (res.success && res.coupon) {
          applyCoupon({
            code: res.coupon.code,
            discount: Number(res.coupon.discount),
            type: res.coupon.type as 'FIXED' | 'PERCENTAGE'
          });
          toast.success('Cupón aplicado');
      } else {
          toast.error(res.message || 'Cupón inválido');
      }
  };

  const formatPrice = (value: number) =>
    new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
    }).format(value);

  const getShippingCost = () => {
    if (deliveryMethod === 'DELIVERY') return storeConfig.localDeliveryPrice;
    return 0; 
  };

  const getGrandTotal = () => {
    return getFinalPrice() + getShippingCost();
  };

  const handleCheckout = async () => {
    const newErrors: typeof errors = {};
    if (!name.trim()) newErrors.name = ["El nombre es obligatorio"];
    if (!phone.trim() || phone.length < 9) newErrors.phone = ["Celular inválido"];
    if (deliveryMethod === 'DELIVERY' && !address.trim()) newErrors.address = ["La dirección es obligatoria para delivery"];

    if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        toast.error("Por favor completa los campos requeridos");
        return;
    }

    setIsSubmitting(true);

    const result = await createOrder({
      name,
      phone,
      total: getGrandTotal(),
      items: items.map((item) => ({
        productId: item.id,
        quantity: item.quantity,
        price: getEffectivePrice(item), 
      })),
      deliveryMethod, 
      shippingAddress: address,
      shippingCost: getShippingCost(),
      notes: notes 
    });

    if (!result.success) {
      setIsSubmitting(false);
      toast.error(result.message || 'Error desconocido');
      return;
    }

    const shortId = result.orderId!.split('-')[0].toUpperCase();

    let message = `${storeConfig.welcomeMessage}\n\n`; 
    message += `🆔 *Pedido:* #${shortId}\n`;
    message += `👤 *Cliente:* ${name}\n`;
    
    let deliveryText = "Recojo en Tienda";
    if (deliveryMethod === 'DELIVERY') deliveryText = `Delivery Local (${address})`;
    if (deliveryMethod === 'PROVINCE') deliveryText = "Envío a Provincia (Agencia)";
    
    message += `🚚 *Entrega:* ${deliveryText}\n`;
    message += `--------------------------------\n`;
    
    if (notes.trim()) {
        message += `📝 *Notas:* ${notes}\n`;
        message += `--------------------------------\n`;
    }
    
    items.forEach((item) => {
      const price = getEffectivePrice(item);
      message += `• ${item.quantity}x ${item.title} (S/ ${price.toFixed(2)})\n`;
    });
    
    const realSubtotal = getSubtotalPrice();

    if (coupon) {
        message += `\nSubtotal: ${formatPrice(realSubtotal)}`;
        message += `\nDescuento (${coupon.code}): -${formatPrice(getDiscountAmount())}`;
    }

    if (getShippingCost() > 0) {
        message += `\nEnvío: ${formatPrice(getShippingCost())}`;
    }
    
    message += `\n💰 *TOTAL A PAGAR: ${formatPrice(getGrandTotal())}*`;
    message += `\n\nQuedo atento a los datos de pago.`;

    const url = `https://wa.me/${storeConfig.whatsappPhone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');

    setTimeout(() => {
        clearCart();
        removeCoupon();
        setName('');
        setPhone('');
        setAddress('');
        setNotes('');
        setDeliveryMethod('PICKUP');
        setIsSubmitting(false);
    }, 1000);
  };

  if (!isMounted) return <div className="min-h-[60vh] flex items-center justify-center text-slate-500"><Loader2 className="h-8 w-8 animate-spin text-slate-300" /></div>;

  if (items.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center px-4 animate-in fade-in zoom-in">
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-slate-50">
          <ShoppingBag className="h-12 w-12 text-slate-300" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">Tu carrito está vacío</h2>
        <p className="text-slate-500 max-w-sm">Aún no tienes productos seleccionados.</p>
        <Button asChild size="lg" className={cn("mt-6 font-bold", btnBg)}>
          <Link href="/">Ver Productos <ArrowRight className="ml-2 h-4 w-4" /></Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 mt-8 md:mt-12 pb-24">
      <h1 className="mb-8 text-3xl font-extrabold text-slate-900 tracking-tight">Carrito de Compras</h1>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 mb-16">
        
        {/* COLUMNA IZQUIERDA (Items) */}
        <div className="lg:col-span-7 space-y-4">
          {items.map((item: CartProduct) => { 
             const effectivePrice = getEffectivePrice(item);
             const isWholesaleApplied = (item.wholesalePrice ?? 0) > 0 && (item.wholesaleMinCount ?? 0) > 0 && item.quantity >= (item.wholesaleMinCount ?? 0);
             const discountVal = item.discountPercentage ?? 0;
             const hasDiscount = discountVal > 0 && !isWholesaleApplied;
             const showOriginalPrice = item.price > effectivePrice;

             return (
              <Card key={item.id} className="overflow-hidden border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="flex gap-4 p-4 sm:p-6">
                  
                  <Link href={`/product/${item.slug}`} className="relative h-28 w-28 shrink-0 overflow-hidden rounded-lg border bg-white p-1 hover:opacity-90 transition-opacity">
                    <Image src={item.image} alt={item.title} fill className="object-contain" />
                  </Link>

                  <div className="flex flex-1 flex-col justify-between">
                    <div className="flex flex-col sm:flex-row sm:justify-between gap-2">
                      <div className="space-y-1">
                          <Link href={`/product/${item.slug}`} className="font-bold text-slate-900 line-clamp-2 hover:text-primary hover:underline text-lg leading-tight">
                            {item.title}
                          </Link>
                          
                          <div className="flex flex-wrap gap-2 pt-1">
                             {isWholesaleApplied && (
                                <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-100 gap-1">
                                    <Package className="w-3 h-3" /> Precio Mayorista
                                </Badge>
                             )}
                             {hasDiscount && (
                                <Badge variant="secondary" className="bg-red-50 text-red-600 hover:bg-red-100 border-red-100 gap-1">
                                    <Tag className="w-3 h-3" /> -{discountVal}% Dcto.
                                </Badge>
                             )}
                          </div>
                      </div>

                      <div className="text-right">
                         {showOriginalPrice && (
                            <p className="text-xs text-slate-400 line-through">S/ {formatPrice(item.price * item.quantity)}</p>
                         )}
                         <p className={cn("font-bold text-xl", themeColor)}>
                            {formatPrice(effectivePrice * item.quantity)}
                         </p>
                         <p className="text-xs text-slate-500 font-medium">
                            {formatPrice(effectivePrice)} c/u
                         </p>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap items-end justify-between gap-4 mt-4">
                      <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1 rounded-lg border bg-slate-50 p-1 w-fit">
                            <Button variant="ghost" size="icon" className="h-8 w-8 bg-white shadow-sm hover:bg-slate-100 rounded-md" 
                                disabled={item.quantity <= 1} onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-10 text-center text-sm font-bold tabular-nums">{item.quantity}</span>
                            <Button variant="ghost" size="icon" className="h-8 w-8 bg-white shadow-sm hover:bg-slate-100 rounded-md" 
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                          
                          {item.wholesaleMinCount && !isWholesaleApplied && (
                             <p className="text-xs text-blue-600 font-medium animate-pulse">
                                ¡Agrega {(item.wholesaleMinCount || 0) - item.quantity} más para precio mayorista!
                             </p>
                          )}
                      </div>

                      <Button variant="ghost" size="sm" className="text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors" onClick={() => removeItem(item.id)}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Quitar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
             );
          })}
        </div>

        {/* COLUMNA DERECHA (Resumen) */}
        <div className="lg:col-span-5">
          <Card className="bg-white border-slate-200 shadow-lg sticky top-24">
            <CardContent className="p-6 sm:p-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                 <Store className={cn("h-6 w-6", themeColor)} /> 
                 Resumen del Pedido
              </h2>
              
              <div className="space-y-5 mb-8">
                <div className="grid w-full items-center gap-2">
                  <Label htmlFor="name" className={errors.name ? "text-red-500" : ""}>Nombre completo</Label>
                  <Input 
                    id="name" 
                    placeholder="Ej: Juan Pérez" 
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (errors.name) setErrors({ ...errors, name: undefined });
                    }}
                    className={cn("h-11", errors.name ? "border-red-500 bg-red-50" : "bg-white", ringColor)}
                  />
                  {errors.name && <p className="text-sm text-red-500 font-medium">{errors.name[0]}</p>}
                </div>

                <div className="grid w-full items-center gap-2">
                  <Label htmlFor="phone" className={errors.phone ? "text-red-500" : ""}>Celular (WhatsApp)</Label>
                  <Input 
                    id="phone" 
                    placeholder="Ej: 999111222" 
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      if (errors.phone) setErrors({ ...errors, phone: undefined });
                    }}
                    maxLength={9}
                    className={cn("h-11", errors.phone ? "border-red-500 bg-red-50" : "bg-white", ringColor)}
                  />
                  {errors.phone && <p className="text-sm text-red-500 font-medium">{errors.phone[0]}</p>}
                </div>

                <div className="pt-2 space-y-3">
                    <Label className="text-base font-semibold">Método de Entrega</Label>
                    <RadioGroup defaultValue="PICKUP" value={deliveryMethod} onValueChange={setDeliveryMethod} className="flex flex-col gap-3">
                        
                        <div className={cn("flex items-center space-x-3 border p-4 rounded-lg cursor-pointer transition-all", deliveryMethod === 'PICKUP' ? `border-[${themeColor}] bg-slate-50 ring-1 ring-slate-200` : 'border-slate-200 hover:bg-slate-50')}>
                            <RadioGroupItem value="PICKUP" id="r1" className={themeColor} />
                            <Label htmlFor="r1" className="flex-1 cursor-pointer flex items-center gap-3">
                                <Store className="h-5 w-5 text-slate-500" />
                                <div>
                                    <span className="block font-bold text-slate-900">Recojo en Tienda</span>
                                    <span className="text-xs text-slate-500">Gratis - Av. España 123</span>
                                </div>
                            </Label>
                        </div>

                        <div className={cn("flex items-center space-x-3 border p-4 rounded-lg cursor-pointer transition-all", deliveryMethod === 'DELIVERY' ? `border-[${themeColor}] bg-slate-50 ring-1 ring-slate-200` : 'border-slate-200 hover:bg-slate-50')}>
                            <RadioGroupItem value="DELIVERY" id="r2" />
                            <Label htmlFor="r2" className="flex-1 cursor-pointer flex items-center gap-3">
                                <Truck className="h-5 w-5 text-slate-500" />
                                <div>
                                    <span className="block font-bold text-slate-900">Delivery Local (Trujillo)</span>
                                    <span className="text-xs text-slate-500">Costo: {formatPrice(storeConfig.localDeliveryPrice)}</span>
                                </div>
                            </Label>
                        </div>

                        <div className={cn("flex items-center space-x-3 border p-4 rounded-lg cursor-pointer transition-all", deliveryMethod === 'PROVINCE' ? `border-[${themeColor}] bg-slate-50 ring-1 ring-slate-200` : 'border-slate-200 hover:bg-slate-50')}>
                            <RadioGroupItem value="PROVINCE" id="r3" />
                            <Label htmlFor="r3" className="flex-1 cursor-pointer flex items-center gap-3">
                                <MapPin className="h-5 w-5 text-slate-500" />
                                <div>
                                    <span className="block font-bold text-slate-900">Envío a Provincia</span>
                                    <span className="text-xs text-slate-500">Pago en destino (Shalom/Olva)</span>
                                </div>
                            </Label>
                        </div>
                    </RadioGroup>
                </div>

                {deliveryMethod === 'DELIVERY' && (
                    <div className="animate-in fade-in slide-in-from-top-2 space-y-2">
                        <Label htmlFor="address" className={errors.address ? "text-red-500" : ""}>Dirección de entrega</Label>
                        <Textarea 
                            id="address"
                            placeholder="Calle, número, referencia..."
                            className={cn("mt-1 resize-none h-20", errors.address ? "border-red-500 bg-red-50" : "bg-white", ringColor)}
                            value={address}
                            onChange={(e) => {
                                setAddress(e.target.value);
                                if (errors.address) setErrors({ ...errors, address: undefined });
                            }}
                        />
                        {errors.address && <p className="text-sm text-red-500 font-medium">{errors.address[0]}</p>}
                    </div>
                )}

                <div className="pt-2 space-y-2">
                    <Label htmlFor="notes" className="flex items-center gap-2">
                        <MessageSquarePlus className="h-4 w-4" /> Notas del Pedido (Opcional)
                    </Label>
                    <Textarea 
                        id="notes"
                        placeholder="Ej: Quiero el globo número 5 en color azul. Dedicatoria: Feliz Cumpleaños..."
                        className={cn("bg-white resize-none h-24", ringColor)}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                    />
                </div>

              </div>

              <Separator className="my-6" />
              
              <div className="mb-6">
                  {!coupon ? (
                      <div className="flex gap-2">
                          <div className="relative w-full">
                            <Tag className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                            <Input 
                                placeholder="Código de cupón" 
                                value={couponCode}
                                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                className={cn("bg-white pl-9", ringColor)}
                            />
                          </div>
                          <Button variant="outline" onClick={handleApplyCoupon} className="shrink-0 font-medium">Aplicar</Button>
                      </div>
                  ) : (
                      <div className="flex items-center justify-between bg-green-50 p-3 rounded-lg border border-green-200">
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

              <div className="space-y-3 text-sm mb-6 bg-slate-50 p-4 rounded-lg border border-slate-100">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span className="font-medium text-slate-900">{formatPrice(getSubtotalPrice())}</span>
                </div>
                
                {coupon && (
                  <div className="flex justify-between text-green-600 font-bold">
                    <span>Descuento</span>
                    <span>- {formatPrice(getDiscountAmount())}</span>
                  </div>
                )}

                <div className="flex justify-between text-slate-600">
                  <span>Envío</span>
                  <span className={getShippingCost() > 0 ? "font-bold text-slate-900" : "text-xs font-bold bg-slate-200 px-2 py-0.5 rounded text-slate-600"}>
                    {getShippingCost() > 0 ? formatPrice(getShippingCost()) : (deliveryMethod === 'PROVINCE' ? 'Por Pagar' : 'Gratis')}
                  </span>
                </div>
                
                <Separator className="bg-slate-200" />

                <div className="flex justify-between items-end pt-1">
                    <span className="text-lg font-bold text-slate-900">Total a Pagar</span>
                    <span className={cn("text-3xl font-extrabold", themeColor)}>{formatPrice(getGrandTotal())}</span>
                </div>
              </div>

              <Button 
                size="lg" 
                className={cn("w-full h-12 text-lg font-bold shadow-lg transition-all hover:scale-[1.01] hover:shadow-xl", btnBg)}
                onClick={handleCheckout}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                    <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Procesando...
                    </>
                ) : (
                    'Completar pedido por WhatsApp'
                )}
              </Button>
              {/* Texto de seguridad ELIMINADO aquí */}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* RECOMENDADOS (CROSS-SELLING) */}
      {recommended.length > 0 && (
        <div className="mt-24 space-y-6 animate-in fade-in duration-500">
          <Separator className="mb-8" />
          <h2 className="text-2xl font-bold text-slate-700">
            Agrega más productos a tu carrito
          </h2>
          {/* FIX: Carrusel girando automáticamente */}
          <ProductCarousel products={recommended} autoPlay={true} />
        </div>
      )}
    </div>
  );
}