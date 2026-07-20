'use server';

import prisma from '@/lib/prisma';
import { getEcommerceContextFromCookie } from '@/lib/ecommerce-context';
import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';
import { canAccessEcommerceAdmin } from '@/lib/permissions';

export type CollectionCard = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  coverImage: string | null;
  groupTag: string;
  sortOrder: number;
};

export type AdminCollection = CollectionCard & {
  active: boolean;
  activeFrom: Date | null;
  activeUntil: Date | null;
  createdAt: Date;
};

export async function getActiveCollections(): Promise<CollectionCard[]> {
  try {
    const { business } = await getEcommerceContextFromCookie();
    const now = new Date();

    const collections = await prisma.productCollection.findMany({
      where: {
        businessId: business.id,
        active: true,
        OR: [{ activeFrom: null }, { activeFrom: { lte: now } }],
        AND: [{ OR: [{ activeUntil: null }, { activeUntil: { gte: now } }] }],
      },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        coverImage: true,
        groupTag: true,
        sortOrder: true,
      },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    });

    return collections;
  } catch {
    return [];
  }
}

export async function getCollectionBySlug(slug: string): Promise<CollectionCard | null> {
  try {
    const { business } = await getEcommerceContextFromCookie();

    const collection = await prisma.productCollection.findFirst({
      where: { businessId: business.id, slug, active: true },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        coverImage: true,
        groupTag: true,
        sortOrder: true,
      },
    });

    return collection;
  } catch {
    return null;
  }
}

export async function getAdminCollections(): Promise<{ success: boolean; data?: AdminCollection[]; error?: string }> {
  try {
    const { business } = await getEcommerceContextFromCookie();

    const collections = await prisma.productCollection.findMany({
      where: { businessId: business.id },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        coverImage: true,
        groupTag: true,
        sortOrder: true,
        active: true,
        activeFrom: true,
        activeUntil: true,
        createdAt: true,
      },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    });

    return { success: true, data: collections };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function createCollection(data: {
  name: string;
  slug: string;
  description?: string;
  groupTag: string;
  coverImage?: string;
  sortOrder?: number;
  active?: boolean;
  activeFrom?: string;
  activeUntil?: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await auth();
    if (!session?.user || !canAccessEcommerceAdmin(session.user)) return { success: false, error: 'No autorizado' };
    const { business } = await getEcommerceContextFromCookie();

    await prisma.productCollection.create({
      data: {
        businessId: business.id,
        name: data.name,
        slug: data.slug,
        description: data.description ?? null,
        groupTag: data.groupTag,
        coverImage: data.coverImage ?? null,
        sortOrder: data.sortOrder ?? 0,
        active: data.active ?? true,
        activeFrom: data.activeFrom ? new Date(data.activeFrom) : null,
        activeUntil: data.activeUntil ? new Date(data.activeUntil) : null,
      },
    });

    revalidatePath('/admin/collections');
    return { success: true };
  } catch (e: any) {
    if (e.code === 'P2002') return { success: false, error: 'Ya existe una colección con ese slug.' };
    return { success: false, error: e.message };
  }
}

export async function updateCollection(
  id: string,
  data: {
    name?: string;
    slug?: string;
    description?: string | null;
    groupTag?: string;
    coverImage?: string | null;
    sortOrder?: number;
    active?: boolean;
    activeFrom?: string | null;
    activeUntil?: string | null;
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await auth();
    if (!session?.user || !canAccessEcommerceAdmin(session.user)) return { success: false, error: 'No autorizado' };
    const { business } = await getEcommerceContextFromCookie();

    await prisma.productCollection.updateMany({
      where: { id, businessId: business.id },
      data: {
        ...(data.name !== undefined      && { name: data.name }),
        ...(data.slug !== undefined      && { slug: data.slug }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.groupTag !== undefined  && { groupTag: data.groupTag }),
        ...(data.coverImage !== undefined && { coverImage: data.coverImage }),
        ...(data.sortOrder !== undefined && { sortOrder: data.sortOrder }),
        ...(data.active !== undefined    && { active: data.active }),
        activeFrom: data.activeFrom !== undefined
          ? (data.activeFrom ? new Date(data.activeFrom) : null)
          : undefined,
        activeUntil: data.activeUntil !== undefined
          ? (data.activeUntil ? new Date(data.activeUntil) : null)
          : undefined,
      },
    });

    revalidatePath('/admin/collections');
    return { success: true };
  } catch (e: any) {
    if (e.code === 'P2002') return { success: false, error: 'Ya existe una colección con ese slug.' };
    return { success: false, error: e.message };
  }
}

export async function toggleCollectionActive(id: string, active: boolean): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await auth();
    if (!session?.user || !canAccessEcommerceAdmin(session.user)) return { success: false, error: 'No autorizado' };
    const { business } = await getEcommerceContextFromCookie();
    await prisma.productCollection.updateMany({
      where: { id, businessId: business.id },
      data: { active },
    });
    revalidatePath('/admin/collections');
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function deleteCollection(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await auth();
    if (!session?.user || !canAccessEcommerceAdmin(session.user)) return { success: false, error: 'No autorizado' };
    const { business } = await getEcommerceContextFromCookie();
    await prisma.productCollection.deleteMany({
      where: { id, businessId: business.id },
    });
    revalidatePath('/admin/collections');
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}
