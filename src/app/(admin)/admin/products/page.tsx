import Link from 'next/link';
import Image from 'next/image';
import { Plus, Pencil, Package, Layers, Users, Tag as TagIcon, TrendingDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getProducts } from '@/actions/products';
import { DeleteProductBtn } from './DeleteProductBtn';
import { getAdminDivision } from '@/actions/admin-settings';
import { cn, formatCurrency } from '@/lib/utils';

/**
 * Página de administración de productos con vista de tarjetas enriquecidas.
 * Filtra automáticamente por la división seleccionada en el switcher.
 */
export default async function AdminProductsPage() {
  // 🍪 Obtenemos la tienda activa desde las cookies del admin
  const selectedDivision = await getAdminDivision();
  
  // 🔍 Cargamos productos filtrados por división incluyendo archivados
  const { data: products } = await getProducts({ 
    includeInactive: true,
    division: selectedDivision 
  });
  
  const isFestamas = selectedDivision === 'JUGUETERIA';

  return (
    <div className="p-8 w-full max-w-7xl mx-auto">
      {/* HEADER DE PÁGINA */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Inventario de Productos</h1>
          <p className="text-sm text-slate-500 mt-1">
            Gestionando catálogo de: <span className={cn(
              "font-bold px-2 py-0.5 rounded-md text-xs uppercase",
              isFestamas ? "bg-festamas-primary/10 text-festamas-primary" : "bg-fiestasya-accent/10 text-fiestasya-accent"
            )}>{selectedDivision}</span>
          </p>
        </div>
        
        <Button asChild variant="outline" className="bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 shadow-sm h-11 px-6 transition-all">
          <Link href="/admin/products/new">
            <Plus className="mr-2 h-5 w-5 text-slate-400" />
            <span className="font-semibold">Nuevo Producto</span>
          </Link>
        </Button>
      </div>

      {/* LISTADO DE PRODUCTOS (CARDS HORIZONTALES) */}
      <div className="space-y-4">
        {products?.map((product) => (
          <div 
            key={product.id} 
            className={cn(
              "group relative flex flex-col md:flex-row gap-6 p-5 bg-white rounded-2xl border border-slate-200 hover:border-slate-300 hover:shadow-lg transition-all duration-300",
              !product.isAvailable && "opacity-60 grayscale-[0.5] bg-slate-50"
            )}
          >
            {/* 🖼️ IMAGEN PRINCIPAL CON BADGE DE DESCUENTO DE MARCA */}
            <div className="relative h-40 w-full md:w-40 rounded-xl overflow-hidden border border-slate-100 bg-slate-50 shrink-0">
              {product.images[0] ? (
                <Image 
                  src={product.images[0]} 
                  alt={product.title} 
                  fill 
                  className="object-cover group-hover:scale-105 transition-transform duration-500" 
                />
              ) : (
                <div className="flex items-center justify-center h-full text-slate-300">
                  <Package className="h-10 w-10 opacity-20" />
                </div>
              )}
              
              {/* ✨ BADGE DE DESCUENTO CON COLOR DE TIENDA */}
              {product.discountPercentage > 0 && product.isAvailable && (
                <div className={cn(
                  "absolute top-2 left-2 text-white text-[10px] font-black px-2 py-1 rounded-lg shadow-lg flex items-center gap-1 animate-in zoom-in duration-300",
                  isFestamas ? "bg-festamas-primary" : "bg-fiestasya-accent"
                )}>
                  <TrendingDown className="h-3 w-3" />
                  {product.discountPercentage}% OFF
                </div>
              )}

              {!product.isAvailable && (
                <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center backdrop-blur-[1px]">
                  <span className="text-white text-[10px] font-bold uppercase tracking-widest">Archivado</span>
                </div>
              )}
            </div>

            {/* 📝 CONTENIDO CENTRAL (INFO) */}
            <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
              <div>
                <div className="flex items-center gap-2 mb-1">
                   <Badge variant="outline" className="text-[10px] font-bold text-slate-400 border-slate-200 bg-white">
                     SKU: {product.slug.slice(0,8).toUpperCase()}
                   </Badge>
                   <Badge className={cn(
                      "text-[10px] font-bold border-none",
                      isFestamas ? "bg-festamas-primary/10 text-festamas-primary" : "bg-fiestasya-accent/10 text-fiestasya-accent"
                   )}>
                     {product.category?.name || 'Sin Categoría'}
                   </Badge>
                </div>
                <h2 className="text-xl font-bold text-slate-900 truncate transition-colors">
                  {product.title}
                </h2>
                
                {/* LISTA DE TAGS */}
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {product.tags.map(tag => (
                    <span key={tag} className="flex items-center gap-1 text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200/50">
                      <TagIcon className="h-3 w-3" /> {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* MÉTRICAS DE STOCK Y MAYOREO */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-slate-50 rounded-lg text-slate-400 border border-slate-100">
                    <Layers className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-bold leading-none mb-1">Stock</p>
                    <p className={cn("font-bold text-sm", (product.stock || 0) < 5 ? "text-red-500" : "text-slate-700")}>
                      {product.stock || 0} unid.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-slate-50 rounded-lg text-slate-400 border border-slate-100">
                    <Users className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-bold leading-none mb-1">Mayoreo</p>
                    <p className="font-bold text-sm text-slate-700">
                      {product.wholesalePrice > 0 ? formatCurrency(product.wholesalePrice) : '---'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 💰 ACCIONES Y PRECIOS */}
            <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-4 md:pl-6 md:border-l border-slate-100 shrink-0 min-w-[140px]">
              <div className="text-right">
                <p className="text-[10px] text-slate-400 uppercase font-extrabold tracking-widest mb-0.5">Precio Venta</p>
                
                {/* PRECIO TACHADO (ORIGINAL) */}
                {product.discountPercentage > 0 && (
                   <p className="text-xs text-slate-400 line-through font-medium opacity-70">
                      {formatCurrency(product.price)}
                   </p>
                )}
                
                {/* PRECIO FINAL (CON DESCUENTO) */}
                <p className={cn(
                  "text-3xl font-black tracking-tight",
                  isFestamas ? "text-festamas-primary" : "text-fiestasya-accent"
                )}>
                  {formatCurrency(product.price * (1 - product.discountPercentage / 100))}
                </p>
              </div>
              
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" asChild className="h-10 w-10 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-xl border border-transparent hover:border-slate-200 transition-all">
                  <Link href={`/admin/products/${product.slug}`}>
                    <Pencil className="h-5 w-5" />
                  </Link>
                </Button>
                {product.isAvailable && <DeleteProductBtn id={product.id} />}
              </div>
            </div>
          </div>
        ))}
        
        {(!products || products.length === 0) && (
            <div className="py-20 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                <Package className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500 font-medium">No se encontraron productos.</p>
                <p className="text-xs text-slate-400">Intenta cambiar de tienda o crear uno nuevo.</p>
            </div>
        )}
      </div>
    </div>
  );
}