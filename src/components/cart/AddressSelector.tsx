'use client';

import { useState } from 'react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { MapPin, Plus } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface Address {
  id: string;
  address: string;
  address2?: string | null;
  city: string;
  province?: string | null;
}

interface AddressSelectorProps {
  addresses: Address[];
  selectedAddressId: string | null;
  onSelectAddress: (addressId: string) => void;
  brandColor: string;
}

export function AddressSelector({ addresses, selectedAddressId, onSelectAddress, brandColor }: AddressSelectorProps) {
  if (addresses.length === 0) {
    return (
      <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-center">
        <MapPin className="w-8 h-8 text-slate-400 mx-auto mb-2" />
        <p className="text-sm text-slate-600 mb-3">No tienes direcciones guardadas</p>
        <Link href="/profile/address/new">
          <Button size="sm" className="gap-2" style={{ backgroundColor: brandColor }}>
            <Plus className="w-4 h-4" />
            Agregar Dirección
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <RadioGroup value={selectedAddressId || ''} onValueChange={onSelectAddress}>
        {addresses.map((address) => (
          <div
            key={address.id}
            className={cn(
              "flex items-start space-x-3 border p-4 rounded-lg cursor-pointer transition-all",
              selectedAddressId === address.id
                ? "border-slate-400 bg-slate-50 ring-2 ring-slate-200"
                : "border-slate-200 hover:bg-slate-50"
            )}
            onClick={() => onSelectAddress(address.id)}
          >
            <RadioGroupItem value={address.id} id={address.id} />
            <Label htmlFor={address.id} className="flex-1 cursor-pointer">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-slate-900">{address.address}</p>
                  {address.address2 && (
                    <p className="text-xs text-slate-500 mt-0.5">{address.address2}</p>
                  )}
                  <p className="text-xs text-slate-500 mt-1">
                    {address.city}{address.province ? `, ${address.province}` : ''} • Perú
                  </p>
                </div>
              </div>
            </Label>
          </div>
        ))}
      </RadioGroup>

      <Link href="/profile/address/new">
        <Button variant="outline" size="sm" className="w-full gap-2 border-dashed">
          <Plus className="w-4 h-4" />
          Agregar Nueva Dirección
        </Button>
      </Link>
    </div>
  );
}
