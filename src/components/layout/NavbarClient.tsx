'use client';

import { useEffect, useState, useRef, useTransition, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import cloudinaryLoader from '@/lib/cloudinaryLoader';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { ShoppingCart, Menu, Heart, User, LogOut, Package, Store, ChevronRight, ChevronDown, MapPin, BookOpen, Truck, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { hexToHslString } from '@/lib/utils';
import { useCartStore } from '@/store/cart';
import { useUIStore } from '@/store/ui';
import { useFavoritesStore } from '@/store/favorites'; 
import { CartSidebar } from '@/components/features/CartSidebar';
import { SmartSearch } from '@/components/features/SmartSearch';
import { LoginModal } from '@/components/auth/LoginModal';
import { RegisterModal } from '@/components/auth/RegisterModal';
import { setCookie } from 'cookies-next';
import { logout } from '@/actions/auth-actions';
import { BranchUI } from '@/store/ui';

interface Category {
  id: string; 
  name: string; 
  slug: string;
  ecommerceCode: string | null;
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
  branches: BranchUI[];
  defaultBranchId: string;
  user?: UserSession | null;
}

export function NavbarClient({ categories, branches, defaultBranchId, user }: NavbarClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { getTotalItems, cart, clearCart } = useCartStore();
  const { setBranches, activeBranchId, setActiveBranchId } = useUIStore();
  const favorites = useFavoritesStore(state => state.favorites);
  const favoritesCount = favorites.length;
  const [loaded, setLoaded] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

  useEffect(() => setLoaded(true), []);
  
  // Detectar parámetros de URL para abrir modales
  useEffect(() => {
    if (searchParams.get('openLogin') === 'true') {
      setIsLoginModalOpen(true);
      // Limpiar el parámetro de la URL
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete('openLogin');
      window.history.replaceState({}, '', newUrl.toString());
    }
    if (searchParams.get('openRegister') === 'true') {
      setIsRegisterModalOpen(true);
      // Limpiar el parámetro de la URL
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete('openRegister');
      window.history.replaceState({}, '', newUrl.toString());
    }
  }, [searchParams]);
  
  const [optimisticBranchId, setOptimisticBranchId] = useState<string>(defaultBranchId);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setBranches(branches);
    setActiveBranchId(defaultBranchId);
    setOptimisticBranchId(defaultBranchId);
  }, [branches, defaultBranchId, setActiveBranchId, setBranches]);
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const [isVisible, setIsVisible] = useState(true);
  const [isAtTop, setIsAtTop] = useState(true); 
  const lastScrollY = useRef(0);

  useEffect(() => {
    if (!isUserMenuOpen && !isMenuOpen) setIsVisible(true);
  }, [isUserMenuOpen, isMenuOpen]);

  useEffect(() => {
    const handleScroll = () => {
      // No ocultar el navbar si algún menú está abierto
      if (isMenuOpen || isUserMenuOpen) {
        setIsVisible(true);
        return;
      }
      
      const currentScrollY = window.scrollY;
      setIsAtTop(currentScrollY < 20);
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
  }, [isMenuOpen, isUserMenuOpen]);

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

  const handleBranchChange = (branchId: string) => {
    if (optimisticBranchId === branchId) return;
    setOptimisticBranchId(branchId); 
    setActiveBranchId(branchId);
    setCookie('festamas_branch_id', branchId, { maxAge: 60 * 60 * 24 * 30, path: '/' }); 
    if (cart.length > 0) {
      clearCart();
    }
    startTransition(() => {
        if (pathname !== '/') router.push('/');
        else router.refresh(); 
    });
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      // Forzar redirección manual si falla
      window.location.href = "/";
    }
  };

  const effectiveBranchId = activeBranchId ?? optimisticBranchId;
  const activeBranch = branches.find((branch) => branch.id === effectiveBranchId) ?? branches[0];
  const filteredCategories = categories.filter(cat => cat.ecommerceCode === activeBranch?.ecommerceCode);
  const brandName = activeBranch?.name ?? 'Branch';
  
  const primaryColor = activeBranch?.brandColors?.primary ?? '#fc4b65';
  useEffect(() => {
    document.documentElement.style.setProperty('--primary', hexToHslString(primaryColor));
  }, [primaryColor]);

  const navbarBgClass = "bg-white shadow-sm border-b border-slate-100";
  const brandColorText = "text-primary"; 
  const badgeClass = "text-white bg-primary"; 
  const searchBtnBg = primaryColor;
  const mobileHeaderClass = "bg-primary";

  const activeMainIcon = activeBranch?.logos?.imagotipo ?? '';
  const activeMobileIcon = activeBranch?.logos?.isotipo ?? '';
  const activeMobileIconWhite = activeBranch?.logos?.isotipoWhite ?? activeMobileIcon;

  return (
    <>
      {/* 1. SUPER HEADER (SUBHEADER - TABS) */}
      <div className="print:hidden w-full h-[36px] bg-slate-100 border-b border-slate-200 flex items-end z-40 relative text-[11px]">
        {/* 🔥 FIX: Reducimos padding en móvil a 0 (px-0 md:px-4) para que abarque orilla a orilla */}
        <div className="w-full max-w-[1473px] mx-auto px-0 md:px-4 lg:px-8 flex items-center justify-between h-full">
            
            {/* 🔥 FIX: w-full en móvil para que ocupe todo el espacio */}
            <div className="flex h-full w-full md:w-auto mr-auto pt-0.5 md:gap-1">
                {branches.map(branch => {
                  const isActive = branch.id === effectiveBranchId;
                  return (
                    <button 
                      key={branch.id}
                      disabled={isPending} 
                      onClick={() => handleBranchChange(branch.id)} 
                      className={cn(
                          "relative h-full flex-1 md:flex-none md:px-[12px] flex items-center justify-center gap-2 transition-all duration-200 rounded-t-lg border-t border-x cursor-pointer md:min-w-[100px]",
                          isActive 
                              ? "z-10 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] text-white"
                              : "bg-slate-200/50 border-transparent hover:bg-slate-200"
                      )}
                      style={{
                        backgroundColor: isActive ? primaryColor : undefined,
                        borderColor: isActive ? primaryColor : undefined,
                      }}
                    >
                        <div className="relative h-[22px] w-[90px] md:w-[110px] flex items-center justify-center px-1">
                           {branch.logos?.imagotipoWhite ? (
                              <Image
                                loader={cloudinaryLoader}
                                src={branch.logos.imagotipoWhite}
                                alt={branch.name}
                                fill
                                sizes="(max-width: 768px) 90px, 110px"
                                className="object-contain object-center"
                              />
                           ) : (
                              <span className={cn("text-[11px] md:text-xs font-semibold", isActive ? "text-white" : "text-slate-700")}>{branch.name}</span>
                           )}
                        </div>
                    </button>
                  );
                })}
            </div>
        </div>
      </div>

      {/* 2. NAVBAR PRINCIPAL (STICKY) */}
      <header 
        className={cn(
            "w-full h-[64px] md:h-[72px] z-50 print:hidden flex flex-col transition-all duration-300 ease-in-out", 
            navbarBgClass,
            isAtTop ? "sticky top-0" : "sticky top-0 shadow-md", 
            (!isVisible && !isUserMenuOpen) && "-translate-y-full" 
        )}
      >
        <div className="w-full max-w-[1473px] mx-auto flex items-center gap-2 md:gap-4 lg:gap-8 px-2 sm:px-4 lg:px-8 relative h-full">
            
            <Link href="/" className="shrink-0 group">
                <div className="relative w-[40px] h-[40px] md:w-[135px] md:h-[48px] transition-all duration-300">
                    {activeMainIcon && <Image loader={cloudinaryLoader} src={activeMainIcon} alt={brandName} fill sizes="135px" className="hidden md:block object-contain object-left" priority />}
                    {!activeMainIcon && <span className="hidden md:flex h-full items-center font-black text-xl text-primary">{brandName}</span>}
                    
                    {activeMobileIcon && <Image loader={cloudinaryLoader} src={activeMobileIcon} alt={brandName} fill sizes="40px" className="block md:hidden object-contain object-center" priority />}
                    {!activeMobileIcon && <span className="flex md:hidden h-full items-center justify-center font-black text-2xl text-primary rounded-xl bg-orange-50">{brandName[0]}</span>}
                </div>
            </Link>

            <Sheet>
                <SheetTrigger asChild>
                    <Button variant="ghost" className={cn("md:hidden h-10 w-10 rounded-full p-0 hover:bg-slate-100 text-slate-700 shrink-0")}>
                        <Menu className="h-6 w-6" />
                    </Button>
                </SheetTrigger>
                
                <SheetContent side="left" className="w-[300px] sm:w-[350px] p-0 border-r-0 z-[100] flex flex-col h-full bg-white">
                    <SheetTitle className="sr-only">Menú de Navegación</SheetTitle>
                    
                    {/* Franja de color superior */}
                    <div className="h-[3px] w-full" style={{ backgroundColor: primaryColor }}></div>
                    
                    {/* Header con saludo de usuario */}
                    {user && (
                        <div className="px-6 py-5 border-b border-slate-100">
                            <div className="flex items-center gap-3">
                                <div className="flex-1 min-w-0">
                                    <p className="text-lg font-semibold text-slate-900">¡Hola, {user.name?.split(' ')[0]}!</p>
                                    <p className="text-sm text-slate-500 mt-0.5 truncate">{user.email}</p>
                                </div>
                                {activeMobileIcon && (
                                    <div className="relative h-10 w-10 shrink-0">
                                        <Image 
                                            loader={cloudinaryLoader} 
                                            src={activeMobileIcon} 
                                            alt={brandName} 
                                            fill 
                                            sizes="40px" 
                                            className="object-contain" 
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                    
                    <div className="flex-1 overflow-y-auto py-4 px-2">
                        {/* Opciones de Usuario */}
                        {user && (
                            <>
                                <div className="flex flex-col mb-2">
                                    <SheetClose asChild><Link href="/profile" className="flex items-center gap-3 px-4 py-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg text-sm font-normal transition-all"><User className="h-4 w-4 text-slate-400"/>Mi Perfil</Link></SheetClose>
                                    <SheetClose asChild><Link href="/profile/orders" className="flex items-center gap-3 px-4 py-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg text-sm font-normal transition-all"><Package className="h-4 w-4 text-slate-400"/>Mis Pedidos</Link></SheetClose>
                                    <SheetClose asChild><Link href="/profile/addresses" className="flex items-center gap-3 px-4 py-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg text-sm font-normal transition-all"><MapPin className="h-4 w-4 text-slate-400"/>Direcciones de entrega</Link></SheetClose>
                                    <SheetClose asChild><Link href="/favorites" className="flex items-center gap-3 px-4 py-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg text-sm font-normal transition-all"><Heart className="h-4 w-4 text-slate-400"/>Favoritos</Link></SheetClose>
                                </div>
                                <div className="border-t border-slate-200/60 mx-4 my-2"></div>
                            </>
                        )}
                        
                        {/* Navegación General */}
                        <div className="flex flex-col mb-4">
                            <SheetClose asChild><Link href="/" className="flex items-center gap-3 px-4 py-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg text-sm font-normal transition-all"><Store className="h-4 w-4 text-slate-400"/>Inicio</Link></SheetClose>
                            <SheetClose asChild><Link href="/catalogos" className="flex items-center gap-3 px-4 py-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg text-sm font-normal transition-all"><BookOpen className="h-4 w-4 text-slate-400"/>Catálogos</Link></SheetClose>
                            <SheetClose asChild><Link href="/tiendas" className="flex items-center gap-3 px-4 py-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg text-sm font-normal transition-all"><MapPin className="h-4 w-4 text-slate-400"/>Tiendas</Link></SheetClose>
                        </div>
                        
                        <div className="border-t border-slate-200/60 mx-4 mt-2 mb-4"></div>
                        <div className="mb-2 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Categorías</div>
                        <div className="space-y-1">
                            {filteredCategories.map((cat) => (
                                <SheetClose asChild key={cat.id}>
                                    <Link href={`/category/${cat.slug}`} className="flex items-center justify-between px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg text-sm font-normal transition-all">{cat.name}<ChevronRight className="h-4 w-4 text-slate-300" /></Link>
                                </SheetClose>
                            ))}
                        </div>
                        
                        {/* Nuestras Tiendas */}
                        <div className="border-t border-slate-200/60 mx-4 mt-4 mb-4"></div>
                        <div className="mb-2 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Nuestras Tiendas</div>
                        <div className="space-y-1">
                            {branches.map((branch) => {
                                const isActive = branch.id === effectiveBranchId;
                                return (
                                    <button
                                        key={branch.id}
                                        disabled={isPending}
                                        onClick={() => handleBranchChange(branch.id)}
                                        className={cn(
                                            "flex items-center gap-3 w-full px-4 py-2.5 rounded-lg text-sm font-normal transition-all",
                                            isActive 
                                                ? "bg-slate-100 text-slate-900" 
                                                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                                        )}
                                    >
                                        {branch.logos?.isotipo && (
                                            <div className="relative h-6 w-6 shrink-0">
                                                <Image
                                                    loader={cloudinaryLoader}
                                                    src={branch.logos.isotipo}
                                                    alt={branch.name}
                                                    fill
                                                    sizes="24px"
                                                    className="object-contain"
                                                />
                                            </div>
                                        )}
                                        <span className="flex-1 text-left">{branch.name}</span>
                                        {isActive && (
                                            <div className="h-2 w-2 rounded-full" style={{ backgroundColor: primaryColor }}></div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                        
                        {/* Botón de Cerrar Sesión */}
                        {user && (
                            <>
                                <div className="border-t border-slate-200/60 mx-4 mt-4 mb-2"></div>
                                <button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-2.5 text-red-500 hover:bg-red-50 hover:text-red-600 rounded-lg text-sm font-normal transition-all mx-2"><LogOut className="h-4 w-4" /> Cerrar Sesión</button>
                            </>
                        )}
                    </div>
                </SheetContent>
            </Sheet>

            <div className="relative hidden md:block" ref={menuRef}>
                <Button variant="ghost" onClick={() => setIsMenuOpen(!isMenuOpen)} className={cn("flex flex-row items-center gap-2 h-10 px-4 font-bold tracking-wide rounded-full transition-all duration-200", isMenuOpen ? "bg-slate-100 text-slate-900" : "text-slate-700 hover:bg-slate-100")}>
                    <Menu className="h-5 w-5" />
                    <span>Menú</span>
                </Button>
                {isMenuOpen && (
                    <div className="absolute top-full left-0 mt-3 w-72 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                        <div className="py-2 max-h-[60vh] overflow-y-auto">
                            {filteredCategories.map((cat) => (
                                <Link key={cat.id} href={`/category/${cat.slug}`} onClick={() => setIsMenuOpen(false)} className="block px-6 py-3 hover:bg-slate-50 text-slate-600 hover:text-slate-900 text-sm font-medium transition-colors border-b border-slate-50 last:border-0">{cat.name}</Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <div className="flex-1 min-w-0">
                <Suspense><SmartSearch searchBtnColor={searchBtnBg} /></Suspense>
            </div>

            <div className="flex items-center gap-1 md:gap-2 shrink-0">
                {user && (
                    <Link href="/profile/orders" className="hidden font-bold lg:flex items-center gap-2 text-slate-600 hover:text-slate-900 font-medium text-sm px-3 py-2 rounded-full hover:bg-slate-100 transition-colors">
                        <Package className="h-5 w-5" /><span>Mis Pedidos</span>
                    </Link>
                )}

                <div className="relative hidden lg:block" ref={userMenuRef}>
                    <Button variant="ghost" onClick={() => setIsUserMenuOpen(!isUserMenuOpen)} className={cn("flex flex-row items-center gap-2 h-10 pl-2 pr-3 text-left rounded-full transition-all duration-200 relative z-50", isUserMenuOpen ? "bg-white text-slate-900 ring-2 ring-slate-100" : "text-slate-700 hover:bg-slate-100")}>
                        {user ? (
                            <>
                                <Avatar className="h-7 w-7 border border-slate-200 shadow-sm">
                                    <AvatarImage src={user.image || ''} />
                                    <AvatarFallback className="bg-slate-100 text-slate-900 font-bold text-xs">{user.name?.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <span className={cn("text-sm font-bold truncate max-w-[100px]")}>{user.name?.split(' ')[0]}</span>
                                <ChevronDown className={cn("h-4 w-4 text-slate-400 opacity-70 ml-0.5 transition-transform duration-200", isUserMenuOpen && "rotate-180")} />
                            </>
                        ) : (
                            <><div className="bg-slate-100 p-1.5 rounded-full"><User className="h-4 w-4" /></div><span className="text-sm font-semibold">Ingresar</span></>
                        )}
                    </Button>
                    {isUserMenuOpen && (
                        <div className="absolute top-full right-0 mt-3 w-60 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-50 text-slate-800">
                            {!user && (
                                <button 
                                    onClick={() => {
                                        setIsUserMenuOpen(false);
                                        setIsLoginModalOpen(true);
                                    }}
                                    className={cn("block w-full text-center py-2.5 rounded-xl font-bold text-white mb-2 transition-transform active:scale-95")} 
                                    style={{ backgroundColor: primaryColor }}
                                >
                                    Entrar Ahora
                                </button>
                            )}
                            <Link href="/profile" className="flex items-center gap-2 px-4 py-2.5 hover:bg-slate-50 rounded-lg text-sm text-slate-600 font-medium"><User className="h-4 w-4" /> Mi Perfil</Link>
                            {user && (
                                <><div className="h-px bg-slate-100 my-2"></div><button onClick={handleLogout} className="flex items-center gap-2 w-full text-left px-4 py-2.5 hover:bg-red-50 text-red-500 rounded-lg text-sm font-medium"><LogOut className="h-4 w-4" /> Cerrar Sesión</button></>
                            )}
                        </div>
                    )}
                </div>

                <div className="lg:hidden">
                    {user ? (
                        <Link href="/profile">
                            <Button variant="ghost" className="h-10 w-10 rounded-full p-0 shrink-0">
                                <Avatar className="h-8 w-8 border border-slate-200">
                                    <AvatarImage src={user.image || ''} />
                                    <AvatarFallback className="bg-slate-100 text-slate-900 font-bold text-xs">{user.name?.charAt(0)}</AvatarFallback>
                                </Avatar>
                            </Button>
                        </Link>
                    ) : (
                        <Button 
                            variant="ghost" 
                            onClick={() => setIsLoginModalOpen(true)}
                            className="h-10 w-10 rounded-full p-0 text-slate-700 hover:bg-slate-100 shrink-0"
                        >
                            <User className="h-6 w-6" />
                        </Button>
                    )}
                </div>

                <Link href="/favorites">
                    <Button variant="ghost" className="hidden md:flex relative h-10 w-10 rounded-full items-center justify-center p-0 transition-colors text-slate-700 hover:bg-slate-100">
                        <Heart className="h-5 w-5" />
                        {loaded && favoritesCount > 0 && <span className={cn("absolute top-0 right-0 h-3.5 w-3.5 rounded-full text-[9px] flex items-center justify-center font-bold shadow-sm ring-2 ring-white", badgeClass)}>{favoritesCount}</span>}
                    </Button>
                </Link>

                <CartSidebar>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full items-center justify-center p-0 transition-colors text-slate-700 hover:bg-slate-100 shrink-0">
                        <ShoppingCart className="h-6 w-6" />
                        {loaded && getTotalItems() > 0 && <span className={cn("absolute top-0 right-0 h-4 w-4 rounded-full text-[10px] flex items-center justify-center font-bold shadow-sm ring-2 ring-white", badgeClass)}>{getTotalItems()}</span>}
                    </Button>
                </CartSidebar>
            </div>
        </div>
      </header>

      <div className="hidden md:block w-full bg-white border-b border-slate-200">
            <div className="w-full max-w-[1473px] mx-auto px-4 lg:px-8 h-[40px] flex items-center justify-between text-sm font-medium text-slate-600">
                <button className="flex items-center gap-2 hover:text-slate-900 transition-colors">
                    <MapPin className="h-4 w-4 text-slate-400" />
                    <Link href="/profile/address"><span>¿Dónde quieres recibir tu pedido?</span></Link>
                    <ChevronDown className="h-3 w-3 opacity-50" />
                </button>
                <div className="flex items-center gap-6">
                    <Link href="/catalogos" className="flex items-center gap-2 hover:text-slate-900 transition-colors"><BookOpen className="h-4 w-4 text-slate-400" />Catálogos</Link>
                    <Link href="/tiendas" className="flex items-center gap-2 hover:text-slate-900 transition-colors"><Store className="h-4 w-4 text-slate-400" />Tiendas</Link>
                    <Link href="/venta-empresa" className={cn("flex items-center gap-2 transition-colors ", brandColorText)}><Truck className="h-4 w-4" />¡Abastece tu hogar por volumen!</Link>
                </div>
            </div>
      </div>
      
      {/* Overlay para menú de categorías */}
      {isMenuOpen && <div className="fixed top-[36px] left-0 right-0 bottom-0 bg-black/40 z-40 transition-opacity duration-300 animate-in fade-in" onClick={() => setIsMenuOpen(false)}/>}
      
      {/* Overlay para menú de usuario */}
      {isUserMenuOpen && <div className="fixed top-[36px] left-0 right-0 bottom-0 bg-black/40 z-40 transition-opacity duration-300 animate-in fade-in" onClick={() => setIsUserMenuOpen(false)}/>}
      
      {/* Login Modal */}
      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)}
        onSwitchToRegister={() => setIsRegisterModalOpen(true)}
        branches={branches}
      />
      
      {/* Register Modal */}
      <RegisterModal 
        isOpen={isRegisterModalOpen} 
        onClose={() => setIsRegisterModalOpen(false)}
        onSwitchToLogin={() => setIsLoginModalOpen(true)}
        branches={branches}
      />
    </>
  );
}