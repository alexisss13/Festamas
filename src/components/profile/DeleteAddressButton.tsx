'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Trash2, Loader2 } from 'lucide-react';
import { deleteUserAddress } from '@/actions/address';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface DeleteAddressButtonProps {
  addressId: string;
}

export function DeleteAddressButton({ addressId }: DeleteAddressButtonProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm('¿Estás seguro de eliminar esta dirección?')) return;
    
    setIsDeleting(true);
    const result = await deleteUserAddress(addressId);
    
    if (result.ok) {
      toast.success(result.message);
      router.refresh();
    } else {
      toast.error(result.message);
    }
    
    setIsDeleting(false);
  };

  return (
    <Button
      variant="outline"
      size="sm"
      className="h-9 w-9 p-0 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
      onClick={handleDelete}
      disabled={isDeleting}
    >
      {isDeleting ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : (
        <Trash2 className="w-3.5 h-3.5" />
      )}
    </Button>
  );
}
