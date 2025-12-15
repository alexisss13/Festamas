'use server';

import prisma from '@/lib/prisma';
import { BannerPosition, Division } from '@prisma/client';
import { revalidatePath } from 'next/cache';

export async function createBanner(data: {
  title: string;
  imageUrl: string;
  mobileUrl?: string; // 👈 Agregamos este campo opcional
  link?: string;
  position: BannerPosition;
  division: Division;
}) {
  try {
    const banner = await prisma.banner.create({
      data: {
        ...data,
        active: true,
        order: 0,
      },
    });
    revalidatePath('/'); 
    return { success: true, data: banner };
  } catch (error) {
    console.error(error);
    return { success: false, error: 'Error al crear banner' };
  }
}

// Obtener todos los banners para listarlos en el Admin
export async function getAdminBanners() {
  try {
    const banners = await prisma.banner.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return { success: true, data: banners };
  } catch (error) {
    return { success: false, error: 'Error al obtener banners' };
  }
}

// Eliminar un banner
export async function deleteBanner(id: string) {
  try {
    await prisma.banner.delete({ where: { id } });
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Error al eliminar' };
  }
}