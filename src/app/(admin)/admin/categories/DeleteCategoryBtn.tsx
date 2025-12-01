'use client';

import { useState } from 'react';
import { Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { deleteCategory } from '@/actions/categories';
import { toast } from 'sonner';

export function DeleteCategoryBtn({ id }: { id: string }) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm('¿Seguro que quieres eliminar esta categoría?')) return;
    setLoading(true);
    const res = await deleteCategory(id);
    if (res.success) {
      toast.success('Categoría eliminada');
    } else {
      toast.error(res.message); // Aquí saldrá el error si tiene productos
    }
    setLoading(false);
  };

  return (
    <Button variant="ghost" size="icon" onClick={handleDelete} disabled={loading} className="text-red-500 hover:bg-red-50">
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
    </Button>
  );
}