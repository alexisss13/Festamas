'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import cloudinaryLoader from '@/lib/cloudinaryLoader';
import { Facebook, Instagram, CreditCard, ShieldCheck, Phone, MapPin, ChevronDown, Clock } from 'lucide-react';
import { useUIStore } from '@/store/ui';
import { cn } from '@/lib/utils';

interface Category {
  id: string;
  name: string;
  slug: string;
  ecommerceCode: string | null;
}

interface FooterClientProps {
  allCategories: Category[];
}

export function FooterClient({ allCategories }: FooterClientProps) {
  const { activeBranchId, branches } = useUIStore();
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);

  const activeBranch = branches.find((branch) => branch.id === activeBranchId) ?? branches[0];
  const brandName = activeBranch?.name || 'Festamas';
  const primaryColor = activeBranch?.brandColors?.primary ?? '#fc4b65';

  const activeLogo = activeBranch?.logos?.imagotipoWhite ?? activeBranch?.logos?.alternate ?? '/images/IconoFestamas.png';
  const branchAddress = activeBranch?.address ?? 'Trujillo, Perú';
  const branchPhone = activeBranch?.phone ?? '---';

  const displayCategories = allCategories
    .filter((cat) => cat.ecommerceCode === activeBranch?.ecommerceCode)
    .slice(0, 6);

  const toggleAccordion = (section: string) => {
    setOpenAccordion(prev => prev === section ? null : section);
  };

  return (
    <footer
      className="pt-8 md:pt-16 pb-6 md:pb-8 transition-colors border-t border-white/20"
      style={{ backgroundColor: primaryColor }}
    >
      <div className="container mx-auto px-4 md:px-8 lg:px-10 xl:px-12">

        {/* GRID PRINCIPAL */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-y-0 md:gap-y-10 gap-x-8 lg:gap-12 mb-6 md:mb-16">

          {/* 1. MARCA */}
          <div className="flex flex-col gap-3 md:gap-6 pb-6 md:pb-0 border-b md:border-none border-white/20">
            <div className="flex items-center justify-between md:items-start md:flex-col md:gap-6">
              <div className="relative h-8 w-32 md:h-10 md:w-40">
                <Image loader={cloudinaryLoader} src={activeLogo} alt={brandName} fill sizes="(max-width: 768px) 128px, 160px" className="object-contain object-left" />
              </div>
              <div className="flex gap-2 md:gap-4">
                <a href="#" className="h-8 w-8 md:h-10 md:w-10 flex items-center justify-center rounded-full transition-colors shadow-sm bg-white/10 text-white hover:bg-white/20">
                  <Facebook className="h-4 w-4 md:h-5 md:w-5" />
                </a>
                <a href="#" className="h-8 w-8 md:h-10 md:w-10 flex items-center justify-center rounded-full transition-colors shadow-sm bg-white/10 text-white hover:bg-white/20">
                  <Instagram className="h-4 w-4 md:h-5 md:w-5" />
                </a>
              </div>
            </div>
            <p className="text-[12px] md:text-sm leading-relaxed max-w-sm mt-1 md:mt-0 text-white/90">
              Especialistas en sonrisas. Encuentra los mejores artículos.
            </p>
          </div>

          {/* 2. EXPLORA */}
          <div className="flex flex-col md:gap-6 py-4 md:py-0 border-b md:border-none border-white/20">
            <button onClick={() => toggleAccordion('explora')} className="flex items-center justify-between w-full md:cursor-auto text-left">
              <h3 className="font-bold text-[13px] md:text-lg tracking-tight uppercase md:normal-case text-white">Explora</h3>
              <ChevronDown className={cn("h-4 w-4 transition-transform duration-300 md:hidden text-white", openAccordion === 'explora' && "rotate-180")} />
            </button>
            <ul className={cn("flex-col gap-1 md:gap-3 text-[12px] md:text-sm mt-3 md:mt-0 animate-in fade-in slide-in-from-top-2 duration-300", openAccordion === 'explora' ? "flex" : "hidden md:flex")}>
              {displayCategories.map((cat) => (
                <li key={cat.id}>
                  <Link href={`/category/${cat.slug}`} className="capitalize line-clamp-1 text-white/80 hover:text-white transition-colors block py-1.5 md:py-0">{cat.name}</Link>
                </li>
              ))}
              <li>
                <Link href="/search?q=" className="text-white font-medium hover:underline block py-1.5 md:py-0 md:mt-2">Ver catálogo &rarr;</Link>
              </li>
            </ul>
          </div>

          {/* 3. AYUDA */}
          <div className="flex flex-col md:gap-6 py-4 md:py-0 border-b md:border-none border-white/20">
            <button onClick={() => toggleAccordion('ayuda')} className="flex items-center justify-between w-full md:cursor-auto text-left">
              <h3 className="font-bold text-[13px] md:text-lg tracking-tight uppercase md:normal-case text-white">Ayuda</h3>
              <ChevronDown className={cn("h-4 w-4 transition-transform duration-300 md:hidden text-white", openAccordion === 'ayuda' && "rotate-180")} />
            </button>
            <ul className={cn("flex-col gap-1 md:gap-3 text-[12px] md:text-sm mt-3 md:mt-0 animate-in fade-in slide-in-from-top-2 duration-300", openAccordion === 'ayuda' ? "flex" : "hidden md:flex")}>
              <li><Link href="/profile/orders" className="text-white/80 hover:text-white transition-colors block py-1.5 md:py-0">Mis Pedidos</Link></li>
              <li><Link href="/terms" className="text-white/80 hover:text-white transition-colors block py-1.5 md:py-0">Términos y Condiciones</Link></li>
              <li><Link href="/privacy" className="text-white/80 hover:text-white transition-colors block py-1.5 md:py-0">Política de Privacidad</Link></li>
              <li>
                <a
                  href="https://docs.google.com/forms/d/e/1FAIpQLSeRwJVEuZlu14QhTtBkNIVToNBP7oUcgUJhf2tEvaAI5DR9rg/viewform"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/80 hover:text-white transition-colors block py-1.5 md:py-0"
                >
                  Devoluciones
                </a>
              </li>
              <li><Link href="/tiendas" className="text-white/80 hover:text-white transition-colors block py-1.5 md:py-0">Nuestras Tiendas</Link></li>
            </ul>
          </div>

          {/* 4. CONTACTO */}
          <div className="flex flex-col gap-4 md:gap-6 pt-5 md:pt-0">
            <h3 className="font-bold text-[13px] md:text-lg tracking-tight uppercase md:normal-case text-white">Contáctanos</h3>
            <ul className="flex flex-col gap-3.5 text-[12px] md:text-sm text-white/90">
              <li className="flex items-start gap-3">
                <MapPin className="h-4 w-4 md:h-5 md:w-5 shrink-0 mt-0.5 text-white" />
                <span className="leading-tight">
                  {branchAddress}<br />
                  <span className="text-[10px] md:text-xs opacity-80 font-medium mt-0.5 block">Envíos a todo el país</span>
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Clock className="h-4 w-4 md:h-5 md:w-5 shrink-0 mt-0.5 text-white" />
                <span className="leading-tight">
                  Lun - Sáb: 9:00 AM - 7:00 PM<br />
                  <span className="text-[10px] md:text-xs opacity-80 font-medium mt-0.5 block">Dom: 9:00 AM - 1:00 PM</span>
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-4 w-4 md:h-5 md:w-5 shrink-0 text-white" />
                <span className="leading-tight tracking-wide">{branchPhone}</span>
              </li>
            </ul>
            <div className="flex flex-col justify-center lg:justify-start lg:pt-5 lg:border-t border-white/20">
              <p className="text-[10px] md:text-xs mb-2 md:mb-3 font-semibold tracking-wide uppercase text-white/90">Pago Seguro</p>
              <div className="flex gap-2 md:gap-3 text-white/90">
                <CreditCard className="h-6 w-6 md:h-8 md:w-8" />
                <ShieldCheck className="h-6 w-6 md:h-8 md:w-8" />
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER BOTTOM */}
        <div className="border-t border-white/20 pt-5 md:pt-8 flex flex-col md:flex-row justify-between items-center gap-3 md:gap-6 text-[10px] md:text-xs text-center md:text-left text-white/70">
          <p className="font-medium">&copy; {new Date().getFullYear()} {brandName}. Todos los derechos reservados.</p>
          <div className="flex gap-6 font-semibold">
            <Link href="/admin/dashboard" className="hover:underline transition-all">Admin Panel</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}