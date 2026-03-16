'use server';

import prisma from '@/lib/prisma';
import { Division } from '@prisma/client';

// 1. Obtener todos los catálogos activos para la tienda (Front-end)
export async function getCatalogs() {
  try {
    const catalogs = await prisma.catalog.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return { success: true, data: catalogs };
  } catch (error) {
    console.error('Error fetching catalogs:', error);
    return { success: false, error: 'Error al obtener los catálogos' };
  }
}