'use client';

import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Menu, Search, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { useCartStore } from '@/store/cart';
import { CartSidebar } from '@/components/features/CartSidebar';

interface NavbarClientProps {
  categories: { id: string; name: string; slug: string }[];
}

interface SearchInputProps {
  className?: string;
  onSearch?: () => void;
}

function SearchInput({ className, onSearch }: SearchInputProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState('');

  useEffect(() => {
    // 🛡️ FIX: Usamos requestAnimationFrame o setTimeout para evitar el error de render síncrono
    const value = searchParams.get('q') || '';
    if (value !== query) {
        setQuery(value);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]); 

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    } else {
      router.push('/');
    }

    if (onSearch) {
      onSearch();
    }
  };

  return (
    <form onSubmit={handleSearch} className={cn("relative", className)}>
      <Input
        type="text"
        placeholder="Buscar productos..."
        className="h-10 w-full pl-3 pr-10 bg-slate-50 border-slate-200 focus-visible:ring-slate-300"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <button 
        type="submit" 
        className="absolute right-0 top-0 h-full px-3 text-slate-400 hover:text-slate-600 transition-colors"
      >
        <Search className="h-4 w-4" />
        <span className="sr-only">Buscar</span>
      </button>
    </form>
  );
}

export function NavbarClient({ categories }: NavbarClientProps) {
  const pathname = usePathname();
  const totalItems = useCartStore((state) => state.getTotalItems());
  const [loaded, setLoaded] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false); 
  
  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const routes = [
    { href: '/', label: 'Inicio' },
    ...categories.map(cat => ({
      href: `/category/${cat.slug}`,
      label: cat.name
    }))
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-backdrop-filter:bg-white/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        
        {/* 1. MENÚ MÓVIL */}
        <div className="md:hidden">
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="mr-2">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Abrir menú</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[400px] p-0">
              <SheetTitle className="sr-only">Menú</SheetTitle>
              
              <div className="flex flex-col h-full py-6">
                <div className="px-6 mb-6">
                   <span className="text-xl font-bold tracking-tighter text-slate-900">
                    FiestasYa
                  </span>
                </div>

                {/* BUSCADOR MÓVIL */}
                <div className="px-6 mb-6">
                    <Suspense fallback={<div className="h-10 bg-slate-100 rounded-md" />}>
                        <SearchInput onSearch={() => setIsSheetOpen(false)} />
                    </Suspense>
                </div>

                <nav className="flex flex-col gap-2 px-4">
                  {routes.map((route) => (
                    <Link
                      key={route.href}
                      href={route.href}
                      onClick={() => setIsSheetOpen(false)}
                      className={cn(
                        "flex items-center rounded-md px-2 py-3 text-lg font-medium transition-colors hover:bg-slate-100",
                        pathname === route.href ? "text-slate-900 bg-slate-50" : "text-slate-500"
                      )}
                    >
                      {route.label}
                    </Link>
                  ))}
                </nav>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* 2. LOGO */}
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold tracking-tighter text-slate-900">
            FiestasYa
          </span>
        </Link>

        {/* 3. NAVEGACIÓN DESKTOP */}
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

        {/* 4. ACCIONES */}
        <div className="flex items-center gap-4">
          
          {/* BUSCADOR DESKTOP */}
          <div className="hidden sm:block w-full max-w-[200px] lg:max-w-[300px]">
             <Suspense>
                <SearchInput />
             </Suspense>
          </div>

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