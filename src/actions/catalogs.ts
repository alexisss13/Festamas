'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { getEcommerceContextFromCookie } from '@/lib/ecommerce-context';

export interface CatalogData {
  title: string;
  coverImage: string;
  iframeUrl: string;
  branchId?: string | null;
  isActive: boolean;
}

export async function getCatalogs() {
  try {
    const { activeBranch } = await getEcommerceContextFromCookie();
    const catalogs = await prisma.catalog.findMany({
      where: {
        OR: [{ branchId: activeBranch.id }, { branchId: null }],
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

// 2. Obtener todos los catálogos para el Admin
export async function getAdminCatalogs() {
  try {
    const catalogs = await prisma.catalog.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return { success: true, data: catalogs };
  } catch (error) {
    console.error('Error getAdminCatalogs:', error);
    return { success: false, error: 'Error al obtener catálogos.' };
  }
}

// 3. Crear un catálogo
export async function createCatalog(data: CatalogData) {
  try {
    const { activeBranch } = await getEcommerceContextFromCookie();
    const catalog = await prisma.catalog.create({
      data: {
        ...data,
        branchId: data.branchId ?? activeBranch.id,
      },
    });
    revalidatePath('/');
    revalidatePath('/admin/catalogs');
    return { success: true, data: catalog };
  } catch (error) {
    console.error('Error createCatalog:', error);
    return { success: false, error: 'Error al crear el catálogo.' };
  }
}

// 4. Actualizar un catálogo
export async function updateCatalog(id: string, data: Partial<CatalogData>) {
  try {
    const catalog = await prisma.catalog.update({
      where: { id },
      data,
    });
    revalidatePath('/');
    revalidatePath('/admin/catalogs');
    return { success: true, data: catalog };
  } catch (error) {
    console.error('Error updateCatalog:', error);
    return { success: false, error: 'Error al actualizar el catálogo.' };
  }
}

// 5. Eliminar un catálogo
export async function deleteCatalog(id: string) {
  try {
    await prisma.catalog.delete({ where: { id } });
    revalidatePath('/');
    revalidatePath('/admin/catalogs');
    return { success: true };
  } catch (error) {
    console.error('Error deleteCatalog:', error);
    return { success: false, error: 'Error al eliminar el catálogo.' };
  }
}

// 6. Cambiar estado de un catálogo
export async function toggleCatalogStatus(id: string, currentStatus: boolean) {
  try {
    const catalog = await prisma.catalog.update({
      where: { id },
      data: { isActive: !currentStatus },
    });
    revalidatePath('/');
    revalidatePath('/admin/catalogs');
    return { success: true, data: catalog };
  } catch (error) {
    console.error('Error toggleCatalogStatus:', error);
    return { success: false, error: 'Error al cambiar el estado del catálogo.' };
  }
}
