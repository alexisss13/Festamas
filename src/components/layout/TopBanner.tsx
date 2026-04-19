import prisma from '@/lib/prisma';
import { getEcommerceContextFromCookie } from '@/lib/ecommerce-context';
import { TopBannerClient } from './TopBannerClient';

export async function TopBanner() {
  const { activeBranch } = await getEcommerceContextFromCookie();
  
  // Obtener todos los banners TOP_BAR activos para la sucursal actual
  const banners = await prisma.banner.findMany({
    where: {
      active: true,
      position: 'TOP_BAR',
      OR: [
        { branchId: activeBranch.id },
        { branchId: null } // Banners globales
      ]
    },
    orderBy: { order: 'asc' }
  });

  if (banners.length === 0) return null;

  // Construir URLs de Cloudinary
  const getCloudinaryUrl = (publicId: string) => {
    if (publicId.startsWith('http')) return publicId;
    return `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/${publicId}`;
  };

  const bannersData = banners.map(banner => ({
    id: banner.id,
    title: banner.title,
    desktopUrl: getCloudinaryUrl(banner.imageUrl),
    mobileUrl: getCloudinaryUrl(banner.mobileUrl || banner.imageUrl),
    link: banner.link
  }));

  return <TopBannerClient banners={bannersData} />;
}
