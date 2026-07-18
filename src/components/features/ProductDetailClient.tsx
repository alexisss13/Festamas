'use client';

import { useState, useMemo, ReactNode, useEffect } from 'react';
import { ProductImageGallery } from './ProductImageGallery';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { useCartStore, CartProduct } from '@/store/cart';
import { toast } from 'sonner';
import { ShoppingCart, Minus, Plus, Heart, Package, Tag } from 'lucide-react';
import { recordProductView } from '@/actions/products';

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

interface RawVariantAttribute {
  attributeValue: {
    id: string;
    value: string;
    slug: string;
    hexColor: string | null;
    image: string | null;
    attributeType: {
      id: string;
      name: string;
      slug: string;
      order: number;
    };
  };
}

interface RawVariant {
  id: string;
  name: string;
  images: string[];
  barcode: string | null;
  sku: string | null;
  attributes: Record<string, string> | null;
  variantAttributes: RawVariantAttribute[];
  stock: number; // already summed from branchId
}

interface NormalizedAttr {
  typeSlug: string;
  typeName: string;
  typeOrder: number;
  valueSlug: string;
  valueName: string;
  hexColor: string | null;
  image: string | null;
}

interface NormalizedVariant {
  id: string;
  name: string;
  images: string[];
  stock: number;
  attrs: NormalizedAttr[];
}

export interface ProductForDetail {
  id: string;
  slug: string;
  title: string;
  images: string[];
  isAvailable: boolean;
  basePrice: number;
  wholesalePrice: number | null;
  wholesaleMinCount: number | null;
  discountPercentage: number;
}

interface Props {
  product: ProductForDetail;
  variants: RawVariant[];
  headerSlot?: ReactNode;
}

// ─────────────────────────────────────────────
// Color name → hex fallback (for legacy JSON attrs)
// ─────────────────────────────────────────────
const COLOR_MAP: Record<string, string> = {
  rojo: '#ef4444', roja: '#ef4444', red: '#ef4444',
  azul: '#3b82f6', blue: '#3b82f6',
  verde: '#22c55e', green: '#22c55e',
  amarillo: '#eab308', yellow: '#eab308',
  rosa: '#ec4899', pink: '#ec4899',
  negro: '#0f172a', black: '#0f172a',
  blanco: '#f1f5f9', white: '#f1f5f9',
  morado: '#a855f7', violeta: '#7c3aed', purple: '#a855f7',
  naranja: '#f97316', orange: '#f97316',
  celeste: '#38bdf8', 'cielo': '#38bdf8',
  gris: '#94a3b8', gray: '#94a3b8', grey: '#94a3b8',
  marron: '#92400e', cafe: '#78350f', brown: '#92400e',
  dorado: '#d97706', gold: '#d97706',
  plateado: '#cbd5e1', silver: '#cbd5e1',
};

function resolveColor(attr: NormalizedAttr): string | null {
  if (attr.hexColor) return attr.hexColor;
  const key = attr.valueName.toLowerCase().trim();
  return COLOR_MAP[key] ?? null;
}

// ─────────────────────────────────────────────
// Normalization
// ─────────────────────────────────────────────

function normalizeAttrs(v: RawVariant): NormalizedAttr[] {
  if (v.variantAttributes?.length > 0) {
    return v.variantAttributes
      .sort((a, b) => (a.attributeValue.attributeType.order ?? 0) - (b.attributeValue.attributeType.order ?? 0))
      .map(va => ({
        typeSlug: va.attributeValue.attributeType.slug,
        typeName: va.attributeValue.attributeType.name,
        typeOrder: va.attributeValue.attributeType.order ?? 0,
        valueSlug: va.attributeValue.slug,
        valueName: va.attributeValue.value,
        hexColor: va.attributeValue.hexColor,
        image: va.attributeValue.image,
      }));
  }

  if (v.attributes && typeof v.attributes === 'object' && !Array.isArray(v.attributes)) {
    return Object.entries(v.attributes)
      .filter(([, val]) => val)
      .map(([key, val], i) => ({
        typeSlug: key.toLowerCase(),
        typeName: key.charAt(0).toUpperCase() + key.slice(1),
        typeOrder: i,
        valueSlug: String(val).toLowerCase().replace(/\s+/g, '-'),
        valueName: String(val),
        hexColor: null,
        image: null,
      }));
  }

  return [];
}

// ─────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────

export function ProductDetailClient({ product, variants: rawVariants, headerSlot }: Props) {
  useEffect(() => {
    const key = `festamas-viewed-${product.id}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, '1');
    void recordProductView(product.id);
  }, [product.id]);
  // Normalize variants
  const variants = useMemo<NormalizedVariant[]>(
    () => rawVariants.map(v => ({ ...v, attrs: normalizeAttrs(v) })),
    [rawVariants],
  );

  const hasAttributes = useMemo(() => variants.some(v => v.attrs.length > 0), [variants]);

  // Collect attribute types ordered
  const attrTypes = useMemo(() => {
    const map = new Map<string, { typeSlug: string; typeName: string; typeOrder: number }>();
    for (const v of variants) {
      for (const a of v.attrs) {
        if (!map.has(a.typeSlug)) {
          map.set(a.typeSlug, { typeSlug: a.typeSlug, typeName: a.typeName, typeOrder: a.typeOrder });
        }
      }
    }
    return Array.from(map.values()).sort((a, b) => a.typeOrder - b.typeOrder);
  }, [variants]);

  // Selected attributes state — initialized to first variant
  const [selectedAttrs, setSelectedAttrs] = useState<Record<string, string>>(() => {
    if (!hasAttributes || variants.length === 0) return {};
    return Object.fromEntries(variants[0].attrs.map(a => [a.typeSlug, a.valueSlug]));
  });

  // Index-based selection for variants without attributes
  const [selectedIdx, setSelectedIdx] = useState(0);

  // Resolve the active variant
  const selectedVariant = useMemo<NormalizedVariant | null>(() => {
    if (variants.length === 0) return null;
    if (!hasAttributes) return variants[selectedIdx] ?? variants[0];

    // Exact match: every selected attribute type is present in the variant
    const exact = variants.find(v =>
      attrTypes.every(type =>
        selectedAttrs[type.typeSlug] == null ||
        v.attrs.some(a => a.typeSlug === type.typeSlug && a.valueSlug === selectedAttrs[type.typeSlug]),
      ),
    );
    return exact ?? variants[0];
  }, [variants, selectedAttrs, selectedIdx, attrTypes, hasAttributes]);

  // Displayed images: prefer variant images, fall back to product images
  const displayImages = useMemo(() => {
    const vImgs = selectedVariant?.images ?? [];
    return vImgs.length > 0 ? vImgs : product.images;
  }, [selectedVariant, product.images]);

  const currentStock = selectedVariant?.stock ?? 0;
  const isOutOfStock = !product.isAvailable || currentStock <= 0;

  // Check if a value leads to any valid variant (considering other current selections)
  function isValueAvailable(typeSlug: string, valueSlug: string): boolean {
    const test = { ...selectedAttrs, [typeSlug]: valueSlug };
    return variants.some(v =>
      attrTypes.every(type =>
        test[type.typeSlug] == null ||
        v.attrs.some(a => a.typeSlug === type.typeSlug && a.valueSlug === test[type.typeSlug]),
      ),
    );
  }

  function handleSelectAttr(typeSlug: string, valueSlug: string) {
    setSelectedAttrs(prev => ({ ...prev, [typeSlug]: valueSlug }));
  }

  // All unique values for a given type
  function getValuesForType(typeSlug: string): NormalizedAttr[] {
    const seen = new Map<string, NormalizedAttr>();
    for (const v of variants) {
      for (const a of v.attrs) {
        if (a.typeSlug === typeSlug && !seen.has(a.valueSlug)) seen.set(a.valueSlug, a);
      }
    }
    return Array.from(seen.values());
  }

  const isColorType = (slug: string) => slug.toLowerCase().includes('color') || slug === 'colour' || slug === 'color';

  // ─── Cart & pricing ───────────────────────────────────
  const [quantity, setQuantity] = useState(1);
  const addProductToCart = useCartStore(s => s.addProductToCart);

  const discount = product.discountPercentage ?? 0;
  const wholesalePrice = product.wholesalePrice ?? 0;
  const minCount = product.wholesaleMinCount ?? 0;

  let unitPrice = product.basePrice;
  let isWholesale = false;
  let isDiscounted = false;

  if (wholesalePrice > 0 && minCount > 0 && quantity >= minCount) {
    unitPrice = wholesalePrice;
    isWholesale = true;
  } else if (discount > 0) {
    unitPrice = product.basePrice * (1 - discount / 100);
    isDiscounted = true;
  }

  const fmt = (v: number) =>
    new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(v);

  function handleAddToCart() {
    const variantLabel =
      selectedVariant?.name &&
      selectedVariant.name !== 'Default Variant' &&
      selectedVariant.name !== 'Estándar'
        ? selectedVariant.name
        : null;

    const item: CartProduct = {
      id: product.id + (variantLabel ? `-${selectedVariant!.id}` : ''),
      productId: product.id,
      variantId: selectedVariant?.id,
      slug: product.slug,
      title: product.title + (variantLabel ? ` — ${variantLabel}` : ''),
      price: product.basePrice,
      quantity,
      image: displayImages[0] ?? product.images[0] ?? '/placeholder.jpg',
      stock: currentStock,
      wholesalePrice,
      wholesaleMinCount: minCount,
      discountPercentage: discount,
    };

    addProductToCart(item);
    toast.success(`${quantity} unidad(es) ${variantLabel ? `(${variantLabel})` : ''} agregadas al carrito`);
  }

  // ─── Render ───────────────────────────────────────────
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 lg:gap-16 items-start">

      {/* ── Left: image gallery ── */}
      <div className="md:sticky md:top-24">
        <ProductImageGallery
          images={displayImages}
          title={product.title}
          isOutOfStock={isOutOfStock}
        />
      </div>

      {/* ── Right: info + actions ── */}
      <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-right-4 duration-500">

        {/* Slot for static title/category from server */}
        {headerSlot}

        {/* Prices */}
        <div className="space-y-1">
          {(isDiscounted || isWholesale) && (
            <span className="text-xs text-slate-400 line-through font-medium">{fmt(product.basePrice)}</span>
          )}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-2xl md:text-3xl font-extrabold tracking-tight text-primary">
              {fmt(unitPrice)}
            </span>
            {isWholesale && (
              <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-100 text-xs">
                <Package className="w-3 h-3 mr-1" /> Mayorista
              </Badge>
            )}
            {isDiscounted && !isWholesale && (
              <Badge variant="secondary" className="bg-red-50 text-red-600 border-red-100 text-xs">
                <Tag className="w-3 h-3 mr-1" /> -{discount}%
              </Badge>
            )}
          </div>
          {minCount > 0 && !isWholesale && (
            <p className="text-xs text-slate-500">
              Lleva <strong>{minCount}</strong> und. para precio mayorista{' '}
              <strong className="text-blue-600">{fmt(wholesalePrice)}</strong> c/u
            </p>
          )}
        </div>

        <div className="h-px bg-slate-100 w-full" />

        {/* ── Variant selector (with attributes) ── */}
        {hasAttributes && attrTypes.length > 0 && (
          <div className="space-y-4">
            {attrTypes.map(type => {
              const values = getValuesForType(type.typeSlug);
              const selected = selectedAttrs[type.typeSlug];
              const isColor = isColorType(type.typeSlug);

              return (
                <div key={type.typeSlug}>
                  <div className="flex items-center gap-2 mb-2.5">
                    <span className="text-sm font-semibold text-slate-800">{type.typeName}</span>
                    {selected && (
                      <span className="text-sm text-slate-500">
                        — {values.find(v => v.valueSlug === selected)?.valueName}
                      </span>
                    )}
                  </div>

                  {isColor ? (
                    <div className="flex flex-wrap gap-2.5">
                      {values.map(val => {
                        const isActive = selected === val.valueSlug;
                        const available = isValueAvailable(type.typeSlug, val.valueSlug);
                        const resolvedColor = resolveColor(val);
                        const isDark = resolvedColor
                          ? parseInt(resolvedColor.slice(1, 3), 16) * 0.299 +
                              parseInt(resolvedColor.slice(3, 5), 16) * 0.587 +
                              parseInt(resolvedColor.slice(5, 7), 16) * 0.114 < 128
                          : false;

                        return (
                          <button
                            key={val.valueSlug}
                            title={val.valueName}
                            disabled={!available}
                            onClick={() => handleSelectAttr(type.typeSlug, val.valueSlug)}
                            style={resolvedColor ? { backgroundColor: resolvedColor } : undefined}
                            className={cn(
                              'relative h-9 w-9 rounded-full border-2 transition-all focus:outline-none overflow-hidden',
                              isActive
                                ? 'border-slate-900 ring-2 ring-slate-300 ring-offset-1 scale-110 shadow-md'
                                : resolvedColor
                                  ? 'border-white hover:border-slate-400 shadow-sm'
                                  : 'border-slate-200 hover:border-slate-500 bg-slate-100',
                              !available && 'opacity-30 cursor-not-allowed',
                            )}
                          >
                            {/* Image attribute (takes priority over color) */}
                            {val.image && (
                              <img
                                src={val.image}
                                alt={val.valueName}
                                className="absolute inset-0 w-full h-full object-cover"
                              />
                            )}
                            {/* Text initials — only when no color AND no image */}
                            {!resolvedColor && !val.image && (
                              <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-slate-600">
                                {val.valueName.slice(0, 2).toUpperCase()}
                              </span>
                            )}
                            {/* Slash for unavailable */}
                            {!available && (
                              <span className="absolute inset-0 flex items-center justify-center">
                                <span className="absolute w-px h-10 bg-red-500/60 rotate-45" />
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {values.map(val => {
                        const isActive = selected === val.valueSlug;
                        const available = isValueAvailable(type.typeSlug, val.valueSlug);
                        return (
                          <button
                            key={val.valueSlug}
                            disabled={!available}
                            onClick={() => handleSelectAttr(type.typeSlug, val.valueSlug)}
                            className={cn(
                              'px-3.5 py-1.5 rounded-lg border text-sm font-medium transition-all focus:outline-none',
                              isActive
                                ? 'border-slate-900 bg-slate-900 text-white shadow-sm'
                                : 'border-slate-200 bg-white text-slate-700 hover:border-slate-500 hover:bg-slate-50',
                              !available && 'opacity-30 cursor-not-allowed line-through',
                            )}
                          >
                            {val.valueName}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Selected variant name badge */}
            {selectedVariant &&
              selectedVariant.name !== 'Default Variant' &&
              selectedVariant.name !== 'Estándar' && (
                <p className="text-xs text-slate-400">
                  Variante:{' '}
                  <span className="font-medium text-slate-600">{selectedVariant.name}</span>
                </p>
              )}
          </div>
        )}

        {/* ── Fallback: plain variant list (no attributes) ── */}
        {!hasAttributes && variants.length > 1 && (
          <div>
            <p className="text-sm font-semibold text-slate-800 mb-2">Variante</p>
            <div className="flex flex-wrap gap-2">
              {variants.map((v, idx) => (
                <button
                  key={v.id}
                  onClick={() => setSelectedIdx(idx)}
                  className={cn(
                    'px-3.5 py-1.5 rounded-lg border text-sm font-medium transition-all',
                    selectedIdx === idx
                      ? 'border-slate-900 bg-slate-900 text-white shadow-sm'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-500',
                  )}
                >
                  {v.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Quantity + buttons ── */}
        <div className="flex flex-col gap-3 md:gap-4">
          <div className="flex items-center border border-slate-200 rounded-lg w-fit shadow-sm">
            <button
              onClick={() => setQuantity(q => Math.max(1, q - 1))}
              disabled={quantity <= 1}
              className="h-10 w-10 md:h-11 md:w-11 flex items-center justify-center rounded-l-lg hover:bg-slate-50 text-slate-600 disabled:opacity-40 transition-colors"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <div className="h-10 w-11 md:h-11 md:w-12 flex items-center justify-center border-x border-slate-100 font-bold text-slate-900 text-base">
              {quantity}
            </div>
            <button
              onClick={() => setQuantity(q => q + 1)}
              className="h-10 w-10 md:h-11 md:w-11 flex items-center justify-center rounded-r-lg hover:bg-slate-50 text-slate-600 transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="flex gap-2 md:gap-3">
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className={cn(
                'flex-1 h-11 md:h-12 rounded-md text-sm md:text-base font-bold shadow-md transition-all flex items-center justify-center gap-2',
                !isOutOfStock
                  ? 'bg-primary text-white hover:opacity-90 hover:shadow-lg hover:-translate-y-0.5'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none',
              )}
            >
              <ShoppingCart className="h-4 w-4 md:h-5 md:w-5" />
              <span className="hidden sm:inline">{!isOutOfStock ? 'Agregar al Carrito' : 'Agotado'}</span>
              <span className="sm:hidden">{!isOutOfStock ? 'Agregar' : 'Agotado'}</span>
            </button>

            <button className="h-11 w-11 md:h-12 md:w-12 rounded-md border border-slate-300 text-slate-400 hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-colors flex items-center justify-center flex-shrink-0">
              <Heart className="h-4 w-4 md:h-5 md:w-5" />
            </button>
          </div>
        </div>

        {/* ── Stock & trust badges ── */}
        <div className="grid grid-cols-2 gap-3 text-[11px] md:text-xs text-slate-500 bg-slate-50 p-3 md:p-4 rounded-lg border border-slate-100">
          <div className="flex items-center gap-1.5">
            <span className={cn('h-2 w-2 rounded-full flex-shrink-0', currentStock > 0 ? 'bg-green-500' : 'bg-red-500')} />
            <span>Stock: <strong>{currentStock > 0 ? currentStock : 'Sin stock'}</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-blue-500 flex-shrink-0" />
            <span>Envío a todo el Perú</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-yellow-500 flex-shrink-0" />
            <span>Pago seguro</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-purple-500 flex-shrink-0" />
            <span>Garantía de tienda</span>
          </div>
        </div>
      </div>
    </div>
  );
}
