import Link from 'next/link';
import { SearchX } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 px-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
        <SearchX className="h-8 w-8 text-slate-400" strokeWidth={1.5} />
      </div>
      <h1 className="text-lg font-semibold text-slate-800">No encontramos esta página</h1>
      <p className="max-w-sm text-sm text-slate-500">
        El producto, pedido o enlace que buscas ya no existe o cambió de dirección.
      </p>
      <Link
        href="/"
        className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
      >
        Volver a la tienda
      </Link>
    </div>
  );
}
