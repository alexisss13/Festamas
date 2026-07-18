'use server';

import prisma from '@/lib/prisma';
import { BannerPosition } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';
import { canAccessEcommerceAdmin } from '@/lib/permissions';
import { getEcommerceContextFromCookie } from '@/lib/ecommerce-context';

// Esquema de validación para el servidor (opcional pero recomendado)
interface BannerData {
  title: string;
  imageUrl: string;
  mobileUrl?: string;
  link?: string;
  position: BannerPosition;
  branchId?: string | null;
}

export async function createBanner(data: BannerData) {
  try {
    const session = await auth();
    if (!session?.user || !canAccessEcommerceAdmin(session.user)) return { success: false, error: 'No autorizado' };
    const { activeBranch } = await getEcommerceContextFromCookie();
    const banner = await prisma.banner.create({
      data: {
        ...data,
        branchId: activeBranch.id,
        active: true,
        order: 0, // Se pone al principio o final según lógica, aquí 0 por defecto
      },
    });
    revalidatePath('/');
    revalidatePath('/admin/banners');
    return { success: true, data: banner };
  } catch (error) {
    console.error('Error createBanner:', error);
    return { success: false, error: 'Error al crear el banner.' };
  }
}

export async function updateBanner(id: string, data: Partial<BannerData>) {
  try {
    const session = await auth();
    if (!session?.user || !canAccessEcommerceAdmin(session.user)) return { success: false, error: 'No autorizado' };
    const { activeBranch } = await getEcommerceContextFromCookie();
    const current = await prisma.banner.findFirst({ where: { id, OR: [{ branchId: activeBranch.id }, { branchId: null }] } });
    if (!current) return { success: false, error: 'Banner no encontrado en la sucursal activa' };
    const banner = await prisma.banner.update({
      where: { id },
      data: { ...data, branchId: current.branchId },
    });
    revalidatePath('/');
    revalidatePath('/admin/banners');
    return { success: true, data: banner };
  } catch (error) {
    console.error('Error updateBanner:', error);
    return { success: false, error: 'Error al actualizar el banner.' };
  }
}

export async function deleteBanner(id: string) {
  try {
    const session = await auth();
    if (!session?.user || !canAccessEcommerceAdmin(session.user)) return { success: false, error: 'No autorizado' };
    const { activeBranch } = await getEcommerceContextFromCookie();
    const current = await prisma.banner.findFirst({ where: { id, OR: [{ branchId: activeBranch.id }, { branchId: null }] } });
    if (!current) return { success: false, error: 'Banner no encontrado en la sucursal activa' };
    await prisma.banner.delete({ where: { id } });
    revalidatePath('/');
    revalidatePath('/admin/banners');
    return { success: true };
  } catch (error) {
    console.error('Error deleteBanner:', error);
    return { success: false, error: 'Error al eliminar el banner.' };
  }
}

export async function getAdminBanners() {
  try {
    const session = await auth();
    if (!session?.user || !canAccessEcommerceAdmin(session.user)) return { success: false, error: 'No autorizado', data: [] };
    const { activeBranch } = await getEcommerceContextFromCookie();
    const banners = await prisma.banner.findMany({
      where: { OR: [{ branchId: activeBranch.id }, { branchId: null }] },
      orderBy: { order: 'asc' }, // Ordenamos por el campo 'order'
    });
    return { success: true, data: banners };
  } catch (error) {
    console.error('Error getAdminBanners:', error);
    return { success: false, error: 'Error al obtener banners.' };
  }
}

export async function reorderBanners(items: { id: string; order: number }[]) {
  try {
    const session = await auth();
    if (!session?.user || !canAccessEcommerceAdmin(session.user)) return { success: false, error: 'No autorizado' };
    const { activeBranch } = await getEcommerceContextFromCookie();
    const allowed = await prisma.banner.count({ where: { id: { in: items.map(item => item.id) }, OR: [{ branchId: activeBranch.id }, { branchId: null }] } });
    if (allowed !== items.length) return { success: false, error: 'Hay banners fuera de la sucursal activa' };
    // Transacción para asegurar integridad
    await prisma.$transaction(
      items.map((item) =>
        prisma.banner.update({
          where: { id: item.id },
          data: { order: item.order },
        })
      )
    );
    revalidatePath('/');
    revalidatePath('/admin/banners');
    return { success: true };
  } catch (error) {
    console.error('Error reorderBanners:', error);
    return { success: false, error: 'Error al reordenar.' };
  }
}
