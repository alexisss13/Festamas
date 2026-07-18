'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import cloudinaryLoader from '@/lib/cloudinaryLoader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { updateProductEcommerce } from '@/actions/admin-products';
import { toast } from 'sonner';
import { Globe, Monitor, Store, X, Package, Tag, Percent, Eye, EyeOff, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

const ERP_URL = process.env.NEXT_PUBLIC_ERP_URL ?? 'http://localhost:3001';

type Channel = 'POS' | 'ECOMMERCE' | 'BOTH';

const CHANNEL_OPTIONS: { value: Channel; label: string; description: string; icon: any; color: string }[] = [
  {
    value: 'BOTH',
    label: 'Ambos canales',
    description: 'Visible en tienda física y tienda online',
    icon: Globe,
    color: 'border-emerald-500 bg-emerald-50 text-emerald-800',
  },
  {
    value: 'ECOMMERCE',
    label: 'Solo E-commerce',
    description: 'Visible únicamente en la tienda online',
    icon: Monitor,
    color: 'border-blue-500 bg-blue-50 text-blue-800',
  },
  {
    value: 'POS',
    label: 'Solo POS',
    description: 'Visible solo en la tienda física — oculto en web',
    icon: Store,
    color: 'border-slate-400 bg-slate-50 text-slate-600',
  },
];

interface Product {
  id: string;
  title: string;
  slug: string;
  description: string;
  ecommerceDescription: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  basePrice: number;
  images: string[];
  isAvailable: boolean;
  availableChannels: Channel;
  tags: string[];
  groupTag: string | null;
  wholesalePrice: number | null;
  wholesaleMinCount: number | null;
  discountPercentage: number;
  averageRating: number;
  reviewCount: number;
  viewCount: number;
  salesCount: number;
  category: { id: string; name: string } | null;
  supplier: { id: string; name: string } | null;
  variants: Array<{
    id: string;
    name: string;
    sku: string | null;
    barcode: string | null;
    stock: Array<{ quantity: number; branch: { name: string } | null }>;
  }>;
}

export function ProductEditForm({ product }: { product: Product }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const [ecommerceDescription, setEcommerceDescription] = useState(product.ecommerceDescription ?? '');
  const [metaTitle, setMetaTitle] = useState(product.metaTitle ?? '');
  const [metaDescription, setMetaDescription] = useState(product.metaDescription ?? '');
  const [tags, setTags]                                  = useState<string[]>(product.tags);
  const [tagInput, setTagInput]                          = useState('');
  const [groupTag, setGroupTag]                          = useState(product.groupTag ?? '');
  const [isAvailable, setIsAvailable]                    = useState(product.isAvailable);

  const addTag = () => {
    const t = tagInput.trim().toLowerCase();
    if (t && !tags.includes(t)) { setTags([...tags, t]); setTagInput(''); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await updateProductEcommerce(product.id, {
        ecommerceDescription: ecommerceDescription || null,
        metaTitle: metaTitle || null,
        metaDescription: metaDescription || null,
        tags,
        groupTag: groupTag || null,
        isAvailable,
      });
      if (res.success) {
        toast.success('Producto actualizado');
        router.push('/admin/products');
        router.refresh();
      } else {
        toast.error(res.error ?? 'Error al guardar');
      }
    } finally {
      setSaving(false);
    }
  };

  const totalStock = product.variants.reduce(
    (sum, v) => sum + v.stock.reduce((s, st) => s + st.quantity, 0),
    0,
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Left column: POS data (read-only) ── */}
        <div className="lg:col-span-1 space-y-5">

          {/* Product snapshot */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Package className="h-4 w-4 text-slate-400" />
                    Datos del Producto
                  </CardTitle>
                  <CardDescription className="text-[11px]">
                    Gestionado desde el ERP Zaiko
                  </CardDescription>
                </div>
                <a
                  href={`${ERP_URL}/dashboard/products`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-shrink-0 flex items-center gap-1 text-[11px] text-blue-600 hover:text-blue-800 font-medium bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg border border-blue-100 transition-colors whitespace-nowrap"
                >
                  <ExternalLink className="w-3 h-3" />
                  Editar en ERP
                </a>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Images */}
              {product.images.length > 0 && (
                <div className="grid grid-cols-4 gap-1.5">
                  {product.images.slice(0, 4).map((img, i) => (
                    <div key={i} className="aspect-square rounded-lg overflow-hidden bg-slate-50 border border-slate-100">
                      <Image
                        loader={cloudinaryLoader}
                        src={img}
                        alt={`${product.title} ${i + 1}`}
                        width={80}
                        height={80}
                        className="w-full h-full object-contain"
                      />
                    </div>
                  ))}
                </div>
              )}

              <div className="space-y-2 text-sm">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Nombre</p>
                  <p className="font-medium text-slate-800">{product.title}</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Categoría</p>
                    <p className="text-slate-700">{product.category?.name ?? '—'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Proveedor</p>
                    <p className="text-slate-700">{product.supplier?.name ?? '—'}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Precio Base</p>
                    <p className="font-semibold text-slate-800">S/ {product.basePrice.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Stock Total</p>
                    <p className={cn('font-semibold', totalStock > 0 ? 'text-emerald-600' : 'text-red-500')}>{totalStock} u.</p>
                  </div>
                </div>
                {product.wholesalePrice && (
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Precio Mayorista</p>
                    <p className="text-slate-700">S/ {product.wholesalePrice.toFixed(2)} · mín. {product.wholesaleMinCount}</p>
                  </div>
                )}

                {/* Descripción ERP (solo lectura) */}
                {product.description && (
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Descripción ERP</p>
                    <p className="text-slate-600 text-xs leading-relaxed line-clamp-3">{product.description}</p>
                  </div>
                )}
              </div>

              {/* Variantes (solo lectura) */}
              {product.variants.length > 0 && (
                <div className="pt-3 border-t border-slate-100">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 mb-2">Variantes ({product.variants.length})</p>
                  <div className="space-y-1.5">
                    {product.variants.map(v => {
                      const st = v.stock.reduce((s, r) => s + r.quantity, 0);
                      return (
                        <div key={v.id} className="flex justify-between items-center text-xs text-slate-600 bg-slate-50 rounded-md px-2.5 py-1.5">
                          <span className="truncate">{v.name}</span>
                          <span className={cn('font-semibold ml-2 flex-shrink-0', st > 0 ? 'text-emerald-600' : 'text-red-400')}>{st} u.</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Stats */}
              <div className="pt-3 border-t border-slate-100 grid grid-cols-3 gap-2">
                {[
                  { label: 'Ventas',  value: product.salesCount },
                  { label: 'Vistas',  value: product.viewCount },
                  { label: 'Reseñas', value: product.reviewCount },
                ].map(s => (
                  <div key={s.label} className="bg-slate-50 rounded-lg p-2 text-center">
                    <p className="text-[10px] text-slate-400">{s.label}</p>
                    <p className="text-base font-bold text-slate-800">{s.value}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ── Right column: editable ecommerce fields ── */}
        <div className="lg:col-span-2 space-y-5">

          {/* Canal de ventas */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Globe className="h-4 w-4 text-primary" />
                Canal de Ventas
              </CardTitle>
                      <CardDescription className="text-xs">
                El canal se administra desde el POS
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {CHANNEL_OPTIONS.map(opt => {
                  const Icon = opt.icon;
                  const isSelected = product.availableChannels === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      disabled
                      className={cn(
                        'flex flex-col items-start gap-1.5 p-3.5 rounded-xl border-2 text-left transition-all',
                        isSelected
                          ? opt.color + ' shadow-sm'
                          : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300',
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        <span className="text-sm font-semibold">{opt.label}</span>
                      </div>
                      <p className="text-[11px] leading-snug opacity-75">{opt.description}</p>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Visibilidad + Descuento */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Percent className="h-4 w-4 text-primary" />
                Visibilidad y Oferta
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* isAvailable toggle */}
              <div className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-slate-50">
                <div>
                  <p className="text-sm font-medium text-slate-800">Disponible en tienda online</p>
                  <p className="text-xs text-slate-500">Si está desactivado, no aparece aunque el canal sea Ecommerce</p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAvailable(true)}
                    className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all border', isAvailable ? 'bg-emerald-500 text-white border-emerald-500 shadow-sm' : 'border-slate-200 text-slate-500 bg-white')}
                  >
                    <Eye className="h-3.5 w-3.5" /> Sí
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAvailable(false)}
                    className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all border', !isAvailable ? 'bg-red-500 text-white border-red-500 shadow-sm' : 'border-slate-200 text-slate-500 bg-white')}
                  >
                    <EyeOff className="h-3.5 w-3.5" /> No
                  </button>
                </div>
              </div>

              {/* Discount (solo lectura: el precio/campaña maestra pertenece al POS) */}
              <div>
                <Label className="text-sm font-semibold text-slate-700 mb-2 block">
                  Descuento actual <span className="text-slate-400 font-normal">(gestionado desde POS)</span>
                </Label>
                <div className="flex items-center gap-3">
                  <Input
                    type="number"
                    value={product.discountPercentage}
                    disabled
                    className="w-24 h-9 text-center font-bold"
                  />
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={product.discountPercentage}
                    disabled
                    className="flex-1 h-2 bg-slate-200 rounded-lg accent-primary"
                  />
                  {product.discountPercentage > 0 && (
                    <div className="text-right">
                      <Badge className="bg-red-100 text-red-700 font-bold">-{product.discountPercentage}%</Badge>
                      <p className="text-[10px] text-slate-400 mt-1">
                        S/ {(product.basePrice * (1 - product.discountPercentage / 100)).toFixed(2)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Descripción Online + Tags */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Tag className="h-4 w-4 text-primary" />
                Contenido Online & Etiquetas
              </CardTitle>
              <CardDescription className="text-xs">
                Estos campos son exclusivos de la tienda online y no afectan el ERP
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Ecommerce description */}
              <div>
                <Label className="text-sm font-semibold text-slate-700 mb-1.5 block">
                  Descripción Online
                  <span className="text-slate-400 font-normal text-xs ml-1">(copy de marketing para la web)</span>
                </Label>
                <Textarea
                  value={ecommerceDescription}
                  onChange={e => setEcommerceDescription(e.target.value)}
                  rows={5}
                  placeholder={product.description
                    ? `Descripción ERP: "${product.description.substring(0, 80)}…"\n\nEscribe aquí un copy de marketing más atractivo para la tienda online.`
                    : 'Descripción de marketing para la tienda online…'}
                  className="resize-none text-sm"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Si se deja vacío, se mostrará la descripción del ERP en la tienda.
                </p>
              </div>

              <div className="border-t border-slate-100 pt-4 space-y-4">
                <div>
                  <Label className="text-sm font-semibold text-slate-700 mb-1.5 block">Título SEO</Label>
                  <Input value={metaTitle} onChange={e => setMetaTitle(e.target.value)} maxLength={60} placeholder={product.title} />
                  <p className="text-[11px] text-slate-400 mt-1">Recomendado: hasta 60 caracteres.</p>
                </div>
                <div>
                  <Label className="text-sm font-semibold text-slate-700 mb-1.5 block">Descripción SEO</Label>
                  <Textarea value={metaDescription} onChange={e => setMetaDescription(e.target.value)} maxLength={160} rows={3} placeholder="Resumen atractivo para Google y redes…" className="resize-none text-sm" />
                  <p className="text-[11px] text-slate-400 mt-1">Recomendado: hasta 160 caracteres.</p>
                </div>
              </div>

              {/* Tags */}
              <div>
                <Label className="text-sm font-semibold text-slate-700 mb-1.5 block">
                  Tags <span className="text-slate-400 font-normal text-xs">(búsqueda, filtros, secciones home)</span>
                </Label>
                <div className="flex gap-2">
                  <Input
                    value={tagInput}
                    onChange={e => setTagInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
                    placeholder="ej: verano, niños, oferta"
                    className="h-9"
                  />
                  <Button type="button" variant="outline" size="sm" onClick={addTag} className="h-9">
                    Agregar
                  </Button>
                </div>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="gap-1 pr-1 text-xs">
                        {tag}
                        <button type="button" onClick={() => setTags(tags.filter(t => t !== tag))} className="hover:text-red-500 ml-0.5">
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Group tag */}
              <div>
                <Label className="text-sm font-semibold text-slate-700 mb-1.5 block">
                  Colección <span className="text-slate-400 font-normal text-xs">(secciones Home, colecciones temáticas)</span>
                </Label>
                <Input
                  value={groupTag}
                  onChange={e => setGroupTag(e.target.value.toUpperCase())}
                  placeholder="Ej: NAVIDAD, HALLOWEEN, CUMPLEANOS"
                  className="h-9 font-mono uppercase"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Agrupa este producto en una colección temática de la tienda
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex items-center justify-between pt-2">
            <Button type="button" variant="ghost" onClick={() => router.push('/admin/products')} disabled={saving}>
              Cancelar
            </Button>
            <Button type="submit" disabled={saving} className="min-w-[140px]">
              {saving ? 'Guardando…' : 'Guardar Cambios'}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}
