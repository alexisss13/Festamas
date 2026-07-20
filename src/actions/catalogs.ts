'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { getEcommerceContextFromCookie } from '@/lib/ecommerce-context';
import { auth } from '@/auth';
import { canAccessEcommerceAdmin } from '@/lib/permissions';

export interface CatalogData {
  title: string;
  coverImage: string;
  iframeUrl: string;
  branchId?: string | null;
  isActive: boolean;
}

export async function getCatalogs() {
  try {
    const { business, activeBranch } = await getEcommerceContextFromCookie();
    const catalogs = await prisma.catalog.findMany({
      where: {
        businessId: business.id,
        branchId: activeBranch.id,
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
    const session = await auth();
    if (!session?.user || !canAccessEcommerceAdmin(session.user)) return { success: false, error: 'No autorizado', data: [] };
    const { business } = await getEcommerceContextFromCookie();
    const catalogs = await prisma.catalog.findMany({ where: { businessId: business.id },
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
    const session = await auth();
    if (!session?.user || !canAccessEcommerceAdmin(session.user)) return { success: false, error: 'No autorizado' };
    const { business, activeBranch } = await getEcommerceContextFromCookie();
    const selectedBranchId = data.branchId ?? activeBranch.id;
    const selectedBranch = await prisma.branch.findFirst({ where: { id: selectedBranchId, businessId: business.id }, select: { id: true } });
    if (!selectedBranch) return { success: false, error: 'La sucursal no pertenece al negocio activo' };
    const catalog = await prisma.catalog.create({
      data: {
        ...data,
        businessId: business.id,
        branchId: selectedBranch.id,
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
    const session = await auth();
    if (!session?.user || !canAccessEcommerceAdmin(session.user)) return { success: false, error: 'No autorizado' };
    const { business, activeBranch } = await getEcommerceContextFromCookie();
    const current = await prisma.catalog.findFirst({ where: { id, businessId: business.id }, select: { id: true } });
    if (!current) return { success: false, error: 'Catálogo no encontrado' };
    const selectedBranchId = data.branchId ?? activeBranch.id;
    const selectedBranch = await prisma.branch.findFirst({ where: { id: selectedBranchId, businessId: business.id }, select: { id: true } });
    if (!selectedBranch) return { success: false, error: 'La sucursal no pertenece al negocio activo' };
    const catalog = await prisma.catalog.updateMany({
      where: { id: current.id, businessId: business.id },
      data: { ...data, branchId: selectedBranch.id },
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
    const session = await auth();
    if (!session?.user || !canAccessEcommerceAdmin(session.user)) return { success: false, error: 'No autorizado' };
    const { business } = await getEcommerceContextFromCookie();
    await prisma.catalog.deleteMany({ where: { id, businessId: business.id } });
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
    const session = await auth();
    if (!session?.user || !canAccessEcommerceAdmin(session.user)) return { success: false, error: 'No autorizado' };
    const { business } = await getEcommerceContextFromCookie();
    const catalog = await prisma.catalog.updateMany({
      where: { id, businessId: business.id },
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
