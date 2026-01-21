'use client';

import { useEffect, useState, useRef, useTransition, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Search, ShoppingCart, ChevronDown, Menu, Heart, User, LogOut, Package, MapPin, Store, ChevronRight, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { useCartStore } from '@/store/cart';
import { useUIStore } from '@/store/ui';
import { useFavoritesStore } from '@/store/favorites'; 
import { CartSidebar } from '@/components/features/CartSidebar';
import { setCookie } from 'cookies-next';
import { logout } from '@/actions/auth-actions';
import { Division } from '@prisma/client';

// --- TYPES ---
interface Category {
  id: string; 
  name: string; 
  slug: string;
  division: Division;
}

interface UserSession {
  id?: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: string;
}

interface NavbarClientProps {
  categories: Category[];
  defaultDivision: Division;
  user?: UserSession | null;
}

// --- BUSCADOR COMPONENTE ---
function SearchInput({ onSearch, className, searchBtnColor }: { onSearch?: () => void, className?: string, searchBtnColor?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState('');

  useEffect(() => {
    const value = searchParams.get('q') || '';
    if (value !== query) setQuery(value);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]); 

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
    if (onSearch) onSearch();
  };

  return (
    <form onSubmit={handleSearch} className={cn("relative w-full group", className)}>
      <Input
        type="text"
        placeholder="¿Qué estás buscando hoy?"
        className="h-11 w-full pl-5 pr-12 border-0 rounded-full text-[15px] font-medium bg-white text-slate-800 shadow-sm placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-white/50"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <button 
        type="submit" 
        className="absolute right-1 top-1 h-9 w-9 flex items-center justify-center rounded-full text-white transition-all duration-200 hover:scale-105 active:scale-95 shadow-sm"
        style={{ backgroundColor: searchBtnColor || '#fc4b65' }} 
      >
        <Search className="h-4 w-4" />
      </button>
    </form>
  );
}

// --- COMPONENTE PRINCIPAL ---
export function NavbarClient({ categories, defaultDivision, user }: NavbarClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  
  // Stores
  const { getTotalItems } = useCartStore();
  const { setDivision } = useUIStore();
  const favorites = useFavoritesStore(state => state.favorites);
  const favoritesCount = favorites.length;
  
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(true);
  }, []);
  
  // Estado Optimista
  const [optimisticDivision, setOptimisticDivision] = useState<Division>(defaultDivision);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
     setDivision(defaultDivision);
  }, [defaultDivision, setDivision]);
  
  // Estados de UI
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // --- LÓGICA SMART NAVBAR (Fixed Gap Issue) ---
  const [isVisible, setIsVisible] = useState(true);
  const [isAtTop, setIsAtTop] = useState(true); // Nuevo estado para detectar el tope
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Detectar si estamos en el tope absoluto (para desactivar transición)
      setIsAtTop(currentScrollY < 20);

      // Zona de Seguridad: Si scroll < 120px (altura aprox del hero top), SIEMPRE visible.
      // Esto evita que al subir en la parte inicial se oculte/muestre creando el hueco blanco.
      if (currentScrollY < 120) {
        setIsVisible(true);
      } else {
        // Lógica normal: Subir = Mostrar, Bajar = Ocultar
        if (currentScrollY < lastScrollY.current) {
            setIsVisible(true);
        } else if (currentScrollY > 120 && currentScrollY > lastScrollY.current) {
            setIsVisible(false);
        }
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
    setIsUserMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) setIsMenuOpen(false);
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) setIsUserMenuOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDivisionChange = (newDivision: Division) => {
    if (optimisticDivision === newDivision) return;
    
    setOptimisticDivision(newDivision); 
    setDivision(newDivision);
    setCookie('festamas_division', newDivision, { maxAge: 60 * 60 * 24 * 30, path: '/' }); 

    startTransition(() => {
        if (pathname !== '/') router.push('/');
        else router.refresh(); 
    });
  };

  const handleLogout = async () => {
    await logout();
    window.location.href = "/";
  };

  // --- LÓGICA DE DISEÑO ---
  const currentDivision = optimisticDivision; 
  const isToys = currentDivision === 'JUGUETERIA';
  const filteredCategories = categories.filter(cat => cat.division === currentDivision);
  const brandName = isToys ? 'Festamás' : 'FiestasYa';
  
  const navbarBgClass = isToys 
    ? "bg-[#fc4b65] border-none shadow-none" 
    : "bg-[#eab308] border-[#eab308] shadow-md"; 
  
  const textColorClass = "text-white";
  const hoverBgClass = "hover:bg-white/20";
  const borderColorClass = "border-white/30";
  
  const brandColorText = isToys ? "text-[#fc4b65]" : "text-yellow-600";
  const badgeClass = isToys ? "text-[#fc4b65] bg-white" : "text-[#eab308] bg-white";
  
  const iconFestamas = '/images/IconoFestamas.png';
  const iconFiestasYa = '/images/IconoFiestasYa.png'; 
  const activeIconPath = isToys ? iconFestamas : iconFiestasYa;

  return (
    <>
      {/* 1. SUPER HEADER (PESTAÑAS) */}
      <div className="print:hidden w-full h-11 bg-slate-100 border-b border-slate-200 flex items-end z-[60] relative text-xs">
        <div className="w-full max-w-[1600px] mx-auto px-4 lg:px-8 flex items-center justify-between h-full">
            
            <div className="flex h-full mr-auto pt-1 gap-1">
                 <button 
                    disabled={isPending} 
                    onClick={() => handleDivisionChange('JUGUETERIA')} 
                    className={cn(
                        "relative h-full px-6 flex items-center justify-center gap-2 transition-all duration-200 rounded-t-xl border-t border-x cursor-pointer",
                        isToys 
                            ? "bg-[#fc4b65] border-[#fc4b65] text-white z-10 font-bold"
                            : "bg-slate-200/50 border-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-200 font-medium"
                    )}
                >
                    <span>Festamás</span>
                </button>

                <button 
                    disabled={isPending} 
                    onClick={() => handleDivisionChange('FIESTAS')} 
                    className={cn(
                        "relative h-full px-6 flex items-center justify-center gap-2 transition-all duration-200 rounded-t-xl border-t border-x cursor-pointer",
                        !isToys 
                            ? "bg-[#eab308] border-[#eab308] text-white z-10 font-bold" 
                            : "bg-slate-200/50 border-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-200 font-medium"
                    )}
                >
                    <span>FiestasYa</span>
                </button>
            </div>

            <div className="hidden md:flex items-center gap-5 text-slate-500 font-medium pb-3">
                <Link href="/ayuda" className="hover:text-slate-800 transition-colors">Centro de Ayuda</Link>
                <span className="h-3 w-px bg-slate-300"></span>
                <span className="text-xs">venta@festamas.com</span>
            </div>
        </div>
      </div>

      {/* 2. NAVBAR PRINCIPAL - STICKY INTELIGENTE */}
      <header 
        className={cn(
            "w-full py-3 sticky top-0 z-50 print:hidden", 
            navbarBgClass,
            // LOGICA DE ANIMACIÓN CORREGIDA:
            // 1. Si isAtTop es true, quitamos transition-all para que el anclaje sea instantáneo y sin huecos.
            // 2. Si no estamos en el top, usamos la transición suave.
            isAtTop ? "transition-none" : "transition-all duration-300 ease-in-out",
            isVisible ? "translate-y-0" : "-translate-y-full"
        )}
      >
        <div className="w-full max-w-[1600px] mx-auto flex items-center gap-4 lg:gap-8 px-4 lg:px-8 relative">
          
          {/* MENU MÓVIL */}
          <Sheet>
            <SheetTrigger asChild>
                <Button variant="ghost" className={cn("md:hidden h-10 w-10 rounded-full p-0", hoverBgClass, textColorClass)}>
                    <Menu className="h-6 w-6" />
                </Button>
            </SheetTrigger>
            
            <SheetContent side="left" className="w-[300px] sm:w-[350px] p-0 border-r-0 z-[100] flex flex-col h-full bg-slate-50">
               <SheetHeader className={cn("p-6 text-left border-b", isToys ? "bg-[#fc4b65]" : "bg-[#eab308]")}>
                  <SheetTitle className="text-white sr-only">Menú</SheetTitle>
                  
                  {user ? (
                    <div className="flex items-center gap-3 text-white">
                        <Avatar className="h-12 w-12 border-2 border-white/40">
                            <AvatarImage src={user.image || ''} />
                            <AvatarFallback className="bg-white/20 text-white font-bold">{user.name?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="font-bold text-lg leading-tight">Hola, {user.name?.split(' ')[0]}</p>
                            <p className="text-xs opacity-80 font-medium">{user.email}</p>
                        </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3">
                        <div className="relative h-8 w-32 mb-1">
                             {/* eslint-disable-next-line @next/next/no-img-element */}
                             <img src={activeIconPath} alt={brandName} className="object-contain h-full w-full object-left brightness-0 invert" />
                        </div>
                        <SheetClose asChild>
                            <Link href="/auth/login">
                                <Button className={cn("w-full bg-white font-bold rounded-full h-10 hover:bg-slate-100", brandColorText)}>
                                    Iniciar Sesión
                                </Button>
                            </Link>
                        </SheetClose>
                    </div>
                  )}
               </SheetHeader>

               <div className="flex-1 overflow-y-auto py-4 px-2">
                  <div className="space-y-1">
                      <SheetClose asChild>
                         <Link href="/" className="flex items-center gap-3 px-4 py-3 text-slate-700 hover:bg-white hover:shadow-sm rounded-xl font-medium transition-all">
                             <div className={cn("p-2 rounded-full bg-slate-100", brandColorText)}><Store className="h-5 w-5"/></div>
                             Inicio
                         </Link>
                      </SheetClose>
                  </div>

                  <div className="mt-6 mb-2 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Categorías</div>
                  <div className="space-y-1">
                     {filteredCategories.map((cat) => (
                         <SheetClose asChild key={cat.id}>
                            <Link href={`/category/${cat.slug}`} className="flex items-center justify-between px-4 py-2.5 text-slate-600 hover:text-slate-900 hover:bg-white rounded-lg text-sm font-medium transition-all">
                                {cat.name}
                                <ChevronRight className="h-4 w-4 text-slate-300" />
                            </Link>
                         </SheetClose>
                     ))}
                  </div>
               </div>

               {user && (
                   <div className="p-4 border-t bg-white">
                        <button onClick={handleLogout} className="flex items-center justify-center gap-2 w-full p-3 text-red-500 hover:bg-red-50 rounded-xl font-bold text-sm transition-colors">
                            <LogOut className="h-4 w-4" /> Cerrar Sesión
                        </button>
                   </div>
               )}
            </SheetContent>
          </Sheet>

          {/* LOGO BLANCO */}
          <Link href="/" className="shrink-0 group mr-auto md:mr-2">
             <div className="relative h-10 w-32 md:h-12 md:w-44 transition-all duration-300">
                <Image 
                    src={activeIconPath} 
                    alt={brandName} 
                    fill 
                    className="object-contain object-left brightness-0 invert filter drop-shadow-sm" 
                    priority 
                />
             </div>
          </Link>

          {/* DESKTOP: Botón Categorías */}
          <div className="relative hidden md:block" ref={menuRef}>
            <Button 
                variant="ghost" 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className={cn(
                    "flex flex-row items-center gap-2 h-11 px-6 font-bold tracking-wide border rounded-full transition-all duration-200",
                    isMenuOpen 
                        ? "bg-white text-slate-900 border-white" 
                        : cn(borderColorClass, hoverBgClass, textColorClass)
                )}
            >
                <span>Categorías</span>
                <ChevronDown className={cn("h-4 w-4 transition-transform duration-300", isMenuOpen && "rotate-180")} />
            </Button>

             {isMenuOpen && (
                <div className="absolute top-full left-0 mt-3 w-72 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="py-2 max-h-[60vh] overflow-y-auto">
                         {filteredCategories.map((cat) => (
                            <Link key={cat.id} href={`/category/${cat.slug}`} onClick={() => setIsMenuOpen(false)} className="block px-6 py-3 hover:bg-slate-50 text-slate-600 hover:text-slate-900 text-sm font-medium transition-colors border-b border-slate-50 last:border-0">
                                {cat.name}
                            </Link>
                         ))}
                    </div>
                </div>
             )}
          </div>

          {/* BUSCADOR */}
          <div className="flex-1 max-w-2xl hidden md:block">
             <Suspense>
                <SearchInput searchBtnColor={isToys ? '#fc4b65' : '#eab308'} />
             </Suspense>
          </div>

          {/* ICONOS DERECHA */}
          <div className="flex items-center gap-2 md:gap-3">
              
              {/* USUARIO */}
              <div className="relative hidden lg:block" ref={userMenuRef}>
                <Button 
                    variant="ghost" 
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className={cn(
                        "flex flex-row items-center gap-3 h-11 pl-2 pr-5 text-left border rounded-full transition-all duration-200",
                        isUserMenuOpen ? "bg-white text-slate-900 border-white" : cn(borderColorClass, hoverBgClass, textColorClass),
                        !user && "bg-white/10 border-white/40 hover:bg-white/20"
                    )}
                >
                    {user ? (
                        <>
                           <Avatar className="h-8 w-8 border border-white/50 shadow-sm">
                                <AvatarImage src={user.image || ''} />
                                <AvatarFallback className="bg-white text-slate-900 font-bold">{user.name?.charAt(0)}</AvatarFallback>
                           </Avatar>
                           <span className={cn("text-sm font-bold truncate max-w-[100px]", isUserMenuOpen ? "text-slate-900" : "text-white")}>
                               {user.name?.split(' ')[0]}
                           </span>
                        </>
                    ) : (
                        <>
                            <div className="bg-white/20 p-1.5 rounded-full">
                                <User className="h-4 w-4" />
                            </div>
                            <span className="text-sm font-bold">Ingresar</span>
                        </>
                    )}
                </Button>

                 {isUserMenuOpen && (
                     <div className="absolute top-full right-0 mt-3 w-60 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-50 text-slate-800">
                        {!user && (
                            <Link href="/auth/login" className={cn("block w-full text-center py-2.5 rounded-xl font-bold text-white mb-2 transition-transform active:scale-95", isToys ? "bg-[#fc4b65]" : "bg-[#eab308]")}>
                                Entrar Ahora
                            </Link>
                        )}
                        <Link href="/profile" className="flex items-center gap-2 px-4 py-2.5 hover:bg-slate-50 rounded-lg text-sm text-slate-600 font-medium">
                            <User className="h-4 w-4" /> Mi Perfil
                        </Link>
                        <Link href="/profile/orders" className="flex items-center gap-2 px-4 py-2.5 hover:bg-slate-50 rounded-lg text-sm text-slate-600 font-medium">
                            <Package className="h-4 w-4" /> Mis Pedidos
                        </Link>
                        {user && (
                            <>
                                <div className="h-px bg-slate-100 my-2"></div>
                                <button onClick={handleLogout} className="flex items-center gap-2 w-full text-left px-4 py-2.5 hover:bg-red-50 text-red-500 rounded-lg text-sm font-medium">
                                    <LogOut className="h-4 w-4" /> Cerrar Sesión
                                </button>
                            </>
                        )}
                     </div>
                 )}
              </div>

              {!user && (
                <Link href="/auth/login" className="lg:hidden">
                    <Button variant="ghost" className={cn("h-10 w-10 rounded-full border p-0", borderColorClass, hoverBgClass, textColorClass)}>
                        <LogIn className="h-5 w-5" />
                    </Button>
                </Link>
              )}

              {/* FAVORITOS */}
              <Link href="/favorites">
                <Button variant="ghost" className={cn("hidden md:flex relative h-11 w-11 rounded-full border items-center justify-center p-0 transition-colors", borderColorClass, hoverBgClass, textColorClass)}>
                    <Heart className="h-5 w-5" />
                    {loaded && favoritesCount > 0 && (
                        <span className={cn("absolute top-0 right-0 h-4 w-4 rounded-full text-[10px] flex items-center justify-center font-bold shadow-sm ring-2 ring-transparent", badgeClass)}>
                            {favoritesCount}
                        </span>
                    )}
                </Button>
              </Link>

              {/* CART */}
              <CartSidebar>
                 <Button variant="ghost" className={cn("relative h-10 w-10 md:h-11 md:w-11 rounded-full border items-center justify-center p-0 transition-colors", borderColorClass, hoverBgClass, textColorClass)}>
                    <ShoppingCart className="h-5 w-5" />
                    {loaded && getTotalItems() > 0 && (
                        <span className={cn("absolute top-0 right-0 h-4 w-4 rounded-full text-[10px] flex items-center justify-center font-bold shadow-sm ring-2 ring-transparent", badgeClass)}>
                            {getTotalItems()}
                        </span>
                    )}
                 </Button>
              </CartSidebar>
          </div>
        </div>
        
        <div className="md:hidden px-4 pb-3 pt-1">
             <Suspense>
                <SearchInput searchBtnColor={isToys ? '#fc4b65' : '#eab308'} className="shadow-none" />
             </Suspense>
        </div>
      </header>
    </>
  );
}