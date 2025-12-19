import prisma from '@/lib/prisma';
import { getAdminDivision } from '@/actions/admin-settings';
import { POSInterface } from '@/components/admin/pos/POSInterface';

export const dynamic = 'force-dynamic'; // Asegurar que no cachee estáticamente

export default async function POSPage() {
  const division = await getAdminDivision();

  // Obtenemos productos de la división actual
  const products = await prisma.product.findMany({
    where: { 
        division,
        isAvailable: true 
    },
    take: 50,
    select: {
        id: true,
        title: true,
        price: true,
        stock: true,
        images: true,
        barcode: true,
        slug: true,
        wholesalePrice: true,
        wholesaleMinCount: true,
        discountPercentage: true,
        category: { select: { name: true, slug: true } }
    },
    orderBy: { title: 'asc' }
  });

  const formattedProducts = products.map(p => ({
    ...p,
    price: Number(p.price),
    wholesalePrice: p.wholesalePrice ? Number(p.wholesalePrice) : 0,
  }));

  return (
    // 👇 FIX LAYOUT: h-screen y márgenes negativos para llenar la pantalla
    <div className="w-auto h-screen -m-4 md:-m-8 bg-slate-50 overflow-hidden">
      <POSInterface 
        key={division} // 🔑 TRUCAZO: Esto fuerza a React a reiniciar todo al cambiar tienda
        initialProducts={formattedProducts} 
        division={division} 
      />
    </div>
  );
}