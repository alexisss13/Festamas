'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Facebook, Instagram, CreditCard, ShieldCheck, Phone, MapPin, ChevronDown, Clock } from 'lucide-react';
import { useUIStore, Division } from '@/store/ui';
import { cn } from '@/lib/utils';

interface Category {
  id: string;
  name: string;
  slug: string;
  division: Division;
}

interface FooterClientProps {
  allCategories: Category[];
}

export function FooterClient({ allCategories }: FooterClientProps) {
  const { currentDivision } = useUIStore();
  
  // Estado para controlar qué menú (acordeón) está abierto en móvil
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);

  const isToys = currentDivision === 'JUGUETERIA';
  const brandName = isToys ? 'Festamas' : 'FiestasYa';

  // --- 🎨 COLORES DINÁMICOS ---
  const footerBg = isToys ? 'bg-[#fc4b65]' : 'bg-white';
  const titleColor = isToys ? 'text-white' : 'text-[#FF0090]';
  const textColor = isToys ? 'text-white/90' : 'text-slate-600';
  
  const linkClass = isToys 
    ? 'text-white/80 hover:text-white transition-colors block py-1.5 md:py-0' 
    : 'text-slate-500 hover:text-[#FF0090] transition-colors block py-1.5 md:py-0';
  
  const viewAllClass = isToys
    ? 'text-white font-medium hover:underline block py-1.5 md:py-0 md:mt-2'
    : 'text-[#FF0090] font-medium hover:underline block py-1.5 md:py-0 md:mt-2';

  const socialIconClass = isToys 
    ? 'bg-white/10 text-white hover:bg-white/20' 
    : 'bg-pink-50 text-[#FF0090] hover:bg-pink-100';

  const contactIconColor = isToys ? 'text-white' : 'text-[#FF0090]';
  const borderColor = isToys ? 'border-white/20' : 'border-slate-200';
  const copyrightColor = isToys ? 'text-white/70' : 'text-slate-400';

  const iconFestamas = '/images/IconoFestamas.png';
  const iconFiestasYa = '/images/IconoFiestasYa.png';
  const activeLogo = isToys ? iconFestamas : iconFiestasYa;

  const displayCategories = allCategories
    .filter(cat => cat.division === currentDivision)
    .slice(0, 6);

  const toggleAccordion = (section: string) => {
    setOpenAccordion(prev => prev === section ? null : section);
  };

  return (
    <footer className={cn("pt-8 md:pt-16 pb-6 md:pb-8 transition-colors border-t", footerBg, borderColor)}>
      <div className="container mx-auto px-4 md:px-8 lg:px-10 xl:px-12">
        
        {/* GRID PRINCIPAL: 1 columna en móvil, 2 en tablet, 4 en desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-y-0 md:gap-y-10 gap-x-8 lg:gap-12 mb-6 md:mb-16">
          
          {/* 1. MARCA E INFORMACIÓN */}
          <div className={cn("flex flex-col gap-3 md:gap-6 pb-6 md:pb-0 border-b md:border-none", borderColor)}>
            
            {/* 🔥 FIX UI MÓVIL: Logo a la izquierda, Redes a la derecha en la misma línea */}
            <div className="flex items-center justify-between md:items-start md:flex-col md:gap-6">
                <div className="relative h-8 w-32 md:h-10 md:w-40">
                   <Image 
                     src={activeLogo} 
                     alt={brandName} 
                     fill 
                     className="object-contain object-left" 
                   />
                </div>
                
                <div className="flex gap-2 md:gap-4">
                    <a href="#" className={cn("h-8 w-8 md:h-10 md:w-10 flex items-center justify-center rounded-full transition-colors shadow-sm", socialIconClass)}>
                        <Facebook className="h-4 w-4 md:h-5 md:w-5" />
                    </a>
                    <a href="#" className={cn("h-8 w-8 md:h-10 md:w-10 flex items-center justify-center rounded-full transition-colors shadow-sm", socialIconClass)}>
                        <Instagram className="h-4 w-4 md:h-5 md:w-5" />
                    </a>
                </div>
            </div>

            <p className={cn("text-[12px] md:text-sm leading-relaxed max-w-sm mt-1 md:mt-0", textColor)}>
              {isToys 
                ? "Especialistas en sonrisas. Encuentra los juguetes más deseados y las últimas novedades."
                : "Celebra de verdad. Todo lo que necesitas para que tu fiesta sea inolvidable."
              }
            </p>
          </div>

          {/* 2. EXPLORA (ACORDEÓN EN MÓVIL) */}
          <div className={cn("flex flex-col md:gap-6 py-4 md:py-0 border-b md:border-none", borderColor)}>
            <button 
              onClick={() => toggleAccordion('explora')}
              className="flex items-center justify-between w-full md:cursor-auto text-left"
            >
              <h3 className={cn("font-bold text-[13px] md:text-lg tracking-tight uppercase md:normal-case", titleColor)}>
                Explora
              </h3>
              <ChevronDown className={cn("h-4 w-4 transition-transform duration-300 md:hidden", titleColor, openAccordion === 'explora' && "rotate-180")} />
            </button>
            
            <ul className={cn(
              "flex-col gap-1 md:gap-3 text-[12px] md:text-sm mt-3 md:mt-0 animate-in fade-in slide-in-from-top-2 duration-300", 
              openAccordion === 'explora' ? "flex" : "hidden md:flex"
            )}>
              {displayCategories.map((cat) => (
                <li key={cat.id}>
                  <Link href={`/category/${cat.slug}`} className={cn("capitalize line-clamp-1", linkClass)}>
                    {cat.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/search?q=" className={viewAllClass}>
                  Ver catálogo &rarr;
                </Link>
              </li>
            </ul>
          </div>

          {/* 3. AYUDA (ACORDEÓN EN MÓVIL) */}
          <div className={cn("flex flex-col md:gap-6 py-4 md:py-0 border-b md:border-none", borderColor)}>
            <button 
              onClick={() => toggleAccordion('ayuda')}
              className="flex items-center justify-between w-full md:cursor-auto text-left"
            >
              <h3 className={cn("font-bold text-[13px] md:text-lg tracking-tight uppercase md:normal-case", titleColor)}>
                Ayuda
              </h3>
              <ChevronDown className={cn("h-4 w-4 transition-transform duration-300 md:hidden", titleColor, openAccordion === 'ayuda' && "rotate-180")} />
            </button>

            <ul className={cn(
              "flex-col gap-1 md:gap-3 text-[12px] md:text-sm mt-3 md:mt-0 animate-in fade-in slide-in-from-top-2 duration-300", 
              openAccordion === 'ayuda' ? "flex" : "hidden md:flex"
            )}>
              <li><Link href="/profile/orders" className={linkClass}>Mis Pedidos</Link></li>
              <li><Link href="/terms" className={linkClass}>Términos y Condiciones</Link></li>
              <li><Link href="/privacy" className={linkClass}>Política de Privacidad</Link></li>
              <li>
                  <a 
                    href="https://docs.google.com/forms/d/e/1FAIpQLSeRwJVEuZlu14QhTtBkNIVToNBP7oUcgUJhf2tEvaAI5DR9rg/viewform" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={linkClass}
                  >
                    Devoluciones
                  </a>
              </li>
              <li><Link href="/tiendas" className={linkClass}>Nuestras Tiendas</Link></li>
            </ul>
          </div>

          {/* 4. CONTACTO Y PAGOS */}
          <div className="flex flex-col gap-4 md:gap-6 pt-5 md:pt-0">
            <h3 className={cn("font-bold text-[13px] md:text-lg tracking-tight uppercase md:normal-case", titleColor)}>Contáctanos</h3>
            
            <div className="flex flex-col gap-4 md:gap-6">
                {/* 🔥 FIX: Horarios y Contactos reestructurados */}
                <ul className={cn("flex flex-col gap-3.5 text-[12px] md:text-sm", textColor)}>
                    <li className="flex items-start gap-3">
                        <MapPin className={cn("h-4 w-4 md:h-5 md:w-5 shrink-0 mt-0.5", contactIconColor)} />
                        <span className="leading-tight">
                            Trujillo, Perú<br/>
                            <span className="text-[10px] md:text-xs opacity-80 font-medium mt-0.5 block">Envíos a todo el país</span>
                        </span>
                    </li>
                    <li className="flex items-start gap-3">
                        <Clock className={cn("h-4 w-4 md:h-5 md:w-5 shrink-0 mt-0.5", contactIconColor)} />
                        <span className="leading-tight">
                            Lun - Sáb: 9:00 AM - 7:00 PM<br/>
                            <span className="text-[10px] md:text-xs opacity-80 font-medium mt-0.5 block">Dom: 9:00 AM - 1:00 PM</span>
                        </span>
                    </li>
                    <li className="flex items-center gap-3">
                        <Phone className={cn("h-4 w-4 md:h-5 md:w-5 shrink-0", contactIconColor)} />
                        <span className="leading-tight tracking-wide">948 679 563</span>
                    </li>
                </ul>

                <div className={cn("flex flex-col justify-center lg:justify-start lg:pt-5 lg:border-t", borderColor)}>
                    <p className={cn("text-[10px] md:text-xs mb-2 md:mb-3 font-semibold tracking-wide uppercase", textColor)}>Pago Seguro</p>
                    <div className={cn("flex gap-2 md:gap-3", isToys ? "text-white/90" : "text-slate-300")}>
                        <CreditCard className="h-6 w-6 md:h-8 md:w-8" />
                        <ShieldCheck className="h-6 w-6 md:h-8 md:w-8" />
                    </div>
                </div>
            </div>
          </div>
        </div>

        {/* FOOTER BOTTOM */}
        <div className={cn("border-t pt-5 md:pt-8 flex flex-col md:flex-row justify-between items-center gap-3 md:gap-6 text-[10px] md:text-xs text-center md:text-left", borderColor, copyrightColor)}>
          <p className="font-medium">&copy; {new Date().getFullYear()} {brandName}. Todos los derechos reservados.</p>
          <div className="flex gap-6 font-semibold">
             <Link href="/admin/dashboard" className="hover:underline transition-all">Admin Panel</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}