'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { createVariant, updateVariant, deleteVariant } from '@/actions/admin-variants';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Variant {
  id: string;
  name: string;
  sku: string | null;
  barcode: string | null;
  price: number | null;
  cost: number;
  minStock: number;
  attributes: any;
  images: string[];
  stock: Array<{
    quantity: number;
    branch: {
      name: string;
    };
  }>;
}

interface Props {
  productId: string;
  variants: Variant[];
}

export function VariantManager({ productId, variants }: Props) {
  const router = useRouter();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingVariant, setEditingVariant] = useState<Variant | null>(null);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Variantes del Producto</CardTitle>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2">
                <Plus className="w-4 h-4" />
                Nueva Variante
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Crear Nueva Variante</DialogTitle>
              </DialogHeader>
              <VariantForm
                productId={productId}
                onSuccess={() => {
                  setIsCreateOpen(false);
                  router.refresh();
                  toast.success('Variante creada correctamente');
                }}
                onCancel={() => setIsCreateOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {variants.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <p className="text-sm">No hay variantes creadas</p>
            <p className="text-xs mt-1">Crea variantes para ofrecer diferentes opciones del producto</p>
          </div>
        ) : (
          variants.map((variant) => (
            <VariantCard
              key={variant.id}
              variant={variant}
              onEdit={() => setEditingVariant(variant)}
              onDelete={async () => {
                if (confirm('¿Estás seguro de eliminar esta variante?')) {
                  const result = await deleteVariant(variant.id);
                  if (result.success) {
                    toast.success('Variante eliminada');
                    router.refresh();
                  } else {
                    toast.error(result.error || 'Error al eliminar');
                  }
                }
              }}
            />
          ))
        )}

        {editingVariant && (
          <Dialog open={!!editingVariant} onOpenChange={() => setEditingVariant(null)}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Editar Variante</DialogTitle>
              </DialogHeader>
              <VariantForm
                productId={productId}
                variant={editingVariant}
                onSuccess={() => {
                  setEditingVariant(null);
                  router.refresh();
                  toast.success('Variante actualizada correctamente');
                }}
                onCancel={() => setEditingVariant(null)}
              />
            </DialogContent>
          </Dialog>
        )}
      </CardContent>
    </Card>
  );
}

function VariantCard({ 
  variant, 
  onEdit, 
  onDelete 
}: { 
  variant: Variant; 
  onEdit: () => void; 
  onDelete: () => void;
}) {
  const totalStock = variant.stock.reduce((sum, st) => sum + st.quantity, 0);
  const attributes = variant.attributes as Record<string, string> || {};

  return (
    <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="font-medium text-slate-900 mb-1">{variant.name}</div>
          
          {Object.keys(attributes).length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {Object.entries(attributes).map(([key, value]) => (
                <Badge key={key} variant="secondary" className="text-xs">
                  {key}: {value}
                </Badge>
              ))}
            </div>
          )}

          <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
            {variant.sku && (
              <div>SKU: <span className="font-mono font-medium">{variant.sku}</span></div>
            )}
            {variant.barcode && (
              <div>Código: <span className="font-mono font-medium">{variant.barcode}</span></div>
            )}
            <div>Precio: <span className="font-medium text-slate-900">S/ {variant.price?.toFixed(2) || '0.00'}</span></div>
            <div>Stock: <span className="font-medium text-slate-900">{totalStock}</span></div>
          </div>
        </div>

        <div className="flex gap-1 ml-3">
          <Button size="sm" variant="ghost" onClick={onEdit}>
            <Edit className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={onDelete} className="text-red-600 hover:text-red-700">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {variant.stock.length > 0 && (
        <div className="pt-3 border-t border-slate-200">
          <div className="text-xs text-slate-500 mb-1">Stock por sucursal:</div>
          <div className="grid grid-cols-2 gap-1">
            {variant.stock.map((st, idx) => (
              <div key={idx} className="text-xs text-slate-600 flex justify-between">
                <span>{st.branch.name}</span>
                <span className="font-medium">{st.quantity}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function VariantForm({ 
  productId, 
  variant, 
  onSuccess, 
  onCancel 
}: { 
  productId: string; 
  variant?: Variant; 
  onSuccess: () => void; 
  onCancel: () => void;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [name, setName] = useState(variant?.name || '');
  const [sku, setSku] = useState(variant?.sku || '');
  const [barcode, setBarcode] = useState(variant?.barcode || '');
  const [price, setPrice] = useState(variant?.price?.toString() || '');
  const [cost, setCost] = useState(variant?.cost.toString() || '0');
  const [minStock, setMinStock] = useState(variant?.minStock.toString() || '5');
  
  // Atributos dinámicos
  const [attributes, setAttributes] = useState<Record<string, string>>(
    (variant?.attributes as Record<string, string>) || {}
  );
  const [newAttrKey, setNewAttrKey] = useState('');
  const [newAttrValue, setNewAttrValue] = useState('');

  const handleAddAttribute = () => {
    if (newAttrKey && newAttrValue) {
      setAttributes({ ...attributes, [newAttrKey]: newAttrValue });
      setNewAttrKey('');
      setNewAttrValue('');
    }
  };

  const handleRemoveAttribute = (key: string) => {
    const newAttrs = { ...attributes };
    delete newAttrs[key];
    setAttributes(newAttrs);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const data = {
        productId,
        name,
        sku: sku || undefined,
        barcode: barcode || undefined,
        price: price ? parseFloat(price) : undefined,
        cost: parseFloat(cost),
        minStock: parseInt(minStock),
        attributes: Object.keys(attributes).length > 0 ? attributes : undefined,
      };

      const result = variant
        ? await updateVariant(variant.id, data)
        : await createVariant(data);

      if (result.success) {
        onSuccess();
      } else {
        toast.error(result.error || 'Error al guardar');
      }
    } catch (error) {
      toast.error('Error al guardar variante');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Nombre de la Variante *</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ej: Rojo - Talla M"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="sku">SKU</Label>
          <Input
            id="sku"
            value={sku}
            onChange={(e) => setSku(e.target.value)}
            placeholder="Código SKU"
          />
        </div>
        <div>
          <Label htmlFor="barcode">Código de Barras</Label>
          <Input
            id="barcode"
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
            placeholder="Código de barras"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="price">Precio</Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="0.00"
          />
        </div>
        <div>
          <Label htmlFor="cost">Costo *</Label>
          <Input
            id="cost"
            type="number"
            step="0.01"
            value={cost}
            onChange={(e) => setCost(e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="minStock">Stock Mínimo *</Label>
          <Input
            id="minStock"
            type="number"
            value={minStock}
            onChange={(e) => setMinStock(e.target.value)}
            required
          />
        </div>
      </div>

      <div>
        <Label>Atributos (Color, Talla, etc.)</Label>
        <div className="space-y-2 mt-2">
          {Object.entries(attributes).map(([key, value]) => (
            <div key={key} className="flex items-center gap-2">
              <Badge variant="secondary" className="flex-1 justify-between">
                <span>{key}: {value}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveAttribute(key)}
                  className="ml-2 hover:text-red-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            </div>
          ))}
          
          <div className="flex gap-2">
            <Input
              placeholder="Atributo (ej: color)"
              value={newAttrKey}
              onChange={(e) => setNewAttrKey(e.target.value)}
              className="flex-1"
            />
            <Input
              placeholder="Valor (ej: Rojo)"
              value={newAttrValue}
              onChange={(e) => setNewAttrValue(e.target.value)}
              className="flex-1"
            />
            <Button
              type="button"
              onClick={handleAddAttribute}
              variant="outline"
              size="sm"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Ejemplos: color (Rojo), talla (M), edad (3-5 años), personaje (Spider-Man)
        </p>
      </div>

      <div className="flex gap-3 justify-end pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Guardando...' : variant ? 'Actualizar' : 'Crear Variante'}
        </Button>
      </div>
    </form>
  );
}
