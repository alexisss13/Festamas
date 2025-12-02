import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { getCoupons } from '@/actions/coupon';
import { DeleteCouponBtn } from './DeleteCouponBtn';

export default async function CouponsPage() {
  const coupons = await getCoupons();

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
            Cupones
        </h1>
        <Button asChild className="bg-slate-900 hover:bg-slate-800">
          <Link href="/admin/coupons/new">
            <Plus className="mr-2 h-4 w-4" /> Nuevo
          </Link>
        </Button>
      </div>

      <div className="rounded-md border bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Código</TableHead>
              <TableHead>Descuento</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {coupons.map((coupon) => (
              <TableRow key={coupon.id}>
                <TableCell className="font-mono font-bold text-slate-900">
                    {coupon.code}
                </TableCell>
                <TableCell>
                    {coupon.type === 'FIXED' ? `S/ ${coupon.discount}` : `${coupon.discount}%`}
                </TableCell>
                <TableCell>
                    <Badge variant="outline">{coupon.type === 'FIXED' ? 'Monto Fijo' : 'Porcentaje'}</Badge>
                </TableCell>
                <TableCell className="text-right">
                    <DeleteCouponBtn id={coupon.id} />
                </TableCell>
              </TableRow>
            ))}
            {coupons.length === 0 && (
                <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center text-slate-500">
                        No hay cupones creados.
                    </TableCell>
                </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}