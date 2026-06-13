'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Variant {
  id: string;
  name: string;
  sku: string | null;
  barcode: string | null;
  attributes: any;
  images: string[];
  stock: Array<{
    quantity: number;
    branch: { name: string };
  }>;
}

interface Props {
  variants: Variant[];
  erpUrl?: string;
}

export function VariantManager({ variants, erpUrl }: Props) {
  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="text-base text-slate-900">Variantes del Producto</CardTitle>
            <CardDescription className="text-[11px] mt-0.5">
              Solo lectura — gestionado desde el ERP Zaiko
            </CardDescription>
          </div>
          {erpUrl && (
            <a
              href={erpUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0 flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 font-medium bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg border border-blue-100 transition-colors"
            >
              <ExternalLink className="w-3 h-3" />
              Gestionar en ERP
            </a>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-2.5">
        {variants.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <p className="text-sm">Sin variantes registradas</p>
            <p className="text-xs mt-1">Crea las variantes desde el ERP Zaiko</p>
          </div>
        ) : (
          variants.map((variant) => {
            const totalStock = variant.stock.reduce((sum, st) => sum + st.quantity, 0);
            const attributes = (variant.attributes as Record<string, string>) || {};

            return (
              <div
                key={variant.id}
                className="p-3.5 bg-slate-50 rounded-xl border border-slate-200"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">{variant.name}</p>
                    {Object.keys(attributes).length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {Object.entries(attributes).map(([key, value]) => (
                          <Badge key={key} variant="secondary" className="text-[10px] px-1.5 py-0">
                            {key}: {value}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  <span className={cn(
                    'flex-shrink-0 ml-3 text-sm font-bold',
                    totalStock > 5 ? 'text-emerald-600' : totalStock > 0 ? 'text-amber-600' : 'text-red-500'
                  )}>
                    {totalStock} u.
                  </span>
                </div>

                <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-slate-500">
                  {variant.sku && <span>SKU: <span className="font-mono text-slate-700">{variant.sku}</span></span>}
                  {variant.barcode && <span>Cód: <span className="font-mono text-slate-700">{variant.barcode}</span></span>}
                </div>

                {variant.stock.length > 1 && (
                  <div className="mt-2 pt-2 border-t border-slate-200 grid grid-cols-2 gap-x-3 gap-y-0.5">
                    {variant.stock.map((st, idx) => (
                      <div key={idx} className="flex justify-between text-[11px] text-slate-500">
                        <span className="truncate">{st.branch.name}</span>
                        <span className="font-semibold text-slate-700 ml-1">{st.quantity}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
