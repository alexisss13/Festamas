'use server';

import prisma from '@/lib/prisma';
import { Banner, BannerPosition, Division } from '@prisma/client';
import { revalidatePath } from 'next/cache';

// Crear un nuevo banner desde el Admin
export async function createBanner(data: {
  title: string;
  imageUrl: string;
  link?: string;
  position: BannerPosition;
  division: Division;
}) {
  try {
    const banner = await prisma.banner.create({
      data: {
        ...data,
        active: true,
        order: 0, // Por defecto al inicio
      },
    });
    revalidatePath('/'); // Actualizar el home para que se vea al instante
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