import Link from 'next/link';
import { LayoutDashboard, Package, ShoppingCart, Settings, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* SIDEBAR FIJO IZQUIERDA */}
      <aside className="fixed inset-y-0 left-0 z-50 hidden w-64 flex-col border-r bg-slate-900 text-white md:flex">
        <div className="flex h-16 items-center border-b border-slate-800 px-6">
          <span className="text-xl font-bold tracking-tighter">
            FiestasYa <span className="text-slate-400 font-normal text-sm">Admin</span>
          </span>
        </div>
        
        <nav className="flex-1 space-y-1 px-4 py-6">
          <Link href="/admin/dashboard" className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-slate-100 hover:bg-slate-800 transition-colors">
            <LayoutDashboard className="h-5 w-5" />
            Dashboard
          </Link>
          <Link href="/admin/orders" className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-slate-100 hover:bg-slate-800 transition-colors">
            <ShoppingCart className="h-5 w-5" />
            Pedidos
          </Link>
          <Link href="/admin/products" className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-slate-100 transition-colors">
            <Package className="h-5 w-5" />
            Productos
          </Link>
          <Link href="/admin/settings" className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-slate-100 transition-colors">
            <Settings className="h-5 w-5" />
            Configuración
          </Link>
        </nav>

        <div className="border-t border-slate-800 p-4">
          <Button variant="ghost" className="w-full justify-start gap-3 text-red-400 hover:bg-slate-800 hover:text-red-300">
            <LogOut className="h-5 w-5" />
            Cerrar Sesión
          </Button>
        </div>
      </aside>

      {/* CONTENIDO PRINCIPAL (Con margen a la izquierda para respetar el sidebar) */}
      <main className="flex-1 md:ml-64">
        {children}
      </main>
    </div>
  );
}