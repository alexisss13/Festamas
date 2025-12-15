'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Facebook, Instagram, CreditCard, ShieldCheck, Phone, MapPin } from 'lucide-react';
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
  
  const isToys = currentDivision === 'JUGUETERIA';
  const brandName = isToys ? 'Festamas' : 'FiestasYa';

  // --- 🎨 COLORES DINÁMICOS ---
  // Festamas: Color de marca #fc4b65
  // FiestasYa: Color de marca #FF0090 (Rosa Fuerte)
  
  // 1. Fondo del Footer
  const footerBg = isToys ? 'bg-[#fc4b65]' : 'bg-white';

  // 2. Color de Títulos
  const titleColor = isToys ? 'text-white' : 'text-[#FF0090]';

  // 3. Color de Texto General
  const textColor = isToys ? 'text-white/90' : 'text-slate-600';

  // 4. Color de Enlaces (y su hover)
  const linkClass = isToys 
    ? 'text-white/90 hover:text-white' 
    : 'text-slate-600 hover:text-[#FF0090]';
  
  // 5. Color de "Ver todo"
  const viewAllClass = isToys
    ? 'text-white hover:underline'
    : 'text-[#FF0090] font-medium hover:underline';

  // 6. Iconos de Redes Sociales
  const socialIconClass = isToys 
    ? 'bg-white/10 text-white hover:bg-white/20' 
    : 'bg-pink-50 text-[#FF0090] hover:bg-pink-100';

  // 7. Iconos de Contacto (Phone, MapPin)
  const contactIconColor = isToys ? 'text-white' : 'text-[#FF0090]';

  // 8. Borde de separación inferior
  const borderColor = isToys ? 'border-white/20' : 'border-slate-100';
  
  // 9. Color de texto del copyright
  const copyrightColor = isToys ? 'text-white/70' : 'text-slate-400';


  // Logos
  const iconFestamas = '/images/IconoFestamas.png'; // Asegúrate que este icono sea blanco o se vea bien sobre fondo rosa
  const iconFiestasYa = '/images/IconoFiestasYa.png';
  const activeLogo = isToys ? iconFestamas : iconFiestasYa;

  // Filtrar categorías
  const displayCategories = allCategories
    .filter(cat => cat.division === currentDivision)
    .slice(0, 6);

  return (
    <footer className={cn("pt-16 pb-8 text-sm transition-colors border-t", footerBg, borderColor)}>
      <div className="container mx-auto px-4 lg:px-8">
        
        {/* GRID PRINCIPAL */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          {/* 1. MARCA E INFORMACIÓN */}
          <div className="space-y-6">
            <div className="relative h-10 w-40">
               {/* Para Festamas, idealmente usarías una versión blanca del logo */}
               <Image 
                 src={activeLogo} 
                 alt={brandName} 
                 fill 
                 className="object-contain object-left" 
               />
            </div>
            <p className={cn("leading-relaxed", textColor)}>
              {isToys 
                ? "Especialistas en sonrisas. Encuentra los juguetes más deseados y las últimas novedades para todas las edades."
                : "Celebra de verdad. Todo lo que necesitas para que tu fiesta sea inolvidable en un solo lugar."
              }
            </p>
            
            <div className="flex gap-4">
                <a href="#" className={cn("h-10 w-10 flex items-center justify-center rounded-full transition-colors", socialIconClass)}>
                    <Facebook className="h-5 w-5" />
                </a>
                <a href="#" className={cn("h-10 w-10 flex items-center justify-center rounded-full transition-colors", socialIconClass)}>
                    <Instagram className="h-5 w-5" />
                </a>
            </div>
          </div>

          {/* 2. EXPLORA (DINÁMICO) */}
          <div>
            <h3 className={cn("font-bold text-lg mb-6", titleColor)}>Explora {brandName}</h3>
            <ul className="space-y-3">
              {displayCategories.map((cat) => (
                <li key={cat.id}>
                  <Link 
                    href={`/category/${cat.slug}`} 
                    className={cn("transition-colors capitalize", linkClass)}
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/search?q=" className={cn("transition-colors", viewAllClass)}>
                  Ver todo el catálogo &rarr;
                </Link>
              </li>
            </ul>
          </div>

          {/* 3. AYUDA */}
          <div>
            <h3 className={cn("font-bold text-lg mb-6", titleColor)}>Ayuda</h3>
            <ul className="space-y-3">
              <li><Link href="/orders" className={cn("transition-colors", linkClass)}>Mis Pedidos</Link></li>
              <li><Link href="/terms" className={cn("transition-colors", linkClass)}>Términos y Condiciones</Link></li>
              <li><Link href="/privacy" className={cn("transition-colors", linkClass)}>Política de Privacidad</Link></li>
              <li>
                  <a 
                    href="https://docs.google.com/forms/d/e/1FAIpQLSeRwJVEuZlu14QhTtBkNIVToNBP7oUcgUJhf2tEvaAI5DR9rg/viewform" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={cn("transition-colors", linkClass)}
                  >
                    Solicitar Devolución
                  </a>
              </li>
              <li><Link href="/tiendas" className={cn("transition-colors", linkClass)}>Nuestras Tiendas</Link></li>
            </ul>
          </div>

          {/* 4. CONTACTO Y PAGOS */}
          <div className="space-y-6">
            <h3 className={cn("font-bold text-lg mb-6", titleColor)}>Contáctanos</h3>
            <ul className={cn("space-y-4", textColor)}>
                <li className="flex items-start gap-3">
                    <Phone className={cn("h-5 w-5 shrink-0", contactIconColor)} />
                    <span>(01) 615-6002<br/><span className="text-xs opacity-80">Lun-Dom 9am a 6pm</span></span>
                </li>
                <li className="flex items-start gap-3">
                    <MapPin className={cn("h-5 w-5 shrink-0", contactIconColor)} />
                    <span>Trujillo, Perú<br/><span className="text-xs opacity-80">Envíos a todo el país</span></span>
                </li>
            </ul>

            <div className={cn("pt-4 border-t", borderColor)}>
                <p className={cn("text-xs mb-3 font-medium", textColor)}>Métodos de pago seguros</p>
                <div className={cn("flex gap-2", isToys ? "text-white/80" : "text-slate-300")}>
                    <CreditCard className="h-8 w-8" />
                    <ShieldCheck className="h-8 w-8" />
                </div>
            </div>
          </div>
        </div>

        {/* FOOTER BOTTOM */}
        <div className={cn("border-t pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs", borderColor, copyrightColor)}>
          <p>&copy; {new Date().getFullYear()} {brandName} E-commerce. Todos los derechos reservados.</p>
          <div className="flex gap-6">
             <Link href="/admin/dashboard" className="hover:underline">Admin</Link>
             {/* Se eliminó la frase y el emoji para mayor profesionalismo */}
          </div>
        </div>
      </div>
    </footer>
  );
}