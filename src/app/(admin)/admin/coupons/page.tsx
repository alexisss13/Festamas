import Link from 'next/link';
import { Plus, Calendar, Users, Store } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { getCoupons } from '@/actions/coupon';
import { DeleteCouponBtn } from './DeleteCouponBtn';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';

export default async function CouponsPage() {
  const coupons = await getCoupons();

  return (
    <div className="p-4 md:p-8 w-full max-w-7xl mx-auto animate-in fade-in duration-500">
      <div className="mb-6 flex items-center justify-between">
        <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
                Cupones de Descuento
            </h1>
            <p className="text-slate-500 text-sm mt-1">Administra las campañas promocionales</p>
        </div>
        <Button asChild className="bg-slate-900 hover:bg-slate-800 shadow-md">
          <Link href="/admin/coupons/new">
            <Plus className="mr-2 h-4 w-4" /> Nuevo Cupón
          </Link>
        </Button>
      </div>

      <div className="rounded-lg border bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead>Código</TableHead>
              <TableHead>Tienda</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Límites (Usos)</TableHead>
              <TableHead>Expiración</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {coupons.map((coupon) => (
              <TableRow key={coupon.id}>
                <TableCell className="font-mono font-bold text-lg text-slate-900">
                    {coupon.code}
                </TableCell>
                <TableCell>
                    <Badge variant="outline" className={cn(
                        "font-normal",
                        coupon.division === 'JUGUETERIA' ? "bg-festamas-primary/10 text-festamas-primary border-festamas-primary/20" : "bg-fiestasya-accent/10 text-fiestasya-accent border-fiestasya-accent/20"
                    )}>
                        {coupon.division === 'JUGUETERIA' ? 'Festamas' : 'FiestasYa'}
                    </Badge>
                </TableCell>
                <TableCell>
                    <div className="font-semibold">
                    {coupon.type === 'FIXED' ? `S/ ${coupon.discount.toFixed(2)}` : `${coupon.discount}% OFF`}
                    </div>
                </TableCell>
                <TableCell>
                    <div className="flex items-center gap-1 text-sm text-slate-600">
                        <Users className="h-3 w-3" />
                        {coupon.maxUses ? (
                            <span>
                                <span className="font-bold">{coupon.currentUses}</span> / {coupon.maxUses}
                            </span>
                        ) : (
                            <span>{coupon.currentUses} (∞)</span>
                        )}
                    </div>
                </TableCell>
                <TableCell>
                    <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-3 w-3 text-slate-400" />
                        {coupon.expirationDate ? (
                             <span className={cn(
                                new Date() > new Date(coupon.expirationDate) ? "text-red-500 font-bold" : "text-slate-600"
                             )}>
                                {format(new Date(coupon.expirationDate), "dd MMM yyyy", { locale: es })}
                             </span>
                        ) : (
                            <span className="text-slate-400 italic">Nunca</span>
                        )}
                    </div>
                </TableCell>
                <TableCell className="text-right">
                    <DeleteCouponBtn id={coupon.id} />
                </TableCell>
              </TableRow>
            ))}
            {coupons.length === 0 && (
                <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center text-slate-500">
                        No tienes cupones activos. ¡Crea uno para impulsar ventas!
                    </TableCell>
                </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}