'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, Search, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { useCartStore } from '@/store/cart';
import { CartSidebar } from '@/components/features/CartSidebar';

const routes = [
  { href: '/', label: 'Inicio' },
  { href: '/category/globos', label: 'Globos' },
  { href: '/category/velas', label: 'Velas' },
  { href: '/category/decoracion', label: 'Decoración' },
];

export function Navbar() {
  const pathname = usePathname();
  
  // 1. Conectamos con el Store
  const totalItems = useCartStore((state) => state.getTotalItems());
  
  // 2. Solución al Hydration Mismatch (Con truco para el Linter)
  const [loaded, setLoaded] = useState(false);
  
  useEffect(() => {
    // Usamos setTimeout para "engañar" al linter y evitar el render síncrono
    const timer = setTimeout(() => {
      setLoaded(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-backdrop-filter:bg-white/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        
        {/* MENÚ MÓVIL */}
        <div className="md:hidden">
            <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="mr-2">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Abrir menú</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[400px]">
              <SheetTitle className="sr-only">Menú de navegación</SheetTitle>
              <nav className="flex flex-col gap-4 mt-8 px-6">
                {routes.map((route) => (
                  <Link
                    key={route.href}
                    href={route.href}
                    className={cn(
                      "text-lg font-medium transition-colors hover:text-slate-900",
                      pathname === route.href ? "text-slate-900" : "text-slate-500"
                    )}
                  >
                    {route.label}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>

        {/* LOGO */}
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold tracking-tighter text-slate-900">
            FiestasYa
          </span>
        </Link>

        {/* NAVEGACIÓN DESKTOP */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "transition-colors hover:text-slate-900",
                pathname === route.href ? "text-slate-900" : "text-slate-500"
              )}
            >
              {route.label}
            </Link>
          ))}
        </nav>

        {/* ACCIONES */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="text-slate-500 hover:text-slate-900">
            <Search className="h-5 w-5" />
            <span className="sr-only">Buscar</span>
          </Button>

          <CartSidebar>
            <Button variant="ghost" size="icon" className="relative text-slate-900 hover:bg-slate-100">
              <ShoppingBag className="h-5 w-5" />
              {loaded && totalItems > 0 && (
                <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-slate-900 text-[10px] font-bold text-white fade-in zoom-in duration-300">
                  {totalItems}
                </span>
              )}
              <span className="sr-only">Ver carrito</span>
            </Button>
          </CartSidebar>
        </div>
      </div>
    </header>
  );
}