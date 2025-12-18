'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createOrUpdateProduct } from '@/actions/product-form';
import { Product, Category, Division } from '@prisma/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { 
  Loader2, Save, DollarSign, Tag, 
  Percent, Layers, Palette, BoxSelect, Info, ScanBarcode, Printer 
} from 'lucide-react';
import { toast } from 'sonner';
import ImageUpload from '@/components/ui/image-upload';
import { cn } from '@/lib/utils';
// 👇 Importamos Barcode
import Barcode from 'react-barcode';
import { BarcodeControl } from '@/components/admin/BarcodeControl';

interface Props {
  product?: Product | null;
  categories: Category[];
  defaultDivision?: Division;
}

export function ProductForm({ product, categories, defaultDivision = 'JUGUETERIA' }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<string[]>(product?.images || []);
  const [isAvailable, setIsAvailable] = useState(product?.isAvailable ?? true);
  const [color, setColor] = useState(product?.color || '');
  
  // Estado para el código de barras
  const [barcode, setBarcode] = useState(product?.barcode || '');

  const currentDivision = product?.division || defaultDivision;
  const isFestamas = currentDivision === 'JUGUETERIA';
  const brandFocusClass = isFestamas ? "focus-visible:ring-festamas-primary" : "focus-visible:ring-fiestasya-accent";
  const brandTextClass = isFestamas ? "text-festamas-primary" : "text-fiestasya-accent";

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    images.forEach(img => formData.append('images', img));
    if (isAvailable) formData.set('isAvailable', 'on');
    formData.set('division', currentDivision);
    formData.set('color', color);
    
    // Si el usuario dejó vacío el barcode, el server generará uno, 
    // pero si puso uno manual, lo enviamos.
    if (barcode) formData.set('barcode', barcode);

    const result = await createOrUpdateProduct(formData, product?.id);

    if (result.success) {
      toast.success(product ? 'Producto actualizado' : 'Producto creado');
      router.push('/admin/products');
      router.refresh();
    } else {
      toast.error(result.error || 'Error al guardar');
    }
    setLoading(false);
  };

  // Función para imprimir etiqueta (básica)
  const printBarcode = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
        // Obtenemos el SVG del código de barras
        const svg = document.getElementById('barcode-svg')?.outerHTML;
        
        printWindow.document.write(`
            <html>
            <head><title>Imprimir Etiqueta</title></head>
            <body style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:100vh;">
                <h2 style="margin-bottom:0; font-family:sans-serif;">${product?.title || 'Nuevo Producto'}</h2>
                <div style="transform: scale(1.5); margin: 20px 0;">
                    ${svg || 'Guarda el producto primero'}
                </div>
                <p style="margin-top:0; font-family:monospace;">${barcode}</p>
                <script>window.print(); window.close();</script>
            </body>
            </html>
        `);
        printWindow.document.close();
    }
  };

  const generateRandomBarcode = () => {
      const code = Math.floor(100000000000 + Math.random() * 900000000000).toString();
      setBarcode(code);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-[1600px] space-y-6 md:space-y-8 pb-20">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-200 pb-4 md:pb-6 gap-4">
        <div>
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 flex flex-wrap items-center gap-2">
                {product ? 'Editar Producto' : 'Nuevo Producto'}
                <span className={cn("text-xs px-2 py-1 rounded-md bg-slate-100 uppercase font-extrabold tracking-wide", brandTextClass)}>
                    {isFestamas ? 'Festamas' : 'FiestasYa'}
                </span>
            </h2>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
            <Button type="button" variant="outline" onClick={() => router.back()} disabled={loading} className="flex-1 md:flex-none">
                Cancelar
            </Button>
            <Button type="submit" className={cn("text-white flex-1 md:flex-none min-w-[140px]", isFestamas ? "bg-festamas-primary hover:bg-festamas-primary/90" : "bg-fiestasya-accent hover:bg-fiestasya-accent/90")} disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Guardar
            </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 md:gap-8">
        
        {/* COLUMNA IZQUIERDA */}
        <div className="xl:col-span-8 space-y-6">
            
            {/* 1. INFORMACIÓN BÁSICA + CÓDIGO DE BARRAS */}
            <div className="bg-white p-4 md:p-6 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                        <Info className="h-4 w-4 text-slate-400" /> Información Básica
                    </h3>
                    {product && barcode && (
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-400 hidden sm:inline">Etiqueta:</span>
                            <BarcodeControl 
                                barcode={barcode} 
                                title={product.title} 
                                price={Number(product.price)}
                                variant="outline"
                                className="h-9 w-9 border-slate-200"
                            />
                        </div>
                    )}
                </div>
                
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">Nombre del Producto</Label>
                        <Input id="title" name="title" defaultValue={product?.title} required className={brandFocusClass} />
                    </div>

                    {/* SECCIÓN CÓDIGO DE BARRAS */}
                    <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 flex flex-col md:flex-row gap-6 items-center">
                        <div className="flex-1 w-full space-y-2">
                            <Label htmlFor="barcode" className="flex items-center gap-2">
                                <ScanBarcode className="h-4 w-4" /> Código de Barras (EAN/UPC)
                            </Label>
                            <div className="flex gap-2">
                                <Input 
                                    id="barcode" 
                                    name="barcode" 
                                    value={barcode} 
                                    onChange={(e) => setBarcode(e.target.value)}
                                    placeholder="Generar o escanear..." 
                                    className="font-mono tracking-widest bg-white"
                                />
                                <Button type="button" variant="outline" onClick={generateRandomBarcode} title="Generar Aleatorio">
                                    Generar
                                </Button>
                            </div>
                            <p className="text-xs text-slate-400">Déjalo vacío para autogenerar al guardar.</p>
                        </div>
                        
                        {/* VISTA PREVIA DEL CÓDIGO */}
                        <div className="flex-shrink-0 bg-white p-2 rounded border border-slate-200 min-h-[80px] flex items-center justify-center">
                            {barcode ? (
                                <div id="barcode-container">
                                    {/* Componente React-Barcode. Usamos ID para buscar el SVG al imprimir */}
                                    <Barcode value={barcode} width={1.5} height={40} fontSize={14} format="CODE128" />
                                    {/* Truco: Asignamos ID al SVG renderizado via prop renderer si fuera posible, 
                                        pero react-barcode renderiza directo. 
                                        Para imprimir, buscaremos el svg dentro de este div. */}
                                </div>
                            ) : (
                                <span className="text-xs text-slate-300 italic">Vista previa</span>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="slug">Slug (URL)</Label>
                            <Input id="slug" name="slug" defaultValue={product?.slug} required className="font-mono text-sm bg-slate-50" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="categoryId">Categoría</Label>
                            <select 
                                id="categoryId" 
                                name="categoryId" 
                                className={cn("flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", brandFocusClass)}
                                defaultValue={product?.categoryId}
                                required
                            >
                                <option value="">Seleccionar Categoría...</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Descripción</Label>
                        <Textarea id="description" name="description" defaultValue={product?.description} required rows={6} className={brandFocusClass} />
                    </div>
                </div>
            </div>

            {/* RESTO DE LOS COMPONENTES (Precios, Variantes) IGUAL QUE ANTES... */}
            {/* ... (Copiar bloques de Precios y Variantes del mensaje anterior) ... */}
            <div className="bg-white p-4 md:p-6 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="font-bold text-base text-slate-900 mb-4 flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-slate-400" /> Estrategia de Precios
                </h3>
                {/* ... inputs de precio ... */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="price">Precio Regular (S/)</Label>
                        <Input type="number" id="price" name="price" defaultValue={String(product?.price || '')} required step="0.01" min="0" className={brandFocusClass} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="discountPercentage" className={brandTextClass + " font-semibold"}>Descuento (%)</Label>
                        <div className="relative">
                            <Percent className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                            <Input type="number" id="discountPercentage" name="discountPercentage" defaultValue={product?.discountPercentage || 0} min="0" max="100" className={`pl-9 ${brandFocusClass}`} />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="stock">Stock Disponible</Label>
                        <div className="relative">
                            <Layers className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                            <Input type="number" id="stock" name="stock" defaultValue={product?.stock || 0} required min="0" className={`pl-9 ${brandFocusClass}`} />
                        </div>
                    </div>
                </div>
                <div className="mt-6 p-4 bg-slate-50/50 rounded-lg border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="wholesalePrice" className="text-slate-600">Precio Mayorista (S/)</Label>
                        <Input type="number" id="wholesalePrice" name="wholesalePrice" defaultValue={product?.wholesalePrice ? String(product.wholesalePrice) : ''} step="0.01" min="0" className="bg-white" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="wholesaleMinCount" className="text-slate-600">Cantidad Mínima Mayorista</Label>
                        <Input type="number" id="wholesaleMinCount" name="wholesaleMinCount" defaultValue={product?.wholesaleMinCount || ''} min="1" className="bg-white" />
                    </div>
                </div>
            </div>

            <div className="bg-white p-4 md:p-6 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="font-bold text-base text-slate-900 mb-4 flex items-center gap-2">
                    <BoxSelect className="h-4 w-4 text-slate-400" /> Variantes y Agrupación
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="color" className="flex items-center gap-2">
                            <Palette className="h-4 w-4 text-slate-500" /> Color (Variante)
                        </Label>
                        <div className="flex gap-3">
                            <div className="relative shrink-0 overflow-hidden w-11 h-11 rounded-lg border border-slate-200 shadow-sm">
                                <input type="color" className="absolute -top-2 -left-2 w-[200%] h-[200%] p-0 cursor-pointer border-0 outline-none" value={color.startsWith('#') && color.length === 7 ? color : '#000000'} onChange={(e) => setColor(e.target.value)} />
                            </div>
                            <div className="flex-1">
                                <Input id="color" name="color" value={color} onChange={(e) => setColor(e.target.value)} placeholder="#RRGGBB" className={`${brandFocusClass} font-mono uppercase`} />
                            </div>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="groupTag" className="flex items-center gap-2">
                            <Tag className="h-4 w-4 text-slate-500" /> Group Tag (Agrupador)
                        </Label>
                        <Input id="groupTag" name="groupTag" defaultValue={product?.groupTag || ''} placeholder="Ej. CAMISETA-VERANO-2025" className="uppercase font-mono text-sm bg-slate-50" />
                    </div>
                </div>
            </div>
        </div>

        {/* COLUMNA DERECHA */}
        <div className="xl:col-span-4 space-y-6">
            <div className="bg-white p-4 md:p-6 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                        <Label className="text-base font-semibold">Estado del Producto</Label>
                        <p className="text-xs text-slate-500">¿Visible para los clientes?</p>
                    </div>
                    <Switch id="isAvailable" checked={isAvailable} onCheckedChange={setIsAvailable} className={isFestamas ? "data-[state=checked]:bg-festamas-primary" : "data-[state=checked]:bg-fiestasya-accent"} />
                </div>
            </div>
            <div className="bg-white p-4 md:p-6 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="font-bold text-base text-slate-900 mb-4">Galería de Imágenes</h3>
                <ImageUpload value={images} onChange={(urls) => setImages(urls)} />
            </div>
            <div className="bg-white p-4 md:p-6 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="font-bold text-base text-slate-900 mb-4">Etiquetas de Búsqueda</h3>
                <div className="space-y-2">
                    <Label htmlFor="tags">Tags (Separados por coma)</Label>
                    <Input id="tags" name="tags" defaultValue={product?.tags.join(', ')} placeholder="verano, niños, oferta" className={brandFocusClass} />
                </div>
            </div>
        </div>
      </div>
    </form>
  );
}