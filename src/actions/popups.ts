'use server';

import { revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma';
import { auth } from '@/auth';
import { canAccessEcommerceAdmin } from '@/lib/permissions';
import { getEcommerceContextFromCookie } from '@/lib/ecommerce-context';

export async function getActivePopup() {
  const { activeBranch } = await getEcommerceContextFromCookie();
  return prisma.popupConfig.findFirst({
    where: { branchId: activeBranch.id, isActive: true, AND: [{ OR: [{ startsAt: null }, { startsAt: { lte: new Date() } }] }, { OR: [{ endsAt: null }, { endsAt: { gte: new Date() } }] }] },
    orderBy: { updatedAt: 'desc' },
  });
}

export async function getAdminPopup() {
  const session = await auth();
  if (!session?.user || !canAccessEcommerceAdmin(session.user)) return { success: false, error: 'No autorizado' };
  const { activeBranch } = await getEcommerceContextFromCookie();
  const popup = await prisma.popupConfig.findFirst({ where: { branchId: activeBranch.id }, orderBy: { updatedAt: 'desc' } });
  return { success: true, popup };
}

export async function savePopup(data: { imageUrl: string; link?: string | null; isActive: boolean; showOnce: boolean; startsAt?: string | null; endsAt?: string | null }) {
  try {
    const session = await auth();
    if (!session?.user || !canAccessEcommerceAdmin(session.user)) return { success: false, error: 'No autorizado' };
    const { activeBranch } = await getEcommerceContextFromCookie();
    const existing = await prisma.popupConfig.findFirst({ where: { branchId: activeBranch.id } });
    const startsAt = data.startsAt ? new Date(data.startsAt) : null;
    const endsAt = data.endsAt ? new Date(data.endsAt) : null;
    if (startsAt && endsAt && endsAt <= startsAt) return { success: false, error: 'La fecha final debe ser posterior a la inicial' };
    const payload = { ...data, link: data.link || null, startsAt, endsAt };
    const popup = existing
      ? await prisma.popupConfig.update({ where: { id: existing.id }, data: payload })
      : await prisma.popupConfig.create({ data: { ...payload, branchId: activeBranch.id } });
    revalidatePath('/');
    revalidatePath('/admin/popups');
    return { success: true, popup };
  } catch (error) {
    console.error('Error al guardar popup:', error);
    return { success: false, error: 'No se pudo guardar el popup' };
  }
}

export async function deletePopup() {
  const session = await auth();
  if (!session?.user || !canAccessEcommerceAdmin(session.user)) return { success: false, error: 'No autorizado' };
  const { activeBranch } = await getEcommerceContextFromCookie();
  await prisma.popupConfig.deleteMany({ where: { branchId: activeBranch.id } });
  revalidatePath('/');
  revalidatePath('/admin/popups');
  return { success: true };
}
