'use client';

import { useEffect, useState, useRef, useTransition, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Search, ShoppingCart, Menu, Heart, User, LogOut, Package, Store, ChevronRight, LogIn, ChevronDown, MapPin, BookOpen, Truck } from 'lucide-react';
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
    // Fondo gris (slate-100) para resaltar sobre blanco
    <form onSubmit={handleSearch} className={cn("relative w-full group bg-slate-100 rounded-full shadow-sm hover:bg-slate-200/70 transition-colors", className)}>
      <Input
        type="text"
        placeholder="¿Qué estás buscando hoy?"
        className="h-10 w-full pl-5 pr-12 border-0 rounded-full text-sm font-medium bg-transparent text-slate-800 shadow-none placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-slate-200"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <button 
        type="submit" 
        className="absolute right-1 top-1 h-8 w-8 flex items-center justify-center rounded-full text-white transition-all duration-200 hover:scale-105 active:scale-95 shadow-sm"
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

  // --- LÓGICA SMART NAVBAR ---
  const [isVisible, setIsVisible] = useState(true);
  const [isAtTop, setIsAtTop] = useState(true); 
  const lastScrollY = useRef(0);

  // AQUI LA MAGIA: Si cierras el menú, forzamos que el navbar se vea.
  // Solo se ocultará cuando vuelvas a hacer scroll hacia abajo.
  useEffect(() => {
    if (!isUserMenuOpen) {
        setIsVisible(true);
    }
  }, [isUserMenuOpen]);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      setIsAtTop(currentScrollY < 20);

      // Ocultar navbar al hacer scroll down, mostrar al subir
      if (currentScrollY < 120) {
        setIsVisible(true);
      } else {
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

  // --- LÓGICA DE DISEÑO & COLORES ---
  const currentDivision = optimisticDivision; 
  const isToys = currentDivision === 'JUGUETERIA';
  const filteredCategories = categories.filter(cat => cat.division === currentDivision);
  const brandName = isToys ? 'Festamás' : 'FiestasYa';
  
  // Estilos Base
  const navbarBgClass = "bg-white shadow-sm border-b border-slate-100";
  
  // COLORES POR DIVISIÓN
  const brandColorText = isToys ? "text-[#fc4b65]" : "text-[#fb3099]"; 
  const badgeClass = isToys ? "text-white bg-[#fc4b65]" : "text-white bg-[#fb3099]";
  const searchBtnBg = isToys ? '#fc4b65' : '#fb3099';
  const mobileHeaderClass = isToys ? "bg-[#fc4b65]" : "bg-[#fb3099]";

  // --- REFERENCIAS DE LOGOS ---
  const iconFestamasSubheader = '/images/IconoFestamas.png';
  const iconFestamasMain = '/images/IconoFestamas1.png';
  const iconFiestasYa = '/images/IconoFiestasYa1.png'; 

  const activeMainIcon = isToys ? iconFestamasMain : iconFiestasYa;

  return (
    <>
      {/* 1. SUPER HEADER (SUBHEADER - TABS) */}
      <div className="print:hidden w-full h-[36px] bg-slate-100 border-b border-slate-200 flex items-end z-[60] relative text-[11px]">
        <div className="w-full max-w-[1473px] mx-auto px-4 lg:px-8 flex items-center justify-between h-full">
            
            <div className="flex h-full mr-auto pt-0.5 gap-1">
                {/* TAB 1: FESTAMÁS */}
                 <button 
                    disabled={isPending} 
                    onClick={() => handleDivisionChange('JUGUETERIA')} 
                    className={cn(
                        "relative h-full px-[12px] flex items-center justify-center gap-2 transition-all duration-200 rounded-t-lg border-t border-x cursor-pointer min-w-[100px]",
                        isToys 
                            ? "bg-[#fc4b65] border-[#fc4b65] z-10 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]"
                            : "bg-slate-200/50 border-transparent hover:bg-slate-200"
                    )}
                >
                    <div className="relative h-[19.6px] w-[80px]">
                        <Image 
                            src={iconFestamasSubheader} 
                            alt="Festamás" 
                            fill 
                            className={cn(
                                "object-contain transition-all duration-300",
                                !isToys && "brightness-0 opacity-30 hover:opacity-50"
                            )}
                        />
                    </div>
                </button>

                {/* TAB 2: FIESTAS YA */}
                <button 
                    disabled={isPending} 
                    onClick={() => handleDivisionChange('FIESTAS')} 
                    className={cn(
                        "relative h-full px-[12px] flex items-center justify-center gap-2 transition-all duration-200 rounded-t-lg border-t border-x cursor-pointer min-w-[100px]",
                        !isToys
                            ? "bg-[#fb3099] border-[#fb3099] z-10 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]" 
                            : "bg-slate-200/50 border-transparent hover:bg-slate-200"
                    )}
                >
                    <div className="relative h-[19.6px] w-[80px]">
                         <Image 
                            src={iconFiestasYa} 
                            alt="FiestasYa" 
                            fill 
                            className={cn(
                                "object-contain transition-all duration-300",
                                isToys 
                                    ? "grayscale opacity-50 hover:opacity-80"
                                    : "brightness-0 invert" 
                            )}
                        />
                    </div>
                </button>
            </div>
        </div>
      </div>

      {/* 2. NAVBAR PRINCIPAL (STICKY) */}
      <header 
        className={cn(
            "w-full h-[64px] z-50 print:hidden flex flex-col transition-all duration-300 ease-in-out", 
            navbarBgClass,
            isAtTop ? "sticky top-0" : "sticky top-0 shadow-md", 
            // FIX: Quitamos 'absolute' y solo aplicamos ocultar si NO está visible Y el menú está cerrado.
            (!isVisible && !isUserMenuOpen) && "-translate-y-full" 
        )}
      >
        <div className="w-full max-w-[1473px] mx-auto flex items-center gap-4 lg:gap-8 px-4 lg:px-8 relative h-full">
            
            {/* MENU MÓVIL */}
            <Sheet>
                <SheetTrigger asChild>
                    <Button variant="ghost" className={cn("md:hidden h-10 w-10 rounded-full p-0 hover:bg-slate-100 text-slate-700")}>
                        <Menu className="h-6 w-6" />
                    </Button>
                </SheetTrigger>
                
                <SheetContent side="left" className="w-[300px] sm:w-[350px] p-0 border-r-0 z-[100] flex flex-col h-full bg-slate-50">
                {/* Header Móvil */}
                <SheetHeader className={cn("p-6 text-left border-b", mobileHeaderClass)}>
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
                            <div className="relative h-10 w-40 mb-1">
                                <Image 
                                    src={activeMainIcon} 
                                    alt={brandName} 
                                    fill 
                                    className="object-contain object-left" 
                                />
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

            {/* LOGO PRINCIPAL */}
            <Link href="/" className="shrink-0 group mr-auto md:mr-2">
                <div className="relative w-[135px] h-[48px] transition-all duration-300">
                    <Image 
                        src={activeMainIcon} 
                        alt={brandName} 
                        fill 
                        className="object-contain object-left" 
                        priority 
                    />
                </div>
            </Link>

            {/* BOTÓN MENÚ DESKTOP */}
            <div className="relative hidden md:block" ref={menuRef}>
                <Button 
                    variant="ghost" 
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className={cn(
                        "flex flex-row items-center gap-2 h-10 px-4 font-bold tracking-wide rounded-full transition-all duration-200",
                        isMenuOpen 
                            ? "bg-slate-100 text-slate-900" 
                            : "text-slate-700 hover:bg-slate-100"
                    )}
                >
                    <Menu className="h-5 w-5" />
                    <span>Menú</span>
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
                    <SearchInput searchBtnColor={searchBtnBg} />
                </Suspense>
            </div>

            {/* ICONOS DERECHA - AQUI EL CAMBIO CLAVE: ml-auto */}
            <div className="flex items-center gap-1 md:gap-2 ml-auto">
                
                {/* 1. MIS PEDIDOS */}
                {user && (
                    <Link 
                        href="/profile/orders" 
                        className="hidden lg:flex items-center gap-2 text-slate-600 hover:text-slate-900 font-medium text-sm px-3 py-2 rounded-full hover:bg-slate-100 transition-colors"
                    >
                        <Package className="h-5 w-5" />
                        <span>Mis Pedidos</span>
                    </Link>
                )}

                {/* 2. USUARIO */}
                <div className="relative hidden lg:block" ref={userMenuRef}>
                    <Button 
                        variant="ghost" 
                        onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                        className={cn(
                            "flex flex-row items-center gap-2 h-10 pl-2 pr-3 text-left rounded-full transition-all duration-200 relative z-50", // z-50 para que quede sobre el backdrop
                            isUserMenuOpen ? "bg-white text-slate-900 ring-2 ring-slate-100" : "text-slate-700 hover:bg-slate-100"
                        )}
                    >
                        {user ? (
                            <>
                                <Avatar className="h-7 w-7 border border-slate-200 shadow-sm">
                                    <AvatarImage src={user.image || ''} />
                                    <AvatarFallback className="bg-slate-100 text-slate-900 font-bold text-xs">{user.name?.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <span className={cn("text-sm font-bold truncate max-w-[100px]")}>
                                    {user.name?.split(' ')[0]}
                                </span>
                                <ChevronDown 
                                    className={cn(
                                        "h-4 w-4 text-slate-400 opacity-70 ml-0.5 transition-transform duration-200",
                                        isUserMenuOpen && "rotate-180"
                                    )} 
                                />
                            </>
                        ) : (
                            <>
                                <div className="bg-slate-100 p-1.5 rounded-full">
                                    <User className="h-4 w-4" />
                                </div>
                                <span className="text-sm font-bold">Ingresar</span>
                            </>
                        )}
                    </Button>

                    {isUserMenuOpen && (
                        <div className="absolute top-full right-0 mt-3 w-60 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-50 text-slate-800">
                            {!user && (
                                <Link href="/auth/login" className={cn("block w-full text-center py-2.5 rounded-xl font-bold text-white mb-2 transition-transform active:scale-95", isToys ? "bg-[#fc4b65]" : "bg-[#fb3099]")}>
                                    Entrar Ahora
                                </Link>
                            )}
                            <Link href="/profile" className="flex items-center gap-2 px-4 py-2.5 hover:bg-slate-50 rounded-lg text-sm text-slate-600 font-medium">
                                <User className="h-4 w-4" /> Mi Perfil
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
                        <Button variant="ghost" className="h-10 w-10 rounded-full p-0 text-slate-700 hover:bg-slate-100">
                            <LogIn className="h-5 w-5" />
                        </Button>
                    </Link>
                )}

                {/* 3. FAVORITOS */}
                <Link href="/favorites">
                    <Button variant="ghost" className="hidden md:flex relative h-10 w-10 rounded-full items-center justify-center p-0 transition-colors text-slate-700 hover:bg-slate-100">
                        <Heart className="h-5 w-5" />
                        {loaded && favoritesCount > 0 && (
                            <span className={cn("absolute top-0 right-0 h-3.5 w-3.5 rounded-full text-[9px] flex items-center justify-center font-bold shadow-sm ring-2 ring-white", badgeClass)}>
                                {favoritesCount}
                            </span>
                        )}
                    </Button>
                </Link>

                {/* 4. CART */}
                <CartSidebar>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full items-center justify-center p-0 transition-colors text-slate-700 hover:bg-slate-100">
                        <ShoppingCart className="h-5 w-5" />
                        {loaded && getTotalItems() > 0 && (
                            <span className={cn("absolute top-0 right-0 h-3.5 w-3.5 rounded-full text-[9px] flex items-center justify-center font-bold shadow-sm ring-2 ring-white", badgeClass)}>
                                {getTotalItems()}
                            </span>
                        )}
                    </Button>
                </CartSidebar>
            </div>
        </div>
      </header>

      {/* 3. BARRA INFERIOR DE NAVEGACIÓN (SEPARADA Y STATIC) */}
      <div className="hidden md:block w-full bg-white border-b border-slate-200">
            <div className="w-full max-w-[1473px] mx-auto px-4 lg:px-8 h-[40px] flex items-center justify-between text-sm font-medium text-slate-600">
                
                {/* IZQUIERDA: UBICACIÓN */}
                <button className="flex items-center gap-2 hover:text-slate-900 transition-colors">
                    <MapPin className="h-4 w-4 text-slate-400" />
                    <span>¿Dónde quieres recibir tu pedido?</span>
                    <ChevronDown className="h-3 w-3 opacity-50" />
                </button>

                {/* DERECHA: LINKS ADICIONALES */}
                <div className="flex items-center gap-6">
                    <Link href="/catalogos" className="flex items-center gap-2 hover:text-slate-900 transition-colors">
                        <BookOpen className="h-4 w-4 text-slate-400" />
                        Catálogos
                    </Link>
                    
                    <Link href="/tiendas" className="flex items-center gap-2 hover:text-slate-900 transition-colors">
                        <Store className="h-4 w-4 text-slate-400" />
                        Tiendas
                    </Link>

                    {/* Link destacado para Venta por Volumen */}
                    <Link href="/venta-empresa" className={cn("flex items-center gap-2 transition-colors font-semibold", brandColorText)}>
                        <Truck className="h-4 w-4" />
                        ¡Abastece tu hogar por volumen!
                    </Link>
                </div>

            </div>
      </div>
      
      {/* ESPACIADOR MÓVIL PARA BUSCADOR FLOTANTE */}
      <div className="md:hidden w-full bg-white px-4 py-2 border-b">
           <Suspense>
              <SearchInput searchBtnColor={searchBtnBg} className="shadow-none bg-slate-100" />
           </Suspense>
      </div>

      {/* OVERLAY (TELÓN OSCURO) */}
      {isUserMenuOpen && (
        <div 
            className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 animate-in fade-in"
            onClick={() => setIsUserMenuOpen(false)}
        />
      )}
    </>
  );
}