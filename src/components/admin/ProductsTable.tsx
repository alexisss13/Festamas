'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import cloudinaryLoader from '@/lib/cloudinaryLoader';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Edit, Search, Package, Globe, Monitor, Store, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const PAGE_SIZE = 20;

type Channel = 'POS' | 'ECOMMERCE' | 'BOTH';

interface Product {
  id: string;
  title: string;
  slug: string;
  basePrice: number;
  images: string[];
  isAvailable: boolean;
  availableChannels: Channel;
  discountPercentage: number;
  tags: string[];
  groupTag: string | null;
  category: { name: string } | null;
  supplier: { name: string } | null;
  variants: Array<{
    id: string;
    name: string;
    sku: string | null;
    barcode: string | null;
    stock: Array<{ quantity: number; branch: { name: string } }>;
  }>;
}

const CHANNEL_CONFIG: Record<Channel, { label: string; icon: any; className: string }> = {
  BOTH:      { label: 'Ambos',      icon: Globe,   className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  ECOMMERCE: { label: 'Solo Web',   icon: Monitor, className: 'bg-blue-50 text-blue-700 border-blue-200' },
  POS:       { label: 'Solo POS',   icon: Store,   className: 'bg-slate-100 text-slate-500 border-slate-200' },
};

function ChannelBadge({ channel }: { channel: Channel }) {
  const cfg = CHANNEL_CONFIG[channel] ?? CHANNEL_CONFIG.POS;
  const Icon = cfg.icon;
  return (
    <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border', cfg.className)}>
      <Icon className="h-3 w-3" />
      {cfg.label}
    </span>
  );
}

export function ProductsTable({ products, total, page, pageSize = PAGE_SIZE, initialSearch = '', initialChannel = 'ALL' }: { products: Product[]; total: number; page: number; pageSize?: number; initialSearch?: string; initialChannel?: 'ALL' | Channel }) {
  const router = useRouter();
  const [search, setSearch] = useState(initialSearch);
  const [channelFilter, setChannelFilter] = useState<'ALL' | Channel>(initialChannel);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);
  const paginated = products;

  const navigate = (next: { page?: number; search?: string; channel?: string }) => {
    const params = new URLSearchParams();
    const nextSearch = next.search ?? search;
    const nextChannel = next.channel ?? channelFilter;
    const nextPage = next.page ?? 1;
    if (nextSearch.trim()) params.set('search', nextSearch.trim());
    if (nextChannel !== 'ALL') params.set('channel', nextChannel);
    if (nextPage > 1) params.set('page', String(nextPage));
    router.push(`/admin/products${params.toString() ? `?${params.toString()}` : ''}`);
  };

  const totalStock = (product: Product) =>
    product.variants.reduce((sum, v) => sum + v.stock.reduce((s, st) => s + st.quantity, 0), 0);

  return (
    <div className="space-y-4">
      {/* Filters row */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Buscar por nombre, categoría, tag, SKU…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') navigate({ search: (e.target as HTMLInputElement).value }); }}
            className="pl-10 h-9"
          />
        </div>

        {/* Channel quick filters */}
        <div className="flex items-center gap-2 flex-wrap">
          {(['ALL', 'BOTH', 'ECOMMERCE', 'POS'] as const).map(ch => (
            <button
              key={ch}
              onClick={() => { setChannelFilter(ch); navigate({ channel: ch, page: 1 }); }}
              className={cn(
                'px-3 py-1.5 rounded-full text-xs font-medium border transition-colors',
                channelFilter === ch
                  ? 'bg-primary text-white border-primary'
                  : 'border-slate-200 text-slate-600 hover:border-slate-400 bg-white',
              )}
            >
              {ch === 'ALL' ? 'Todos' : ch === 'BOTH' ? 'Ambos' : ch === 'ECOMMERCE' ? 'Solo Web' : 'Solo POS'}
            </button>
          ))}
          <span className="text-xs text-slate-400 ml-1">{total} productos</span>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm" id="products-table-top">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60">
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wide w-12">#</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Producto</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Canal</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Precio</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Tags</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Stock</th>
                <th className="px-4 py-3 text-right text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {paginated.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <Package className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                    <p className="text-sm text-slate-400">No se encontraron productos</p>
                  </td>
                </tr>
              )}
              {paginated.map((product, idx) => {
                const globalIdx = (safePage - 1) * pageSize + idx;
                const stock = totalStock(product);
                const isPosOnly = product.availableChannels === 'POS';

                return (
                  <tr
                    key={product.id}
                    className={cn(
                      'hover:bg-slate-50/60 transition-colors',
                      isPosOnly && 'opacity-60',
                    )}
                  >
                    {/* Index */}
                    <td className="px-4 py-3 text-xs text-slate-400 tabular-nums">{globalIdx + 1}</td>

                    {/* Product */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="relative h-11 w-11 rounded-lg border border-slate-100 bg-slate-50 flex-shrink-0 overflow-hidden">
                          {product.images[0] ? (
                            <Image
                              loader={cloudinaryLoader}
                              src={product.images[0]}
                              alt={product.title}
                              fill
                              className="object-cover"
                              sizes="44px"
                            />
                          ) : (
                            <Package className="absolute inset-0 m-auto h-5 w-5 text-slate-300" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-slate-900 text-sm truncate max-w-[200px]">{product.title}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            {product.category && (
                              <span className="text-[11px] text-slate-400">{product.category.name}</span>
                            )}
                            {product.groupTag && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-violet-50 text-violet-600 border border-violet-100 font-medium">
                                {product.groupTag}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Channel + quick publish */}
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1.5 items-start">
                        <ChannelBadge channel={product.availableChannels} />
                      </div>
                    </td>

                    {/* Price + discount */}
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-semibold text-slate-800 text-sm">
                          S/ {product.basePrice.toFixed(2)}
                        </p>
                        {product.discountPercentage > 0 && (
                          <span className="text-[11px] font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded">
                            -{product.discountPercentage}%
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Tags */}
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1 max-w-[180px]">
                        {product.tags.slice(0, 4).map(tag => (
                          <span
                            key={tag}
                            className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 font-medium"
                          >
                            {tag}
                          </span>
                        ))}
                        {product.tags.length > 4 && (
                          <span className="text-[10px] text-slate-400">+{product.tags.length - 4}</span>
                        )}
                        {product.tags.length === 0 && (
                          <span className="text-[11px] text-slate-300 italic">Sin tags</span>
                        )}
                      </div>
                    </td>

                    {/* Stock */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <div className={cn('h-2 w-2 rounded-full flex-shrink-0', stock > 5 ? 'bg-emerald-400' : stock > 0 ? 'bg-yellow-400' : 'bg-red-400')} />
                        <span className="text-sm text-slate-700 tabular-nums font-medium">{stock}</span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3 text-right">
                      <Link href={`/admin/products/${product.id}`}>
                        <Button size="sm" variant="outline" className="h-8 gap-1.5 text-xs">
                          <Edit className="h-3.5 w-3.5" />
                          Editar
                        </Button>
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 bg-slate-50">
            <p className="text-xs text-slate-500">
              {total === 0 ? 0 : (safePage - 1) * pageSize + 1}–{Math.min(safePage * pageSize, total)} de {total} productos
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => navigate({ page: Math.max(1, safePage - 1) })}
                disabled={safePage === 1}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-white disabled:opacity-40 transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-xs font-semibold text-slate-600 px-2">{safePage} / {totalPages}</span>
              <button
                onClick={() => navigate({ page: Math.min(totalPages, safePage + 1) })}
                disabled={safePage === totalPages}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-white disabled:opacity-40 transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
