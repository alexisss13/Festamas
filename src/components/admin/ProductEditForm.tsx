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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { updateProductEcommerce } from '@/actions/admin-products';
import { toast } from 'sonner';
import { Package, Lock, X } from 'lucide-react';
import { VariantManager } from './VariantManager';

interface Product {
  id: string;
  title: string;
  slug: string;
  description: string;
  basePrice: number;
  images: string[];
  isAvailable: boolean;
  tags: string[];
  groupTag: string | null;
  wholesalePrice: number | null;
  wholesaleMinCount: number | null;
  discountPercentage: number;
  averageRating: number;
  reviewCount: number;
  viewCount: number;
  salesCount: number;
  category: {
    id: string;
    name: string;
  };
  supplier: {
    id: string;
    name: string;
  } | null;
  variants: Array<{
    id: string;
    name: string;
    sku: string | null;
    barcode: string | null;
    price: number | null;
    cost: number;
    minStock: number;
    stock: Array<{
      quantity: number;
      branch: {
        name: string;
      };
    }>;
  }>;
}

interface Props {
  product: Product;
}

export function ProductEditForm({ product }: Props) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Estados editables
  const [description, setDescription] = useState(product.description);
  const [tags, setTags] = useState<string[]>(product.tags);
  const [tagInput, setTagInput] = useState('');
  const [groupTag, setGroupTag] = useState(product.groupTag || '');
  const [isAvailable, setIsAvailable] = useState(product.isAvailable);
  const [discountPercentage, setDiscountPercentage] = useState(product.discountPercentage);

  const handleAddTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const result = await updateProductEcommerce(product.id, {
        description,
        tags,
        groupTag: groupTag || null,
        isAvailable,
        discountPercentage,
      });

      if (result.success) {
        toast.success('Producto actualizado correctamente');
        router.push('/admin/products');
        router.refresh();
      } else {
        toast.error(result.error || 'Error al actualizar producto');
      }
    } catch (error) {
      console.error(error);
      toast.error('Error al actualizar producto');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Columna izquierda: Datos del POS (solo lectura) */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Lock className="w-5 h-5 text-slate-400" />
                Datos del POS
              </CardTitle>
              <p className="text-xs text-slate-500">
                Estos campos no se pueden editar desde aquí
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              
              {/* Imágenes */}
              <div>
                <Label className="text-xs text-slate-500 uppercase">Imágenes</Label>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {product.images.slice(0, 5).map((img, idx) => (
                    <div key={idx} className="aspect-square bg-slate-100 rounded-lg overflow-hidden">
                      <Image
                        loader={cloudinaryLoader}
                        src={img}
                        alt={`${product.title} ${idx + 1}`}
                        width={100}
                        height={100}
                        className="w-full h-full object-contain"
                      />
                    </div>
                  ))}
                  {product.images.length === 0 && (
                    <div className="aspect-square bg-slate-100 rounded-lg flex items-center justify-center">
                      <Package className="w-8 h-8 text-slate-300" />
                    </div>
                  )}
                </div>
              </div>

              {/* Nombre */}
              <div>
                <Label className="text-xs text-slate-500 uppercase">Nombre</Label>
                <div className="mt-1 text-sm font-medium text-slate-900">
                  {product.title}
                </div>
              </div>

              {/* Categoría */}
              <div>
                <Label className="text-xs text-slate-500 uppercase">Categoría</Label>
                <div className="mt-1 text-sm text-slate-700">
                  {product.category.name}
                </div>
              </div>

              {/* Proveedor */}
              <div>
                <Label className="text-xs text-slate-500 uppercase">Proveedor</Label>
                <div className="mt-1 text-sm text-slate-700">
                  {product.supplier?.name || '-'}
                </div>
              </div>

              {/* Precio Base */}
              <div>
                <Label className="text-xs text-slate-500 uppercase">Precio Base</Label>
                <div className="mt-1 text-sm font-medium text-slate-900">
                  S/ {product.basePrice.toFixed(2)}
                </div>
              </div>

              {/* Precio Mayorista */}
              {product.wholesalePrice && (
                <div>
                  <Label className="text-xs text-slate-500 uppercase">Precio Mayorista</Label>
                  <div className="mt-1 text-sm text-slate-700">
                    S/ {product.wholesalePrice.toFixed(2)}
                    {product.wholesaleMinCount && (
                      <span className="text-xs text-slate-500 ml-1">
                        (mín. {product.wholesaleMinCount})
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Descuento */}
              {product.discountPercentage > 0 && (
                <div>
                  <Label className="text-xs text-slate-500 uppercase">Descuento</Label>
                  <div className="mt-1">
                    <Badge className="bg-red-100 text-red-700">
                      {product.discountPercentage}% OFF
                    </Badge>
                  </div>
                </div>
              )}

              {/* Estadísticas Automáticas */}
              <div className="pt-4 border-t border-slate-200">
                <Label className="text-xs text-slate-500 uppercase mb-3 block">Estadísticas</Label>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-50 rounded-lg p-3">
                    <div className="text-xs text-slate-500 mb-1">Ventas</div>
                    <div className="text-lg font-bold text-slate-900">{product.salesCount}</div>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-3">
                    <div className="text-xs text-slate-500 mb-1">Vistas</div>
                    <div className="text-lg font-bold text-slate-900">{product.viewCount}</div>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-3">
                    <div className="text-xs text-slate-500 mb-1">Reseñas</div>
                    <div className="text-lg font-bold text-slate-900">{product.reviewCount}</div>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-3">
                    <div className="text-xs text-slate-500 mb-1">Rating</div>
                    <div className="text-lg font-bold text-slate-900">{product.averageRating.toFixed(1)} ⭐</div>
                  </div>
                </div>
              </div>

            </CardContent>
          </Card>

          {/* Variantes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Lock className="w-5 h-5 text-slate-400" />
                Variantes (Solo Lectura)
              </CardTitle>
              <p className="text-xs text-slate-500">
                Variantes creadas desde el POS - No editables aquí
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              {product.variants.map((variant) => {
                const totalStock = variant.stock.reduce((sum, st) => sum + st.quantity, 0);
                
                return (
                  <div key={variant.id} className="p-3 bg-slate-50 rounded-lg space-y-2">
                    <div className="font-medium text-sm text-slate-900">
                      {variant.name}
                    </div>
                    
                    {variant.sku && (
                      <div className="text-xs text-slate-600">
                        SKU: <span className="font-mono">{variant.sku}</span>
                      </div>
                    )}
                    
                    {variant.barcode && (
                      <div className="text-xs text-slate-600">
                        Código: <span className="font-mono">{variant.barcode}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-600">
                        Precio: <span className="font-medium text-slate-900">
                          S/ {variant.price ? variant.price.toFixed(2) : '0.00'}
                        </span>
                      </span>
                      <span className="text-slate-600">
                        Stock: <span className="font-medium text-slate-900">
                          {totalStock}
                        </span>
                      </span>
                    </div>

                    {variant.stock.length > 0 && (
                      <div className="pt-2 border-t border-slate-200">
                        <div className="text-xs text-slate-500 mb-1">Por sucursal:</div>
                        {variant.stock.map((st, idx) => (
                          <div key={idx} className="text-xs text-slate-600 flex justify-between">
                            <span>{st.branch.name}</span>
                            <span className="font-medium">{st.quantity}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Gestión de Variantes Web */}
          <VariantManager productId={product.id} variants={product.variants} />
        </div>

        {/* Columna derecha: Campos editables */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                Información de E-commerce
              </CardTitle>
              <p className="text-xs text-slate-500">
                Edita estos campos para mejorar la presentación en la tienda online
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* Descripción */}
              <div>
                <Label htmlFor="description">
                  Descripción del Producto
                </Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={6}
                  placeholder="Describe el producto para tus clientes..."
                  className="mt-1"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Una buena descripción ayuda a los clientes a entender mejor el producto
                </p>
              </div>

              {/* Tags */}
              <div>
                <Label htmlFor="tags">
                  Etiquetas (Tags)
                </Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    id="tags"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                    placeholder="Escribe una etiqueta y presiona Enter"
                  />
                  <Button
                    type="button"
                    onClick={handleAddTag}
                    variant="outline"
                  >
                    Agregar
                  </Button>
                </div>
                
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="pl-2 pr-1 py-1"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="ml-1 hover:text-red-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
                
                <p className="text-xs text-slate-500 mt-1">
                  Las etiquetas ayudan a organizar y filtrar productos
                </p>
              </div>

              {/* Group Tag */}
              <div>
                <Label htmlFor="groupTag">
                  Etiqueta de Grupo
                </Label>
                <Input
                  id="groupTag"
                  value={groupTag}
                  onChange={(e) => setGroupTag(e.target.value)}
                  placeholder="Ej: nuevo, destacado, oferta"
                  className="mt-1"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Usa esto para agrupar productos en secciones especiales de la tienda
                </p>
              </div>

              {/* Disponibilidad */}
              <div>
                <Label htmlFor="isAvailable">
                  Disponibilidad en E-commerce
                </Label>
                <div className="flex items-center gap-3 mt-2">
                  <button
                    type="button"
                    onClick={() => setIsAvailable(true)}
                    className={`px-4 py-2 rounded-lg border-2 transition-all ${
                      isAvailable
                        ? 'border-green-500 bg-green-50 text-green-700 font-medium'
                        : 'border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    Disponible
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAvailable(false)}
                    className={`px-4 py-2 rounded-lg border-2 transition-all ${
                      !isAvailable
                        ? 'border-red-500 bg-red-50 text-red-700 font-medium'
                        : 'border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    No disponible
                  </button>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  Controla si el producto se muestra en la tienda online
                </p>
              </div>

              {/* Descuento Web */}
              <div>
                <Label htmlFor="discountPercentage">
                  Descuento Web (%)
                </Label>
                <div className="flex items-center gap-3 mt-2">
                  <Input
                    id="discountPercentage"
                    type="number"
                    min="0"
                    max="100"
                    value={discountPercentage}
                    onChange={(e) => setDiscountPercentage(Math.max(0, Math.min(100, parseInt(e.target.value) || 0)))}
                    className="w-32"
                  />
                  <div className="flex-1">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={discountPercentage}
                      onChange={(e) => setDiscountPercentage(parseInt(e.target.value))}
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                  </div>
                  {discountPercentage > 0 && (
                    <Badge className="bg-red-100 text-red-700 font-bold">
                      {discountPercentage}% OFF
                    </Badge>
                  )}
                </div>
                
                {/* Vista previa del precio con descuento */}
                {discountPercentage > 0 && (
                  <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="text-xs font-semibold text-blue-700 mb-2">Vista Previa del Precio:</div>
                    <div className="flex items-center gap-3">
                      <div>
                        <div className="text-xs text-slate-500">Precio Original</div>
                        <div className="text-sm font-medium text-slate-400 line-through">
                          S/ {product.basePrice.toFixed(2)}
                        </div>
                      </div>
                      <div className="text-xl text-slate-400">→</div>
                      <div>
                        <div className="text-xs text-blue-700 font-semibold">Precio Final</div>
                        <div className="text-lg font-bold text-blue-700">
                          S/ {(product.basePrice * (1 - discountPercentage / 100)).toFixed(2)}
                        </div>
                      </div>
                      <div className="ml-auto">
                        <div className="text-xs text-green-700">Ahorro</div>
                        <div className="text-sm font-bold text-green-700">
                          S/ {(product.basePrice * (discountPercentage / 100)).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                <p className="text-xs text-slate-500 mt-2">
                  Aplica un descuento exclusivo para la tienda online (0-100%)
                </p>
              </div>

            </CardContent>
          </Card>

          {/* Botones de acción */}
          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/admin/products')}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </div>
        </div>

      </div>
    </form>
  );
}
