import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { ProductCard } from '@/components/features/ProductCard';
import { Heart, ArrowRight, Home, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { getEcommerceContextFromCookie } from '@/lib/ecommerce-context';

export const metadata = {
  title: 'Mis Favoritos | FiestasYa',
  description: 'Tus productos guardados y lista de deseos.',
};

export default async function FavoritesPage() {
  const session = await auth();

  // Proteger la ruta
  if (!session?.user) {
    redirect('/auth/login?returnTo=/favorites');
  }

  const { activeBranch } = await getEcommerceContextFromCookie();
  const brandColors = (activeBranch.brandColors as any) || {};
  const primaryColor = brandColors.primary || '#fc4b65';

  // Obtener Favoritos de la BD
  const rawFavorites = await prisma.favorite.findMany({
    where: {
      userId: session.user.id,
    },
    include: {
      product: {
        include: {
          category: {
            select: {
              name: true,
              slug: true,
            }
          },
          variants: { 
            where: { active: true },
            include: {
              stock: {
                where: { branchId: activeBranch.id }
              }
            },
            take: 1, 
            orderBy: { price: 'asc' } 
          }
        }
      }
    },
    orderBy: {
      createdAt: 'desc', 
    }
  });

  // Serializar datos: Convertir todos los Decimal a Number
  const favorites = rawFavorites.map(fav => {
    const firstVariant = fav.product.variants[0];
    const stock = firstVariant?.stock?.find((s: any) => s.branchId === activeBranch.id)?.quantity ?? 0;
    
    return {
      id: fav.id,
      createdAt: fav.createdAt,
      product: {
        id: fav.product.id,
        title: fav.product.title,
        slug: fav.product.slug,
        images: firstVariant?.images?.length ? firstVariant.images : fav.product.images,
        price: Number(firstVariant?.price ?? fav.product.basePrice ?? 0),
        stock,
        isAvailable: fav.product.isAvailable,
        wholesalePrice: fav.product.wholesalePrice ? Number(fav.product.wholesalePrice) : 0,
        wholesaleMinCount: fav.product.wholesaleMinCount,
        discountPercentage: fav.product.discountPercentage,
        tags: fav.product.tags,
        createdAt: fav.product.createdAt,
        barcode: firstVariant?.barcode ?? null,
        category: fav.product.category,
      }
    };
  });

  return (
    <div className="min-h-screen bg-white">
      
      {/* Breadcrumb */}
      <div className="border-b border-slate-200 bg-slate-50/50">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-3">
            <Link href="/" className="hover:text-slate-900 transition-colors">
              <Home className="h-4 w-4" />
            </Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-slate-900 font-medium">Mis Favoritos</span>
          </div>
          <div className="flex items-center gap-3">
            <div 
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{ backgroundColor: `${primaryColor}15` }}
            >
              <Heart 
                className="w-6 h-6 fill-current" 
                style={{ color: primaryColor }}
              />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
                Mis Favoritos
              </h1>
              <p className="text-sm text-slate-600">
                {favorites.length} {favorites.length === 1 ? 'producto guardado' : 'productos guardados'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-8">
        {favorites.length === 0 ? (
          
          // Estado vacío
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div 
              className="w-24 h-24 rounded-full flex items-center justify-center mb-6"
              style={{ backgroundColor: `${primaryColor}10` }}
            >
              <Heart 
                className="w-12 h-12 opacity-50" 
                style={{ color: primaryColor }}
              />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">
              Aún no tienes favoritos
            </h2>
            <p className="text-slate-500 max-w-md mb-8">
              Explora nuestra tienda y guarda los productos que más te gusten haciendo clic en el corazón.
            </p>
            <Link href="/">
              <Button 
                size="lg" 
                className="text-white font-bold px-8 rounded-full shadow-lg hover:shadow-xl transition-all"
                style={{ backgroundColor: primaryColor }}
              >
                Explorar Productos 
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>

        ) : (

          // Grid de productos (mismo estilo que categorías)
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4 lg:gap-5">
            {favorites.map((fav, index) => (
              <div 
                key={fav.id} 
                className="animate-in fade-in slide-in-from-bottom-2 duration-500" 
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <ProductCard product={fav.product as any} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
