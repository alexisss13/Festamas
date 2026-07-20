'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';
import { canAccessEcommerceAdmin } from '@/lib/permissions';
import { getEcommerceContextFromCookie } from '@/lib/ecommerce-context';

export interface HomeSectionInput {
  title: string;
  subtitle?: string;
  tag: string;
  branchId?: string | null;
  icon: string;
  isActive: boolean;
}

export const getHomeSections = async (onlyActive: boolean = true) => {
  try {
    const { activeBranch } = await getEcommerceContextFromCookie();
    const whereClause: any = { branchId: activeBranch.id };
    if (onlyActive) whereClause.isActive = true;

    const sections = await prisma.homeSection.findMany({
      where: whereClause,
      orderBy: { order: 'asc' },
    });
    return { ok: true, sections };
  } catch (error) {
    console.error('Error fetching home sections:', error);
    return { ok: false, sections: [] };
  }
};

export const getHomeSectionById = async (id: string) => {
  try {
    const { activeBranch } = await getEcommerceContextFromCookie();
    return await prisma.homeSection.findFirst({ where: { id, branchId: activeBranch.id } });
  } catch (error) {
    return null;
  }
};

// 🆕 Guardar (con cálculo automático de orden si es nuevo)
export const saveHomeSection = async (data: HomeSectionInput, id?: string) => {
  try {
    const session = await auth();
    if (!session?.user || !canAccessEcommerceAdmin(session.user)) return { ok: false, message: 'No autorizado' };
    const { activeBranch } = await getEcommerceContextFromCookie();
    const scopedData = { ...data, branchId: activeBranch.id };
    if (id) {
      // Actualizar existente
      const current = await prisma.homeSection.findFirst({ where: { id, branchId: activeBranch.id } });
      if (!current) return { ok: false, message: 'Sección no encontrada en la sucursal activa' };
      await prisma.homeSection.update({ where: { id }, data: scopedData });
    } else {
      // Crear nuevo: Buscar el último orden para ponerlo al final
      const lastSection = await prisma.homeSection.findFirst({
        where: { branchId: activeBranch.id },
        orderBy: { order: 'desc' },
        select: { order: true }
      });
      
      const newOrder = (lastSection?.order ?? -1) + 1;

      await prisma.homeSection.create({ 
        data: { ...scopedData, order: newOrder } 
      });
    }
    
    revalidatePath('/'); 
    revalidatePath('/admin/sections');
    return { ok: true, message: 'Sección guardada correctamente' };
  } catch (error) {
    console.error(error);
    return { ok: false, message: 'Error al guardar la sección' };
  }
};

// 🆕 Acción de Reordenamiento (Drag & Drop)
export const reorderHomeSections = async (items: { id: string; order: number }[]) => {
  try {
    const session = await auth();
    if (!session?.user || !canAccessEcommerceAdmin(session.user)) return { ok: false };
    const { activeBranch } = await getEcommerceContextFromCookie();
    const allowed = await prisma.homeSection.count({ where: { id: { in: items.map(item => item.id) }, branchId: activeBranch.id } });
    if (allowed !== items.length) return { ok: false };
    await prisma.$transaction(
      items.map((item) =>
        prisma.homeSection.update({
          where: { id: item.id },
          data: { order: item.order },
        })
      )
    );
    revalidatePath('/');
    revalidatePath('/admin/sections');
    return { ok: true };
  } catch (error) {
    console.error('Error reordering sections:', error);
    return { ok: false };
  }
};

export const deleteHomeSection = async (id: string) => {
  try {
    const session = await auth();
    if (!session?.user || !canAccessEcommerceAdmin(session.user)) return { ok: false };
    const { activeBranch } = await getEcommerceContextFromCookie();
    const current = await prisma.homeSection.findFirst({ where: { id, branchId: activeBranch.id } });
    if (!current) return { ok: false };
    await prisma.homeSection.delete({ where: { id } });
    revalidatePath('/');
    revalidatePath('/admin/sections');
    return { ok: true };
  } catch (error) {
    return { ok: false };
  }
};
