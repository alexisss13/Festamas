'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export interface HomeSectionInput {
  title: string;
  subtitle?: string;
  tag: string;
  branchId?: string | null;
  icon: string;
  isActive: boolean;
}

export const getHomeSections = async (branchId: string, onlyActive: boolean = true) => {
  try {
    const whereClause: any = { branchId };
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
    return await prisma.homeSection.findUnique({ where: { id } });
  } catch (error) {
    return null;
  }
};

// 🆕 Guardar (con cálculo automático de orden si es nuevo)
export const saveHomeSection = async (data: HomeSectionInput, id?: string) => {
  try {
    if (id) {
      // Actualizar existente
      await prisma.homeSection.update({ where: { id }, data });
    } else {
      // Crear nuevo: Buscar el último orden para ponerlo al final
      const lastSection = await prisma.homeSection.findFirst({
        where: { branchId: data.branchId ?? null },
        orderBy: { order: 'desc' },
        select: { order: true }
      });
      
      const newOrder = (lastSection?.order ?? -1) + 1;

      await prisma.homeSection.create({ 
        data: { ...data, order: newOrder } 
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
    await prisma.homeSection.delete({ where: { id } });
    revalidatePath('/');
    revalidatePath('/admin/sections');
    return { ok: true };
  } catch (error) {
    return { ok: false };
  }
};
