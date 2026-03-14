import Link from 'next/link';
import Image from 'next/image';
import prisma from '@/lib/prisma';
import { Plus, Pencil, Package, Layers, Users, Tag as TagIcon, TrendingDown, FileSpreadsheet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getProducts } from '@/actions/products';
import { DeleteProductBtn } from './DeleteProductBtn';
import { getAdminDivision } from '@/actions/admin-settings';
import { cn, formatCurrency } from '@/lib/utils';
import { AdminProductToolbar } from '@/components/admin/AdminProductToolbar';
import { PaginationControls } from '@/components/ui/pagination-controls';
import { BarcodeControl } from '@/components/admin/BarcodeControl';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface Props {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function AdminProductsPage({ searchParams }: Props) {
  const selectedDivision = await getAdminDivision();
  const params = await searchParams;

  // 📥 Parseo de Filtros
  const page = Number(params.page) || 1;
  const query = params.q as string || '';
  const categoryId = params.category as string || undefined;
  const sort = params.sort as string || 'newest';

  // 🔍 Fetch Data (Server Action)
  const { data: products, meta } = await getProducts({ 
    includeInactive: true,
    division: selectedDivision,
    page,
    take: 12,
    query,
    categoryId,
    sort
  });

  // Traer categorías para el filtro del toolbar
  const categories = await prisma.category.findMany({
    where: { division: selectedDivision },
    orderBy: { name: 'asc' }
  });
  
  const isFestamas = selectedDivision === 'JUGUETERIA';

  return (
    <div className="p-4 md:p-8 w-full max-w-7xl mx-auto">
      
      {/* HEADER + ACCIONES */}
      <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">Inventario</h1>
          <p className="text-sm text-slate-500 mt-1">
            Gestión: <span className={cn(
              "font-bold px-2 py-0.5 rounded-md text-xs uppercase",
              isFestamas ? "bg-festamas-primary/10 text-festamas-primary" : "bg-fiestasya-accent/10 text-fiestasya-accent"
            )}>{selectedDivision}</span>
          </p>
        </div>
        
        <div className="flex gap-2 w-full md:w-auto">
            {/* ⚡ BOTÓN CARGA RÁPIDA (Bulk) */}
            <Button asChild variant="secondary" className="flex-1 md:flex-none bg-slate-100 hover:bg-slate-200 text-slate-700 shadow-sm h-11 border border-slate-200">
                <Link href="/admin/products/bulk">
                    {/* 👇 Icono Spreadsheet (Hoja de cálculo) = Profesional */}
                    <FileSpreadsheet className="mr-2 h-4 w-4 text-slate-500" />
                    <span className="font-semibold">Carga Masiva</span>
                </Link>
            </Button>

            {/* + BOTÓN NUEVO */}
            <Button asChild className={cn("flex-1 md:flex-none text-white h-11 shadow-md", isFestamas ? "bg-festamas-primary hover:bg-festamas-primary/90" : "bg-fiestasya-accent hover:bg-fiestasya-accent/90")}>
                <Link href="/admin/products/new">
                    <Plus className="mr-2 h-5 w-5" />
                    <span className="font-semibold">Nuevo</span>
                </Link>
            </Button>
        </div>
      </div>

      {/* 🎛️ TOOLBAR (Buscador y Filtros) */}
      <AdminProductToolbar categories={categories} />

      {/* TABLA DE PRODUCTOS */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm min-h-[400px]">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50 border-b border-slate-200 hover:bg-slate-50">
              <TableHead className="w-[80px]">Imagen</TableHead>
              <TableHead>Producto</TableHead>
              <TableHead className="text-center">Stock</TableHead>
              <TableHead className="text-right">Mayorista</TableHead>
              <TableHead className="text-right">Precio</TableHead>
              <TableHead className="text-right pr-4">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products?.map((product) => (
              <TableRow 
                key={product.id} 
                className={cn(
                  "group transition-all hover:bg-slate-50",
                  !product.isAvailable && "opacity-60 bg-slate-50/50"
                )}
              >
                {/* IMAGEN */}
                <TableCell className="p-3 align-top">
                  <div className="relative h-16 w-16 rounded-lg overflow-hidden border border-slate-100 bg-white shrink-0">
                    {product.images[0] ? (
                      <Image src={product.images[0]} alt={product.title} fill className="object-cover" />
                    ) : (
                      <div className="flex items-center justify-center h-full text-slate-300">
                        <Package className="h-6 w-6 opacity-40" />
                      </div>
                    )}
                    {product.discountPercentage > 0 && product.isAvailable && (
                      <div className={cn("absolute bottom-0 left-0 w-full text-center text-white text-[9px] font-black py-0.5", isFestamas ? "bg-festamas-primary" : "bg-fiestasya-accent")}>
                        {product.discountPercentage}% OFF
                      </div>
                    )}
                  </div>
                </TableCell>

                {/* INFO (SKU, Categoria, Titulo, Tags) */}
                <TableCell className="p-3 align-top">
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2">
                       <Badge variant="outline" className="text-[10px] font-bold text-slate-400 border-slate-200 bg-white">SKU: {product.slug.slice(0,8).toUpperCase()}</Badge>
                       <Badge className={cn("text-[10px] font-bold border-none truncate max-w-[150px]", isFestamas ? "bg-festamas-primary/10 text-festamas-primary" : "bg-fiestasya-accent/10 text-fiestasya-accent")}>{product.category?.name || 'Sin Categoría'}</Badge>
                       {!product.isAvailable && <Badge variant="outline" className="text-[10px] font-bold text-red-500 border-red-200 bg-red-50">Archivado</Badge>}
                    </div>
                    <span className="text-sm font-bold text-slate-900 line-clamp-2 max-w-sm" title={product.title}>{product.title}</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {product.tags.map(tag => (
                        <span key={tag} className="flex items-center gap-1 text-[9px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200/50">
                          <TagIcon className="h-[10px] w-[10px]" /> {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </TableCell>

                {/* STOCK */}
                <TableCell className="p-3 align-middle text-center">
                  <span className={cn(
                    "font-bold text-sm", 
                    (product.stock || 0) < 5 ? "text-red-500" : "text-slate-700"
                  )}>
                    {product.stock || 0}
                  </span>
                </TableCell>

                {/* MAYORISTA */}
                <TableCell className="p-3 align-middle text-right">
                  <span className="font-semibold text-sm text-slate-600">
                    {product.wholesalePrice > 0 ? formatCurrency(Number(product.wholesalePrice)) : '-'}
                  </span>
                </TableCell>

                {/* PRECIO VENTA */}
                <TableCell className="p-3 align-middle text-right min-w-[100px]">
                  {product.discountPercentage > 0 && (
                    <span className="block text-[11px] text-slate-400 line-through font-medium mb-0.5">
                      {formatCurrency(Number(product.price))}
                    </span>
                  )}
                  <span className={cn(
                    "text-base font-black tracking-tight", 
                    isFestamas ? "text-festamas-primary" : "text-fiestasya-accent"
                  )}>
                    {formatCurrency(Number(product.price) * (1 - product.discountPercentage / 100))}
                  </span>
                </TableCell>

                {/* ACCIONES */}
                <TableCell className="p-3 align-middle pr-4">
                  <div className="flex items-center justify-end gap-1">
                    <BarcodeControl 
                        barcode={product.barcode} 
                        title={product.title} 
                        price={Number(product.price)}
                        wholesalePrice={Number(product.wholesalePrice)}
                        wholesaleMinCount={product.wholesaleMinCount}
                        discountPercentage={product.discountPercentage}
                        variant="ghost"
                        className="h-8 w-8 hover:bg-slate-100 rounded-lg"
                    />
                    <Button variant="ghost" size="icon" asChild className="h-8 w-8 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg">
                      <Link href={`/admin/products/${product.slug}`}><Pencil className="h-4 w-4" /></Link>
                    </Button>
                    {product.isAvailable && <div className="[&>button]:h-8 [&>button]:w-8"><DeleteProductBtn id={product.id} /></div>}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {(!products || products.length === 0) && (
            <div className="py-16 text-center bg-slate-50/50">
                <Package className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                <p className="text-sm text-slate-500 font-medium">No se encontraron productos.</p>
                <p className="text-xs text-slate-400 mt-1">
                    {query ? `Sin resultados para "${query}"` : 'Esta tienda está vacía.'}
                </p>
                {query && (
                    <Button variant="link" className="text-blue-500 mt-2 text-sm" asChild>
                        <Link href="/admin/products">Limpiar filtros</Link>
                    </Button>
                )}
            </div>
        )}
      </div>

      {/* 🔄 PAGINACIÓN */}
      <PaginationControls 
        totalPages={meta?.totalPages || 1} 
        currentPage={meta?.page || 1} 
        hasNext={meta?.hasNextPage || false}
        hasPrev={meta?.hasPrevPage || false}
      />
    </div>
  );
}