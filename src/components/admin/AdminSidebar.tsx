'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Settings, 
  LogOut, 
  Tags, 
  Ticket, 
  Images,       
  Store,        
  Megaphone     
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { logout } from '@/actions/auth-actions';
import { AdminStoreSwitcher } from './AdminStoreSwitcher'; // 👈 Importamos nuestro switcher
import { Division } from '@prisma/client';

const navItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/orders', label: 'Pedidos', icon: ShoppingCart },
  { href: '/admin/products', label: 'Productos', icon: Package },
  { href: '/admin/categories', label: 'Categorías', icon: Tags },
  { href: '/admin/banners', label: 'Banners', icon: Images },
  { href: '/admin/sections', label: 'Secciones Home', icon: Store },
  { href: '/admin/coupons', label: 'Cupones', icon: Ticket },
  { href: '/admin/settings', label: 'Configuración', icon: Settings },
];

interface Props {
  currentDivision: Division; // Recibimos la división actual desde el server
}

export const AdminSidebar = ({ currentDivision }: Props) => {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-50 hidden w-64 flex-col border-r bg-slate-900 text-white md:flex">
      <div className="flex flex-col border-b border-slate-800 px-6 py-4 gap-4">
        <span className="text-xl font-bold tracking-tighter flex items-center gap-2">
          Festamas <span className="text-slate-400 font-normal text-sm">Admin</span>
        </span>
        
        {/* 🎛️ Aquí vive ahora el Switcher */}
        <AdminStoreSwitcher currentDivision={currentDivision} />
      </div>
      
      <nav className="flex-1 space-y-1 px-4 py-6 scrollbar-hide overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);

          return (
            <Link 
              key={item.href}
              href={item.href} 
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive 
                  ? "bg-slate-800 text-white" 
                  : "text-slate-400 hover:bg-slate-800 hover:text-slate-100"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-800 p-4">
        <Button 
          variant="ghost" 
          className="w-full justify-start gap-3 text-red-400 hover:bg-slate-800 hover:text-red-300"
          onClick={async () => await logout()}
        >
          <LogOut className="h-5 w-5" />
          Cerrar Sesión
        </Button>
      </div>
    </aside>
  );
}