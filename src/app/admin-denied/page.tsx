import Link from 'next/link';
import { ShieldX, ArrowLeft } from 'lucide-react';

export default function AdminDeniedPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="flex justify-center mb-6">
          <div className="h-20 w-20 rounded-full bg-red-50 border border-red-100 flex items-center justify-center">
            <ShieldX className="h-10 w-10 text-red-400" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-slate-900 mb-2">Acceso restringido</h1>
        <p className="text-slate-500 text-sm mb-6 leading-relaxed">
          No tienes permiso para acceder al panel de administración del ecommerce.
          <br />
          Contacta a un <strong>Owner</strong> o <strong>Super Admin</strong> para que te otorgue
          el permiso <code className="text-xs bg-slate-100 px-1.5 py-0.5 rounded font-mono">ecommerce_admin</code> desde el ERP Zaiko.
        </p>

        <div className="flex flex-col gap-2">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-white text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver a la tienda
          </Link>
          <Link
            href="/auth/login"
            className="text-sm text-slate-400 hover:text-slate-600 transition-colors"
          >
            Iniciar sesión con otra cuenta
          </Link>
        </div>
      </div>
    </div>
  );
}
