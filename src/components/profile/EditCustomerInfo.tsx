'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Edit2 } from 'lucide-react';
import { updateCustomerInfo } from '@/actions/user';
import { useRouter } from 'next/navigation';

interface EditCustomerInfoProps {
  docType?: string | null;
  docNumber?: string | null;
  phone?: string | null;
  brandColor: string;
}

export function EditCustomerInfo({ docType, docNumber, phone, brandColor }: EditCustomerInfoProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    docType: docType || 'DNI',
    docNumber: docNumber || '',
    phone: phone || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const result = await updateCustomerInfo(formData);
    
    if (result.ok) {
      setOpen(false);
      router.refresh();
    } else {
      alert(result.message);
    }
    
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 w-8 p-0 hover:bg-slate-50"
        >
          <Edit2 className="w-3.5 h-3.5 text-slate-400" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-[18px] font-semibold">Editar Información Personal</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="docType" className="text-[13px]">Tipo de Documento</Label>
            <Select
              value={formData.docType}
              onValueChange={(value) => setFormData({ ...formData, docType: value })}
            >
              <SelectTrigger className="h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DNI">DNI</SelectItem>
                <SelectItem value="RUC">RUC</SelectItem>
                <SelectItem value="CE">Carnet de Extranjería</SelectItem>
                <SelectItem value="PASAPORTE">Pasaporte</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="docNumber" className="text-[13px]">Número de Documento</Label>
            <Input
              id="docNumber"
              type="text"
              value={formData.docNumber}
              onChange={(e) => setFormData({ ...formData, docNumber: e.target.value })}
              placeholder="Ej: 12345678"
              className="h-10"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="text-[13px]">Teléfono</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="Ej: 987654321"
              className="h-10"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1 h-10"
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1 h-10"
              style={{ backgroundColor: brandColor }}
              disabled={loading}
            >
              {loading ? 'Guardando...' : 'Guardar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
