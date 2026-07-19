'use server';

import { revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma';
import { auth } from '@/auth';
import { canAccessEcommerceAdmin } from '@/lib/permissions';
import { getEcommerceContextFromCookie } from '@/lib/ecommerce-context';
import { recordAdminAudit } from '@/lib/admin-audit';

export async function getActivePopup() {
  const { activeBranch } = await getEcommerceContextFromCookie();
  try {
    return await prisma.popupConfig.findFirst({
      where: { branchId: activeBranch.id, isActive: true, AND: [{ OR: [{ startsAt: null }, { startsAt: { lte: new Date() } }] }, { OR: [{ endsAt: null }, { endsAt: { gte: new Date() } }] }] },
      orderBy: { updatedAt: 'desc' },
    });
  } catch (error: any) {
    // Permite que la tienda siga funcionando mientras se despliega la migración de campañas programadas.
    if (error?.code !== 'P2022') throw error;
    return prisma.popupConfig.findFirst({
      where: { branchId: activeBranch.id, isActive: true },
      select: { id: true, imageUrl: true, link: true, showOnce: true, isActive: true, branchId: true, updatedAt: true },
      orderBy: { updatedAt: 'desc' },
    });
  }
}

export async function getAdminPopup() {
  const session = await auth();
  if (!session?.user || !canAccessEcommerceAdmin(session.user)) return { success: false, error: 'No autorizado' };
  const { activeBranch } = await getEcommerceContextFromCookie();
  let popup;
  try {
    popup = await prisma.popupConfig.findFirst({ where: { branchId: activeBranch.id }, orderBy: { updatedAt: 'desc' } });
  } catch (error: any) {
    if (error?.code !== 'P2022') throw error;
    popup = await prisma.popupConfig.findFirst({ where: { branchId: activeBranch.id }, select: { id: true, imageUrl: true, link: true, showOnce: true, isActive: true, branchId: true, updatedAt: true }, orderBy: { updatedAt: 'desc' } });
  }
  return { success: true, popup };
}

export async function savePopup(data: { imageUrl: string; link?: string | null; isActive: boolean; showOnce: boolean; startsAt?: string | null; endsAt?: string | null }) {
  try {
    const session = await auth();
    if (!session?.user || !canAccessEcommerceAdmin(session.user)) return { success: false, error: 'No autorizado' };
    const { business, activeBranch } = await getEcommerceContextFromCookie();
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
    await recordAdminAudit({ businessId: business.id, userId: session.user.id, details: { action: 'SAVE_POPUP', popupId: popup.id } });
    return { success: true, popup };
  } catch (error) {
    console.error('Error al guardar popup:', error);
    if ((error as any)?.code === 'P2022') return { success: false, error: 'La base de datos aún no tiene la migración de campañas programadas.' };
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
