import Link from 'next/link';
import { Plus, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { getCategories } from '@/actions/categories';
import { DeleteCategoryBtn } from './DeleteCategoryBtn';

export default async function CategoriesPage() {
  // Obtenemos las categorías (incluyendo el conteo de productos)
  const { data: categories } = await getCategories();

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-900">Categorías</h1>
        <Button asChild className="bg-slate-900 hover:bg-slate-800">
          <Link href="/admin/categories/new">
            <Plus className="mr-2 h-4 w-4" /> Nueva
          </Link>
        </Button>
      </div>

      <div className="rounded-md border bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Tienda</TableHead>
              <TableHead className="text-center">Productos</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories?.map((cat) => (
              <TableRow key={cat.id}>
                <TableCell className="font-medium flex items-center gap-2">
                    {/* Si tiene imagen, podrías mostrar una miniatura aquí si quisieras */}
                    {cat.name}
                </TableCell>
                <TableCell className="text-slate-500 font-mono text-sm">{cat.slug}</TableCell>
                <TableCell>
                    <Badge variant="outline" className={cat.division === 'JUGUETERIA' ? 'text-pink-600 border-pink-200 bg-pink-50' : 'text-purple-600 border-purple-200 bg-purple-50'}>
                        {cat.division === 'JUGUETERIA' ? 'Festamas' : 'FiestasYa'}
                    </Badge>
                </TableCell>
                <TableCell className="text-center">
                  {/* 🛡️ FIX: Acceso seguro a _count */}
                  <Badge variant="secondary">{cat._count?.products || 0}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/admin/categories/${cat.id}`}>
                        <Pencil className="h-4 w-4 text-slate-500" />
                      </Link>
                    </Button>
                    <DeleteCategoryBtn id={cat.id} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {(!categories || categories.length === 0) && (
                <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                        No hay categorías creadas.
                    </TableCell>
                </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}