'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, ShoppingCart, Settings, LogOut, 
  Ticket, Images, Store, Menu, ChevronLeft, ChevronRight, BookOpen
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetHeader } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { logout } from '@/actions/auth-actions';
import { AdminStoreSwitcher } from './AdminStoreSwitcher';
import { Division } from '@prisma/client';

const storeNavItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/orders', label: 'Pedidos', icon: ShoppingCart },
  { href: '/admin/catalogs', label: 'Catálogos', icon: BookOpen },
  { href: '/admin/banners', label: 'Banners', icon: Images },
  { href: '/admin/sections', label: 'Secciones Home', icon: Store },
];

const globalNavItems = [
  { href: '/admin/coupons', label: 'Cupones', icon: Ticket },
  { href: '/admin/settings', label: 'Configuración', icon: Settings },
];

interface Props {
  currentDivision: Division;
}

export const AdminSidebar = ({ currentDivision }: Props) => {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Detectar si estamos en un módulo global
  const isGlobalModule = pathname.startsWith('/admin/coupons') || 
                         pathname.startsWith('/admin/settings');

  const brandName = currentDivision === 'JUGUETERIA' ? 'Festamas' : 'FiestasYa';

  useEffect(() => {
    const activeTheme = currentDivision === 'FIESTAS' ? 'fiestasya' : 'festamas';
    document.documentElement.setAttribute('data-theme', activeTheme);
    return () => document.documentElement.removeAttribute('data-theme');
  }, [currentDivision]);

  useEffect(() => {
    const mainContent = document.getElementById('admin-main-content');
    if (mainContent) {
      if (window.innerWidth >= 768) {
         mainContent.style.marginLeft = isCollapsed ? '80px' : '256px';
      } else {
         mainContent.style.marginLeft = '0px';
      }
    }
  }, [isCollapsed]);

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white text-slate-600">
      
      <div className={cn(
          "flex flex-col border-b px-4 py-4 gap-4 transition-all duration-300 border-slate-100", 
          isCollapsed ? "items-center" : ""
      )}>
        {!isCollapsed && (
            <span className="text-xl font-bold tracking-tighter flex items-center gap-2 text-slate-800 transition-colors px-2">
              {isGlobalModule ? (
                <>
                  Sistema
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 uppercase font-bold text-slate-600 tracking-wider">
                    Admin
                  </span>
                </>
              ) : (
                <>
                  {brandName} 
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 uppercase font-bold text-primary tracking-wider">
                    Admin
                  </span>
                </>
              )}
            </span>
        )}
        <AdminStoreSwitcher currentDivision={currentDivision} isCollapsed={isCollapsed} isGlobalModule={isGlobalModule} />
      </div>
      
      <nav className="flex-1 space-y-1 px-3 py-6 scrollbar-hide overflow-y-auto">
        {/* Módulos de Tienda */}
        {storeNavItems.map((item) => {
          const isActive = pathname.startsWith(item.href);

          return (
            <Link 
              key={item.href}
              href={item.href} 
              onClick={() => setIsMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 group relative",
                isCollapsed ? "justify-center" : "",
                isActive 
                  ? "bg-primary/10 text-primary font-bold" 
                  : "text-slate-500 hover:bg-primary/5 hover:text-primary"
              )}
              title={isCollapsed ? item.label : undefined}
            >
              <item.icon className={cn(
                  "h-5 w-5 transition-colors", 
                  isActive ? "text-primary" : "text-slate-400 group-hover:text-primary"
              )} />
              {!isCollapsed && <span>{item.label}</span>}
              {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full bg-primary" />
              )}
            </Link>
          );
        })}

        {/* Separador con etiqueta */}
        {!isCollapsed ? (
          <div className="pt-6 pb-2 px-3">
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Global
              </span>
              <div className="h-px flex-1 bg-slate-200" />
            </div>
          </div>
        ) : (
          <div className="my-4 mx-auto w-8 h-px bg-slate-300" />
        )}

        {/* Módulos Globales */}
        {globalNavItems.map((item) => {
          const isActive = pathname.startsWith(item.href);

          return (
            <Link 
              key={item.href}
              href={item.href} 
              onClick={() => setIsMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 group relative",
                isCollapsed ? "justify-center" : "",
                isActive 
                  ? "bg-slate-100 text-slate-900 font-bold" 
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              )}
              title={isCollapsed ? item.label : undefined}
            >
              <item.icon className={cn(
                  "h-5 w-5 transition-colors", 
                  isActive ? "text-slate-700" : "text-slate-400 group-hover:text-slate-700"
              )} />
              {!isCollapsed && <span>{item.label}</span>}
              {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full bg-slate-700" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-100 p-4">
        <Button 
          variant="ghost" 
          className={cn(
              "w-full text-red-500 hover:bg-red-50 hover:text-red-600",
              isCollapsed ? "justify-center px-0" : "justify-start gap-3"
          )}
          onClick={async () => await logout()}
        >
          <LogOut className="h-5 w-5" />
          {!isCollapsed && "Cerrar Sesión"}
        </Button>
      </div>
    </div>
  );

  return (
    <>
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 h-16 bg-white border-b border-primary/20 flex items-center px-4 justify-between shadow-sm transition-colors print:hidden">
         <div className="flex items-center gap-3">
            <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="-ml-2">
                        <Menu className="h-6 w-6 text-slate-600" />
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-72">
                    <SheetHeader className="sr-only">
                        <SheetTitle>Menú de Navegación</SheetTitle>
                    </SheetHeader>
                    <SidebarContent />
                </SheetContent>
            </Sheet>
            {/* 👇 TÍTULO MÓVIL */}
            <span className="font-bold text-lg text-slate-800 flex items-center gap-1.5">
              {isGlobalModule ? (
                <>
                  Sistema <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600 uppercase">Admin</span>
                </>
              ) : (
                <>
                  {brandName} <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-primary/10 text-primary uppercase">Admin</span>
                </>
              )}
            </span>
         </div>
         <div className="w-3 h-3 rounded-full border-2 border-white ring-1 ring-slate-100 bg-primary" />
      </div>

      <aside 
        className={cn(
            "fixed inset-y-0 left-0 z-40 hidden md:flex flex-col border-r border-slate-200 bg-white transition-all duration-300 shadow-sm",
            isCollapsed ? "w-20" : "w-64"
        )}
      >
        <SidebarContent />
        <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="absolute -right-3 top-20 bg-white border shadow-md rounded-full p-1 text-slate-400 hover:text-slate-900 transition-colors z-50"
        >
            {isCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
        </button>
      </aside>
    </>
  );
}