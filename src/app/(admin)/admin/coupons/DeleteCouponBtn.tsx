'use client';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { deleteCoupon } from '@/actions/coupon';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export function DeleteCouponBtn({ id }: { id: string }) {
  const router = useRouter();
  const handleDelete = async () => {
    if(!confirm("¿Eliminar cupón?")) return;
    await deleteCoupon(id);
    toast.success("Cupón eliminado");
    router.refresh();
  };
  return (
    <Button variant="ghost" size="icon" onClick={handleDelete} className="text-red-500 hover:bg-red-50">
      <Trash2 className="h-4 w-4" />
    </Button>
  );
}