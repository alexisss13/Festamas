'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { Division } from '@prisma/client';

export interface HomeSectionInput {
  title: string;
  subtitle?: string;
  tag: string;
  division: Division;
  icon: string;
  order: number;
}

// 🛡️ FIX: Agregamos 'division' como parámetro obligatorio
export const getHomeSections = async (division: Division, onlyActive = true) => {
  try {
    const sections = await prisma.homeSection.findMany({
      where: {
        division: division, // 👈 FILTRO CRÍTICO
        isActive: onlyActive ? true : undefined, 
      },
      orderBy: { order: 'asc' },
    });
    return { ok: true, sections };
  } catch (error) {
    console.error('Error fetching home sections:', error);
    return { ok: false, sections: [] };
  }
};

// Crear o Actualizar Sección (Admin)
export const saveHomeSection = async (data: HomeSectionInput, id?: string) => {
  try {
    if (id) {
      await prisma.homeSection.update({ where: { id }, data });
    } else {
      await prisma.homeSection.create({ data });
    }
    revalidatePath('/'); 
    revalidatePath('/admin/sections');
    return { ok: true, message: 'Sección guardada' };
  } catch (error) {
    console.error(error);
    return { ok: false, message: 'Error al guardar sección' };
  }
};

export const deleteHomeSection = async (id: string) => {
  try {
    await prisma.homeSection.delete({ where: { id } });
    revalidatePath('/');
    return { ok: true };
  } catch (error) {
    return { ok: false };
  }
};