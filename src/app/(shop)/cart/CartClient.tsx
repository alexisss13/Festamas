'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import cloudinaryLoader from '@/lib/cloudinaryLoader';
import Link from 'next/link';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, Loader2, Tag, MapPin, Truck, Store, MessageSquarePlus, Package, CreditCard, Edit2, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useCartStore, getEffectivePrice, CartProduct } from '@/store/cart';
import { useUIStore } from '@/store/ui';
import { createPreference } from '@/actions/payments';
import { validateCoupon } from '@/actions/coupon';
import { getProducts } from '@/actions/products';
import { ProductCarousel } from '@/components/features/ProductCarousel';
import { toast } from 'sonner';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface Address {
  id: string;
  address: string;
  address2: string | null;
  city: string;
  province: string | null;
}

interface CartClientProps {
  user: {
    name: string;
    phone: string;
    addresses: Address[];
  };
  storeConfig: {
    whatsappPhone: string;
    welcomeMessage: string;
    localDeliveryPrice: number;
  };
  brandColor: string;
}

export function CartClient({ user, storeConfig, brandColor }: CartClientProps) {
  const {
    cart: items,
    removeProduct: removeItem,
    updateProductQuantity: updateQuantity,
    getSubtotalPrice,
    applyCoupon,
    removeCoupon,
    getDiscountAmount,
    getFinalPrice,
    coupon
  } = useCartStore();

  const { activeBranchId } = useUIStore();
  const [isMounted, setIsMounted] = useState(false);
  const [recommended, setRecommended] = useState<any[]>([]);

  const [couponCode, setCouponCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deliveryMethod, setDeliveryMethod] = useState('PICKUP');
  const [selectedAddressId, setSelectedAddressId] = useState<string>(user.addresses[0]?.id || '');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<{ address?: string[] }>({});
  
  // Estados para modales
  const [isPhoneModalOpen, setIsPhoneModalOpen] = useState(false);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
  const [editedPhone, setEditedPhone] = useState(user.phone);
  const [tempPhone, setTempPhone] = useState(user.phone);
  const [tempNotes, setTempNotes] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMounted(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Cargar Recomendaciones
  useEffect(() => {
    async function loadRecommended() {
      if (items.length === 0) return;

      const res = await getProducts({
        sort: 'newest'
      });
      if (res.success) {
        const cartIds = items.map(i => i.id);
        const filtered = res.data.filter((p: any) => !cartIds.includes(p.id)).slice(0, 10);
        setRecommended(filtered);
      }
    }
    if (isMounted) loadRecommended();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeBranchId, isMounted]);

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

  const getSelectedAddress = () => {
    return user.addresses.find(addr => addr.id === selectedAddressId);
  };

  const handleSavePhone = () => {
    if (!tempPhone || tempPhone.trim().length < 9) {
      toast.error('Ingresa un número válido');
      return;
    }
    setEditedPhone(tempPhone);
    setIsPhoneModalOpen(false);
    toast.success('Teléfono actualizado');
  };

  const handleSaveNotes = () => {
    setNotes(tempNotes);
    setIsNotesModalOpen(false);
    if (tempNotes.trim()) {
      toast.success('Nota agregada');
    }
  };

  const handleSelectAddress = (addressId: string) => {
    setSelectedAddressId(addressId);
    setIsAddressModalOpen(false);
    if (errors.address) setErrors({});
  };

  const handleCheckout = async () => {
    // Validaciones
    const newErrors: typeof errors = {};
    
    if ((deliveryMethod === 'DELIVERY' || deliveryMethod === 'PROVINCE') && !selectedAddressId) {
      newErrors.address = ["Debes seleccionar una dirección de entrega"];
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error("Por favor completa los campos requeridos");
      return;
    }

    setIsSubmitting(true);

    try {
      const selectedAddress = getSelectedAddress();
      const shippingAddress = selectedAddress
        ? `${selectedAddress.address}${selectedAddress.address2 ? ', ' + selectedAddress.address2 : ''}, ${selectedAddress.city}, ${selectedAddress.province}`
        : '';

      const result = await createPreference({
        items: items.map(item => ({
          ...item,
          price: getEffectivePrice(item)
        })),
        deliveryMethod,
        shippingAddress,
        shippingCost: getShippingCost(),
        contactName: user.name,
        contactPhone: editedPhone,
        notes: notes,
        total: getGrandTotal()
      });

      if (result.success && result.url) {
        window.location.href = result.url;
      } else {
        toast.error(result.message || 'Error al generar el pago');
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error(error);
      toast.error('Ocurrió un error inesperado');
      setIsSubmitting(false);
    }
  };

  if (!isMounted) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-slate-500">
        <Loader2 className="h-8 w-8 animate-spin text-slate-300" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        {/* BREADCRUMB Y TÍTULO - Estilo categorías */}
        <div className="border-b border-slate-200 bg-slate-50/50">
          <div className="container mx-auto px-4 md:px-6 lg:px-8 py-4 md:py-6">
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-3">
              <Link href="/" className="hover:text-slate-900 transition-colors">
                Inicio
              </Link>
              <span>/</span>
              <span className="text-slate-900 font-medium">Carrito</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
              Mi Carrito
            </h1>
          </div>
        </div>

        <div className="container mx-auto px-4 md:px-6 lg:px-8 py-16 md:py-24">
          <div className="max-w-md mx-auto">
            <div className="bg-white rounded-2xl border border-slate-200 p-8 md:p-12 text-center">
              <div className="flex h-20 w-20 md:h-24 md:w-24 items-center justify-center rounded-full bg-slate-50 border-2 border-slate-100 mx-auto mb-6">
                <ShoppingBag className="h-10 w-10 md:h-12 md:w-12 text-slate-300" />
              </div>
              <h2 className="text-[18px] md:text-[20px] font-semibold text-[#333] mb-2">Tu carrito está vacío</h2>
              <p className="text-[13px] md:text-[14px] text-slate-500 mb-6">Explora nuestros productos y encuentra lo que necesitas.</p>
              <Button asChild size="lg" className="font-semibold text-white h-11 text-[14px] md:text-[15px] w-full" style={{ backgroundColor: brandColor }}>
                <Link href="/">
                  Explorar Productos <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* BREADCRUMB Y TÍTULO - Estilo categorías */}
      <div className="border-b border-slate-200 bg-slate-50/50">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 py-4 md:py-6">
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-3">
            <Link href="/" className="hover:text-slate-900 transition-colors">
              Inicio
            </Link>
            <span>/</span>
            <span className="text-slate-900 font-medium">Carrito</span>
          </div>
          <div className="flex items-start md:items-center justify-between gap-4">
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
              Mi Carrito
            </h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-5 md:py-6 pb-24">
        <div className="grid grid-cols-1 gap-5 lg:gap-6 lg:grid-cols-12">
          
          {/* COLUMNA IZQUIERDA (Items) */}
          <div className="lg:col-span-8 space-y-2.5">
            {/* Lista de productos */}
            {items.map((item: CartProduct) => {
              const effectivePrice = getEffectivePrice(item);
              const isWholesaleApplied = (item.wholesalePrice ?? 0) > 0 && (item.wholesaleMinCount ?? 0) > 0 && item.quantity >= (item.wholesaleMinCount ?? 0);
              const discountVal = item.discountPercentage ?? 0;
              const hasDiscount = discountVal > 0 && !isWholesaleApplied;
              const showOriginalPrice = item.price > effectivePrice;

              return (
                <div key={item.id} className="bg-white rounded-lg border border-slate-200 p-3 md:p-4 hover:border-slate-300 transition-colors">
                  <div className="flex gap-3 md:gap-4">
                    
                    <Link href={`/product/${item.slug}`} className="relative h-20 w-20 md:h-24 md:w-24 shrink-0 overflow-hidden rounded-lg bg-slate-50 p-1.5 hover:opacity-90 transition-opacity">
                      <Image
                        loader={cloudinaryLoader}
                        src={item.image.includes('res.cloudinary.com') ? item.image.split('/upload/')[1]?.split('/').filter((p: string) => !p.startsWith('v') || p.length < 10).join('/').split('.')[0] || item.image : item.image}
                        alt={item.title}
                        fill
                        className="object-contain"
                        sizes="96px"
                      />
                    </Link>

                    <div className="flex flex-1 flex-col min-w-0">
                      <div className="flex justify-between gap-3 mb-2">
                        <div className="flex-1 min-w-0">
                          <Link href={`/product/${item.slug}`} className="font-medium text-[13px] md:text-[14px] text-[#333] line-clamp-2 hover:underline leading-snug mb-1">
                            {item.title}
                          </Link>
                          
                          {(isWholesaleApplied || hasDiscount) && (
                            <div className="flex flex-wrap gap-1.5 mt-1.5">
                              {isWholesaleApplied && (
                                <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-0 gap-1 text-[10px] h-5 px-1.5 font-medium">
                                  <Package className="w-2.5 h-2.5" /> Mayorista
                                </Badge>
                              )}
                              {hasDiscount && (
                                <Badge variant="secondary" className="bg-red-50 text-red-600 border-0 gap-1 text-[10px] h-5 px-1.5 font-medium">
                                  <Tag className="w-2.5 h-2.5" /> -{discountVal}%
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="text-right shrink-0">
                          {showOriginalPrice && (
                            <p className="text-[11px] text-slate-400 line-through mb-0.5">{formatPrice(item.price * item.quantity)}</p>
                          )}
                          <p className="font-bold text-[17px] md:text-[19px] text-[#333] leading-none">
                            {formatPrice(effectivePrice * item.quantity)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between mt-auto pt-2 border-t border-slate-100">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center rounded-md border border-slate-200 bg-slate-50">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 hover:bg-white rounded-l-md rounded-r-none"
                              disabled={item.quantity <= 1}
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </Button>
                            <span className="w-10 text-center text-[13px] font-semibold tabular-nums text-[#333] bg-white border-x border-slate-200">{item.quantity}</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 hover:bg-white rounded-r-md rounded-l-none"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                          
                          <p className="text-[11px] text-slate-500">
                            {formatPrice(effectivePrice)} c/u
                          </p>
                        </div>

                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors h-8 text-[12px] px-2.5"
                          onClick={() => removeItem(item.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>

                      {item.wholesaleMinCount && !isWholesaleApplied && (
                        <p className="text-[10px] text-blue-600 font-medium mt-1.5 flex items-center gap-1">
                          <Package className="h-3 w-3" />
                          Agrega {(item.wholesaleMinCount || 0) - item.quantity} más para precio mayorista
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* COLUMNA DERECHA (Resumen) */}
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-24 space-y-3">
              
              {/* Card de Métodos de Entrega */}
              <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                <div className="bg-slate-50 border-b border-slate-200 px-4 py-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-[15px] md:text-[16px] font-semibold text-[#333]">
                      Método de Entrega
                    </h3>
                    <button
                      onClick={() => {
                        setTempPhone(editedPhone);
                        setIsPhoneModalOpen(true);
                      }}
                      className="flex items-center gap-1.5 text-[12px] text-slate-600 hover:text-slate-900 transition-colors"
                    >
                      <Phone className="h-3.5 w-3.5" />
                      <span className="font-medium">{editedPhone || 'Establece número de contacto'}</span>
                      <Edit2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                
                <div className="p-4 space-y-3">
                  <RadioGroup 
                    defaultValue="PICKUP" 
                    value={deliveryMethod} 
                    onValueChange={(value) => {
                      setDeliveryMethod(value);
                      if (value === 'DELIVERY' || value === 'PROVINCE') {
                        // Abrir modal automáticamente para ambos métodos
                        setIsAddressModalOpen(true);
                      } else {
                        setErrors({});
                      }
                    }} 
                    className="space-y-2"
                  >
                    
                    <label className={cn(
                      "flex items-center gap-3 p-3 rounded-lg border-1 cursor-pointer transition-all",
                      deliveryMethod === 'PICKUP' ? 'border-slate-300 bg-slate-50' : 'border-slate-200 hover:border-slate-300'
                    )}>
                      <RadioGroupItem value="PICKUP" id="pickup" />
                      <div className="flex items-center gap-2.5 flex-1">
                        <div className="h-9 w-9 rounded-lg bg-slate-100 flex items-center justify-center">
                          <Store className="h-4 w-4 text-slate-600" />
                        </div>
                        <div>
                          <span className="block font-medium text-[13px] text-[#333]">Recojo en Tienda</span>
                          <span className="text-[11px] text-slate-500">Sin costo</span>
                        </div>
                      </div>
                    </label>

                    <div>
                      <label className={cn(
                        "flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all",
                        deliveryMethod === 'DELIVERY' ? 'border-slate-300 bg-slate-50' : 'border-slate-200 hover:border-slate-300'
                      )}>
                        <RadioGroupItem value="DELIVERY" id="delivery" className="mt-1" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start gap-2.5">
                            <div className="h-9 w-9 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                              <Truck className="h-4 w-4 text-slate-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <div>
                                  <span className="block font-medium text-[13px] text-[#333]">Delivery Local</span>
                                  <span className="text-[11px] text-slate-500">{formatPrice(storeConfig.localDeliveryPrice)}</span>
                                </div>
                                {deliveryMethod === 'DELIVERY' && selectedAddressId && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 px-2 text-[10px] shrink-0"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      setIsAddressModalOpen(true);
                                    }}
                                  >
                                    Cambiar
                                  </Button>
                                )}
                              </div>
                              {/* Dirección seleccionada a la derecha */}
                              {deliveryMethod === 'DELIVERY' && selectedAddressId && (
                                <div className="mt-2 pt-2 border-t border-slate-200">
                                  {(() => {
                                    const address = user.addresses.find(a => a.id === selectedAddressId);
                                    return address ? (
                                      <div>
                                        <p className="text-[11px] font-medium text-[#333] leading-snug">{address.address}</p>
                                        <p className="text-[10px] text-slate-500 mt-0.5">
                                          {address.city}, {address.province}
                                        </p>
                                      </div>
                                    ) : null;
                                  })()}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </label>
                    </div>

                    <div>
                      <label className={cn(
                        "flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all",
                        deliveryMethod === 'PROVINCE' ? 'border-slate-300 bg-slate-50' : 'border-slate-200 hover:border-slate-300'
                      )}>
                        <RadioGroupItem value="PROVINCE" id="province" className="mt-1" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start gap-2.5">
                            <div className="h-9 w-9 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                              <MapPin className="h-4 w-4 text-slate-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <div>
                                  <span className="block font-medium text-[13px] text-[#333]">Envío a Provincia</span>
                                  <span className="text-[11px] text-slate-500">Pago en destino</span>
                                </div>
                                {deliveryMethod === 'PROVINCE' && selectedAddressId && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 px-2 text-[10px] shrink-0"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      setIsAddressModalOpen(true);
                                    }}
                                  >
                                    Cambiar
                                  </Button>
                                )}
                              </div>
                              {/* Dirección seleccionada a la derecha */}
                              {deliveryMethod === 'PROVINCE' && selectedAddressId && (
                                <div className="mt-2 pt-2 border-t border-slate-200">
                                  {(() => {
                                    const address = user.addresses.find(a => a.id === selectedAddressId);
                                    return address ? (
                                      <div>
                                        <p className="text-[11px] font-medium text-[#333] leading-snug">{address.address}</p>
                                        <p className="text-[10px] text-slate-500 mt-0.5">
                                          {address.city}, {address.province}
                                        </p>
                                      </div>
                                    ) : null;
                                  })()}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </label>
                    </div>
                  </RadioGroup>

                  {/* Botón para agregar notas */}
                  <div className="pt-2 border-t border-slate-200">
                    <Button
                      variant="ghost"
                      className="w-full justify-start h-auto p-3 text-left hover:bg-slate-50"
                      onClick={() => {
                        setTempNotes(notes);
                        setIsNotesModalOpen(true);
                      }}
                    >
                      <MessageSquarePlus className="h-4 w-4 mr-2 shrink-0 text-slate-500" />
                      <div className="flex-1">
                        {notes ? (
                          <div>
                            <span className="text-[13px] font-medium text-[#333] block">Nota del pedido</span>
                            <span className="text-[11px] text-slate-500 line-clamp-1">{notes}</span>
                          </div>
                        ) : (
                          <span className="text-[13px] text-slate-600">¿Deseas añadir una nota al pedido?</span>
                        )}
                      </div>
                      <Edit2 className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Card de Resumen */}
              <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                <div className="bg-slate-50 border-b border-slate-200 px-4 py-3">
                  <h2 className="text-[15px] md:text-[16px] font-semibold text-[#333]">
                    Resumen de Compra
                  </h2>
                </div>
                
                <div className="p-4 space-y-4">
                  
                  {/* Cupón */}
                  <div>
                    <Label className="text-[12px] md:text-[13px] font-medium text-slate-700 mb-2 block">
                      ¿Tienes un cupón?
                    </Label>
                    {!coupon ? (
                      <div className="flex gap-2">
                        <Input
                          placeholder="Código"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                          className="h-9 text-[12px] md:text-[13px] placeholder:text-[12px] md:placeholder:text-[13px] flex-1"
                        />
                        <Button 
                          variant="outline" 
                          onClick={handleApplyCoupon} 
                          className="h-9 text-[12px] md:text-[13px] px-4 font-medium"
                        >
                          Aplicar
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between bg-green-50 p-2.5 rounded-md border border-green-200">
                        <div className="flex items-center gap-2">
                          <Tag className="h-3.5 w-3.5 text-green-600" />
                          <span className="text-[12px] text-green-700 font-medium">
                            {coupon.code}
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={removeCoupon}
                          className="h-6 w-6 text-green-700 hover:text-green-900 hover:bg-green-100"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>

                  <Separator />

                  {/* Resumen de Precios */}
                  <div className="space-y-2.5 text-[13px]">
                    <div className="flex justify-between text-slate-600">
                      <span>Subtotal</span>
                      <span className="font-medium text-[#333]">{formatPrice(getSubtotalPrice())}</span>
                    </div>
                    
                    {coupon && (
                      <div className="flex justify-between text-green-600 font-semibold">
                        <span>Descuento</span>
                        <span>- {formatPrice(getDiscountAmount())}</span>
                      </div>
                    )}

                    <div className="flex justify-between text-slate-600">
                      <span>Envío</span>
                      <span className={getShippingCost() > 0 ? "font-medium text-[#333]" : "text-[11px] font-medium bg-slate-100 px-2 py-0.5 rounded text-slate-600"}>
                        {getShippingCost() > 0 ? formatPrice(getShippingCost()) : (deliveryMethod === 'PROVINCE' ? 'Por Pagar' : 'Gratis')}
                      </span>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex justify-between items-center pt-1">
                    <span className="text-[15px] md:text-[16px] font-semibold text-[#333]">Total</span>
                    <span className="text-[24px] md:text-[28px] font-bold text-[#333] leading-none">
                      {formatPrice(getGrandTotal())}
                    </span>
                  </div>

                  <Button
                    size="lg"
                    className="w-full h-12 text-[14px] md:text-[15px] font-semibold transition-all hover:opacity-90 text-white shadow-sm"
                    style={{ backgroundColor: brandColor }}
                    onClick={handleCheckout}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Procesando...
                      </>
                    ) : (
                      <>
                        Proceder al Pago <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                  
                  <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500">
                    <CreditCard className="h-3.5 w-3.5" />
                    <span>Pago seguro con MercadoPago</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* RECOMENDADOS */}
        {recommended.length > 0 && (
          <div className="mt-10 md:mt-12 animate-in fade-in duration-500">
            <h2 className="font-medium text-[16px] md:text-[24px] leading-tight text-[#333] tracking-tight mb-4 px-2">
              También te puede interesar
            </h2>
            <ProductCarousel products={recommended} autoPlay={true} />
          </div>
        )}
      </div>

      {/* Modal de Editar Teléfono */}
      <Dialog open={isPhoneModalOpen} onOpenChange={setIsPhoneModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[18px] font-semibold text-[#333]">Editar Teléfono</DialogTitle>
            <DialogDescription className="text-[13px] text-slate-600">
              Actualiza tu número de contacto para este pedido
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-[13px] font-medium text-slate-700">
                Número de teléfono
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="999 999 999"
                value={tempPhone}
                onChange={(e) => setTempPhone(e.target.value)}
                className="h-11 text-[14px]"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setIsPhoneModalOpen(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSavePhone}
              className="flex-1 text-white"
              style={{ backgroundColor: brandColor }}
            >
              Guardar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Seleccionar Dirección */}
      <Dialog open={isAddressModalOpen} onOpenChange={setIsAddressModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-[18px] font-semibold text-[#333]">Seleccionar Dirección</DialogTitle>
            <DialogDescription className="text-[13px] text-slate-600">
              Elige la dirección donde quieres recibir tu pedido
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-4 max-h-[400px] overflow-y-auto">
            {user.addresses.length > 0 ? (
              user.addresses.map((address) => (
                <button
                  key={address.id}
                  onClick={() => handleSelectAddress(address.id)}
                  className={cn(
                    "w-full text-left p-3 rounded-lg border-2 transition-all hover:border-slate-300",
                    selectedAddressId === address.id ? 'border-slate-400 bg-slate-50' : 'border-slate-200'
                  )}
                >
                  <p className="text-[13px] md:text-[14px] font-medium text-[#333] leading-snug">{address.address}</p>
                  {address.address2 && (
                    <p className="text-[11px] text-slate-500 mt-1">{address.address2}</p>
                  )}
                  <p className="text-[11px] text-slate-500 mt-1.5">
                    {address.city}, {address.province}
                  </p>
                </button>
              ))
            ) : (
              <div className="text-center py-8">
                <MapPin className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                <p className="text-[13px] text-slate-600 mb-4">No tienes direcciones guardadas</p>
                <Link href="/profile/address/new">
                  <Button variant="outline" size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Agregar dirección
                  </Button>
                </Link>
              </div>
            )}
          </div>
          {user.addresses.length > 0 && (
            <div className="border-t pt-4">
              <Link href="/profile/address/new">
                <Button variant="outline" className="w-full" onClick={() => setIsAddressModalOpen(false)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar nueva dirección
                </Button>
              </Link>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de Notas del Pedido */}
      <Dialog open={isNotesModalOpen} onOpenChange={setIsNotesModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[18px] font-semibold text-[#333]">Nota del Pedido</DialogTitle>
            <DialogDescription className="text-[13px] text-slate-600">
              Agrega instrucciones especiales para tu pedido
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Textarea
              placeholder="Ej: Quiero el globo número 5 en color azul..."
              value={tempNotes}
              onChange={(e) => setTempNotes(e.target.value)}
              className="resize-none h-32 text-[13px] md:text-[14px]"
            />
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setIsNotesModalOpen(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSaveNotes}
              className="flex-1 text-white"
              style={{ backgroundColor: brandColor }}
            >
              Guardar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
