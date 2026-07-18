'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, ShoppingCart, Settings, LogOut, Menu,
  ChevronLeft, ChevronRight, Tag, Images, Store, BookOpen,
  Star, Ticket, Megaphone, Sparkles, ExternalLink, Layers, RotateCcw, MessageSquare,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetHeader } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { hexToHslString } from '@/lib/utils';
import { logout } from '@/actions/auth-actions';
import { AdminStoreSwitcher } from './AdminStoreSwitcher';

// ─── Nav structure ────────────────────────────────────────────
const NAV_GROUPS = [
  {
    label: 'Operaciones',
    items: [
      { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/admin/orders',    label: 'Pedidos',   icon: ShoppingCart },
      { href: '/admin/returns',   label: 'Cambios y devoluciones', icon: RotateCcw },
    ],
  },
  {
    label: 'Catálogo',
    items: [
      { href: '/admin/products',    label: 'Mis Productos', icon: Tag },
      { href: '/admin/collections', label: 'Colecciones',   icon: Layers },
      { href: '/admin/reviews',     label: 'Reseñas',       icon: Star },
    ],
  },
  {
    label: 'Tienda Visual',
    items: [
      { href: '/admin/banners',   label: 'Banners',         icon: Images },
      { href: '/admin/sections',  label: 'Secciones Inicio',icon: Store },
      { href: '/admin/catalogs',  label: 'Catálogos',       icon: BookOpen },
      { href: '/admin/popups',    label: 'Popups',           icon: MessageSquare },
    ],
  },
  {
    label: 'Marketing',
    items: [
      { href: '/admin/coupons', label: 'Cupones', icon: Ticket },
    ],
  },
];

const BOTTOM_ITEMS = [
  { href: '/admin/settings', label: 'Configuración', icon: Settings },
];

// ─────────────────────────────────────────────────────────────

interface Props {
  activeBranch: any;
  branches: any[];
}

export const AdminSidebar = ({ activeBranch, branches }: Props) => {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const brandName   = activeBranch?.name ?? 'Tienda';
  const primaryColor = activeBranch?.brandColors?.primary ?? '#fc4b65';

  useEffect(() => {
    document.documentElement.style.setProperty('--primary', hexToHslString(primaryColor));
  }, [primaryColor]);

  useEffect(() => {
    const el = document.getElementById('admin-main-content');
    if (el && window.innerWidth >= 768) {
      el.style.marginLeft = isCollapsed ? '80px' : '256px';
    }
  }, [isCollapsed]);

  const NavLink = ({ href, label, icon: Icon }: { href: string; label: string; icon: any }) => {
    const isActive = pathname === href || (href !== '/admin/dashboard' && pathname.startsWith(href));
    return (
      <Link
        href={href}
        onClick={() => setIsMobileOpen(false)}
        title={isCollapsed ? label : undefined}
        className={cn(
          'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150 group relative',
          isCollapsed ? 'justify-center' : '',
          isActive
            ? 'bg-primary/10 text-primary font-semibold'
            : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800',
        )}
      >
        <Icon className={cn('h-[18px] w-[18px] flex-shrink-0 transition-colors', isActive ? 'text-primary' : 'text-slate-400 group-hover:text-slate-600')} />
        {!isCollapsed && <span className="truncate">{label}</span>}
        {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-7 rounded-r-full bg-primary" />}
      </Link>
    );
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white">

      {/* Header */}
      <div className={cn('flex flex-col gap-3 border-b border-slate-100 px-4 py-4', isCollapsed && 'items-center')}>
        
        <AdminStoreSwitcher activeBranch={activeBranch} branches={branches} isCollapsed={isCollapsed} isGlobalModule={false} />
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 scrollbar-hide">
        {NAV_GROUPS.map((group, gi) => (
          <div key={gi} className={gi > 0 ? 'pt-4' : ''}>
            {/* Group label */}
            {!isCollapsed ? (
              <div className="px-3 mb-1.5">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{group.label}</span>
              </div>
            ) : (
              gi > 0 && <div className="my-3 mx-auto w-6 h-px bg-slate-200" />
            )}
            {group.items.map(item => <NavLink key={item.href} {...item} />)}
          </div>
        ))}
      </nav>

      {/* Bottom */}
      <div className="border-t border-slate-100 p-3 space-y-1">
        {BOTTOM_ITEMS.map(item => <NavLink key={item.href} {...item} />)}

        {/* Link to ERP */}
        {!isCollapsed && (
          <a
            href={process.env.NEXT_PUBLIC_ERP_URL ?? 'http://localhost:3001'}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <ExternalLink className="h-4 w-4 flex-shrink-0" />
            <span>Abrir ERP Zaiko</span>
          </a>
        )}

        <Button
          variant="ghost"
          size="sm"
          className={cn('w-full text-red-500 hover:bg-red-50 hover:text-red-600 text-sm', isCollapsed ? 'justify-center px-0' : 'justify-start gap-3')}
          onClick={() => logout()}
        >
          <LogOut className="h-4 w-4 flex-shrink-0" />
          {!isCollapsed && 'Cerrar sesión'}
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 h-14 bg-white border-b border-slate-100 flex items-center px-4 justify-between shadow-sm print:hidden">
        <div className="flex items-center gap-3">
          <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="-ml-2">
                <Menu className="h-5 w-5 text-slate-600" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-72 border-r border-slate-100">
              <SheetHeader className="sr-only"><SheetTitle>Navegación</SheetTitle></SheetHeader>
              <SidebarContent />
            </SheetContent>
          </Sheet>
          <div className="flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="font-bold text-sm text-slate-800">{brandName}</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-primary/10 text-primary uppercase font-bold">E-comm</span>
          </div>
        </div>
        <Megaphone className="h-4 w-4 text-slate-300" />
      </div>

      {/* Desktop sidebar */}
      <aside className={cn(
        'fixed inset-y-0 left-0 z-40 hidden md:flex flex-col border-r border-slate-200 bg-white transition-all duration-300 shadow-sm',
        isCollapsed ? 'w-20' : 'w-64',
      )}>
        <SidebarContent />
        <button
          onClick={() => setIsCollapsed(c => !c)}
          className="absolute -right-3 top-20 bg-white border border-slate-200 shadow-md rounded-full p-1 text-slate-400 hover:text-slate-700 transition-colors z-50"
        >
          {isCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
        </button>
      </aside>
    </>
  );
};
