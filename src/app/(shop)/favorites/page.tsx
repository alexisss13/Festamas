import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { ProductCard } from '@/components/features/ProductCard';
import { Heart, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { cookies } from 'next/headers';
import { cn } from '@/lib/utils';

export const metadata = {
  title: 'Mis Favoritos | Festamas',
  description: 'Tus productos guardados y lista de deseos.',
};

export default async function FavoritesPage() {
  const session = await auth();

  // 1. Proteger la ruta
  if (!session?.user) {
    redirect('/auth/login?returnTo=/favorites');
  }

  // 2. Detectar División
  const cookieStore = await cookies();
  const division = cookieStore.get('festamas_division')?.value || 'JUGUETERIA';
  const isFestamas = division === 'JUGUETERIA';
  
  // Colores dinámicos
  const brandText = isFestamas ? 'text-[#fc4b65]' : 'text-[#ec4899]';
  const brandBg = isFestamas ? 'bg-[#fc4b65] hover:bg-[#e11d48]' : 'bg-[#ec4899] hover:bg-[#be185d]';
  const brandLightBg = isFestamas ? 'bg-red-50' : 'bg-pink-50';

  // 3. Obtener Favoritos de la BD
  const rawFavorites = await prisma.favorite.findMany({
    where: {
      userId: session.user.id,
    },
    include: {
      product: true, 
    },
    orderBy: {
      createdAt: 'desc', 
    }
  });

  // 4. 🛡️ SANITIZAR DATOS: Convertir Decimal a Number
  // Esto evita el error: "Only plain objects can be passed to Client Components"
  const favorites = rawFavorites.map(fav => ({
    ...fav,
    product: {
      ...fav.product,
      price: fav.product.price.toNumber(), // Decimal -> Number
      wholesalePrice: fav.product.wholesalePrice ? fav.product.wholesalePrice.toNumber() : 0, // Decimal -> Number
    }
  }));

  return (
    <div className="min-h-[80vh] w-full max-w-[1600px] mx-auto px-4 lg:px-8 py-8 md:py-12">
      
      {/* HEADER DE PÁGINA */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 border-b border-slate-100 pb-6">
        <div>
          <h1 className={cn("text-3xl md:text-4xl font-extrabold tracking-tight mb-2 flex items-center gap-3", brandText)}>
            <Heart className="w-8 h-8 md:w-10 md:h-10 fill-current" /> 
            Mis Favoritos
          </h1>
          <p className="text-slate-500 text-lg">
            Guardaste <span className="font-bold text-slate-800">{favorites.length}</span> productos en tu lista de deseos.
          </p>
        </div>
        
        {/* Botón "Ver Carrito" eliminado por redundante */}
      </div>

      {/* CONTENIDO */}
      {favorites.length === 0 ? (
        
        // 💔 ESTADO VACÍO (EMPTY STATE)
        <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in zoom-in duration-500">
          <div className={cn("w-24 h-24 rounded-full flex items-center justify-center mb-6", brandLightBg)}>
            <Heart className={cn("w-12 h-12 opacity-50", brandText)} />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">
            Aún no tienes favoritos
          </h2>
          <p className="text-slate-500 max-w-md mb-8">
            Explora nuestra tienda y guarda los productos que más te gusten haciendo clic en el corazón.
          </p>
          <Link href="/">
            <Button size="lg" className={cn("text-white font-bold px-8 rounded-full shadow-lg hover:shadow-xl transition-all hover:-translate-y-1", brandBg)}>
              Explorar Productos <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>

      ) : (

        // ❤️ GRID DE PRODUCTOS
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
          {favorites.map((fav) => (
            <div key={fav.id} className="animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-backwards" style={{ animationDelay: '100ms' }}>
               {/* Ya no necesitamos 'as any' porque convertimos los decimales arriba */}
               <ProductCard product={fav.product as any} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}