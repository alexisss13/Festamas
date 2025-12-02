import Link from 'next/link';
import Image from 'next/image';
import { Plus, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { getProducts } from '@/actions/products';
import { DeleteProductBtn } from './DeleteProductBtn';

export default async function AdminProductsPage() {
  // Pedimos TAMBIÉN los inactivos
  const { data: products } = await getProducts({ includeInactive: true });

  const formatPrice = (value: number) =>
    new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
    }).format(value);

  return (
    <div className="p-8 w-full">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-900">Productos</h1>
        
        <Button asChild className="bg-slate-900 hover:bg-slate-800">
          <Link href="/admin/products/new">
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Producto
          </Link>
        </Button>
      </div>

      <div className="rounded-md border bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50">
              <TableHead className="w-20">Imagen</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Precio</TableHead>
              <TableHead className="text-right">Stock</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products?.map((product) => (
              <TableRow key={product.id} className={!product.isAvailable ? 'bg-slate-50 opacity-60' : ''}>
                <TableCell>
                  <div className="relative h-12 w-12 overflow-hidden rounded-md border bg-slate-100">
                    {product.images[0] ? (
                        <Image
                            src={product.images[0]}
                            alt={product.title}
                            fill
                            className="object-cover"
                        />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center text-[10px] text-slate-400">
                            N/A
                        </div>
                    )}
                  </div>
                </TableCell>
                <TableCell className="font-medium text-slate-900">
                    {product.title}
                </TableCell>
                <TableCell>
                    {product.isAvailable ? (
                        <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
                            Activo
                        </Badge>
                    ) : (
                        <Badge variant="secondary" className="text-slate-500">
                            Archivado
                        </Badge>
                    )}
                </TableCell>
                <TableCell className="text-right font-mono font-medium">
                    {formatPrice(product.price)}
                </TableCell>
                <TableCell className="text-right text-slate-500">
                    {product.stock || 0}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" asChild className="text-slate-500 hover:text-slate-900">
                        <Link href={`/admin/products/${product.slug}`}>
                            <Pencil className="h-4 w-4" />
                        </Link>
                    </Button>
                    
                    {product.isAvailable && (
                        <DeleteProductBtn id={product.id} />
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}