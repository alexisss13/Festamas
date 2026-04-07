import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { BannerForm } from '@/components/admin/BannerForm';

interface Props { params: Promise<{ id: string }> }

export default async function EditBannerPage({ params }: Props) {
  const { id } = await params;
  
  const banner = await prisma.banner.findUnique({ where: { id } });
  
  if (!banner) notFound();

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-white min-h-[calc(100vh-4rem)] flex justify-center">
        <BannerForm banner={banner} />
    </div>
  );
}