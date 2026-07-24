'use server';

import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { getEcommerceContextFromCookie } from '@/lib/ecommerce-context';
import { getAdminBranch } from '@/actions/admin-settings';
import { auth } from '@/auth';
import { canAccessEcommerceAdmin } from '@/lib/permissions';
import { STOREFRONT_PREVIEW_COOKIE, type StoreConfigDraft } from '@/lib/store-config-draft';
import { cookies } from 'next/headers';

const settingsSchema = z.object({
  whatsappPhone: z.string().min(9, "El número debe ser válido"),
  welcomeMessage: z.string().min(5, "El mensaje debe tener contenido"),
  localDeliveryPrice: z.coerce.number().min(0, "El precio no puede ser negativo"),
  templateKey: z.enum(['classic', 'modern', 'playful', 'editorial', 'minimal']),
  primaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  secondaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  accentColor: z.string().regex(/^#[0-9a-fA-F]{6}$/),
});

async function resolveAdminBranch() {
  const { business, branches, activeBranch: ecommerceBranch } = await getEcommerceContextFromCookie();
  const adminBranchId = await getAdminBranch();
  const activeBranch = branches.find((branch) => branch.id === adminBranchId) ?? ecommerceBranch;
  return { business, activeBranch };
}

export async function getStoreConfig() {
  const { business, activeBranch } = await resolveAdminBranch();
  const branchConfig = await prisma.storeConfig.findFirst({ where: { businessId: business.id, branchId: activeBranch.id } });
  const config = branchConfig ?? await prisma.storeConfig.findFirst({ where: { businessId: business.id, branchId: null } });

  // El formulario de edición siempre muestra el draft pendiente si existe —
  // es lo que el admin dejó a medio editar, no lo publicado. Si no hay
  // draft, muestra lo publicado (comportamiento de siempre).
  const draft = (config?.draftConfig ?? null) as Partial<StoreConfigDraft> | null;
  const hasPendingChanges = draft !== null;

  if (config) {
    return {
      ...config,
      localDeliveryPrice: Number(draft?.localDeliveryPrice ?? config.localDeliveryPrice),
      // Aseguramos que los campos opcionales nunca sean null para evitar problemas en el form
      heroImage: config.heroImage || '',
      heroTitle: config.heroTitle || '',
      heroSubtitle: config.heroSubtitle || '',
      heroButtonText: config.heroButtonText || '',
      heroButtonLink: config.heroButtonLink || '',
      heroBtnColor: config.heroBtnColor || '#fb3099',
      templateKey: draft?.templateKey || config.templateKey || 'classic',
      whatsappPhone: draft?.whatsappPhone ?? config.whatsappPhone,
      welcomeMessage: draft?.welcomeMessage ?? config.welcomeMessage,
      primaryColor: draft?.themeConfig?.primary || (config.themeConfig as any)?.primary || (activeBranch.brandColors as any)?.primary || '#475569',
      secondaryColor: draft?.themeConfig?.secondary || (config.themeConfig as any)?.secondary || (activeBranch.brandColors as any)?.secondary || '#e2e8f0',
      accentColor: draft?.themeConfig?.accent || (config.themeConfig as any)?.accent || (activeBranch.brandColors as any)?.accent || '#0f172a',
      hasPendingChanges,
    };
  }

  // Fallback si no hay configuración en BD
  return {
    whatsappPhone: '51999999999',
    welcomeMessage: `Hola ${activeBranch.name}, quiero confirmar mi pedido...`,
    localDeliveryPrice: 0,
    heroImage: '',
    heroTitle: '',
    heroSubtitle: '',
    heroButtonText: '',
    heroButtonLink: '',
    heroBtnColor: (activeBranch.brandColors as { primary?: string } | null)?.primary || '#475569',
    templateKey: 'classic',
    primaryColor: '#475569',
    secondaryColor: '#e2e8f0',
    accentColor: '#0f172a',
    hasPendingChanges: false,
  };
}

// Guarda como DRAFT — nunca escribe directo a los campos publicados que lee
// el storefront real (ver getActiveStorefrontConfig). Hay que llamar a
// publishStoreConfig() para que un cambio se vea en la tienda de verdad.
export async function updateStoreConfig(data: z.infer<typeof settingsSchema>) {
  try {
    const session = await auth();
    if (!session?.user || !canAccessEcommerceAdmin(session.user)) return { success: false, message: 'No autorizado' };
    const valid = settingsSchema.parse(data);
    const { business, activeBranch } = await resolveAdminBranch();
    const existing = await prisma.storeConfig.findFirst({ where: { businessId: business.id, branchId: activeBranch.id } });
    const draftConfig: StoreConfigDraft = {
      whatsappPhone: valid.whatsappPhone,
      welcomeMessage: valid.welcomeMessage,
      localDeliveryPrice: valid.localDeliveryPrice,
      templateKey: valid.templateKey,
      themeConfig: { primary: valid.primaryColor, secondary: valid.secondaryColor, accent: valid.accentColor },
    };

    if (existing) {
      await prisma.storeConfig.update({ where: { id: existing.id }, data: { draftConfig } });
    } else {
      // Fila nueva: los campos publicados quedan en su default de schema
      // hasta que se publique el draft por primera vez.
      await prisma.storeConfig.create({ data: { businessId: business.id, branchId: activeBranch.id, draftConfig } });
    }

    return { success: true, message: 'Cambios guardados como borrador. Usa "Vista previa" para revisarlos y "Publicar" para que se vean en la tienda.' };
  } catch (error) {
    console.error(error);
    return { success: false, message: 'Error al guardar configuración' };
  }
}

export async function publishStoreConfig() {
  const session = await auth();
  if (!session?.user || !canAccessEcommerceAdmin(session.user)) return { success: false, message: 'No autorizado' };
  const { business, activeBranch } = await resolveAdminBranch();
  const existing = await prisma.storeConfig.findFirst({ where: { businessId: business.id, branchId: activeBranch.id } });
  const draft = (existing?.draftConfig ?? null) as StoreConfigDraft | null;
  if (!existing || !draft) return { success: false, message: 'No hay cambios pendientes por publicar' };

  await prisma.storeConfig.update({
    where: { id: existing.id },
    data: {
      whatsappPhone: draft.whatsappPhone,
      welcomeMessage: draft.welcomeMessage,
      localDeliveryPrice: draft.localDeliveryPrice,
      templateKey: draft.templateKey,
      themeConfig: draft.themeConfig,
      draftConfig: Prisma.JsonNull,
    },
  });

  revalidatePath('/');
  return { success: true, message: 'Cambios publicados — ya son visibles en la tienda.' };
}

export async function discardStoreConfigDraft() {
  const session = await auth();
  if (!session?.user || !canAccessEcommerceAdmin(session.user)) return { success: false, message: 'No autorizado' };
  const { business, activeBranch } = await resolveAdminBranch();
  const existing = await prisma.storeConfig.findFirst({ where: { businessId: business.id, branchId: activeBranch.id } });
  if (!existing?.draftConfig) return { success: false, message: 'No hay cambios pendientes que descartar' };

  await prisma.storeConfig.update({ where: { id: existing.id }, data: { draftConfig: Prisma.JsonNull } });
  return { success: true, message: 'Cambios sin publicar descartados' };
}

export async function enableStorefrontPreview() {
  const session = await auth();
  if (!session?.user || !canAccessEcommerceAdmin(session.user)) return { success: false, message: 'No autorizado' };
  const { business, activeBranch } = await resolveAdminBranch();
  const existing = await prisma.storeConfig.findFirst({ where: { businessId: business.id, branchId: activeBranch.id } });
  if (!existing?.draftConfig) return { success: false, message: 'No hay cambios pendientes que previsualizar' };

  const cookieStore = await cookies();
  // 1 hora — suficiente para revisar y decidir, sin dejar la vista previa
  // encendida indefinidamente si el admin se olvida de apagarla.
  cookieStore.set(STOREFRONT_PREVIEW_COOKIE, '1', { httpOnly: true, sameSite: 'lax', maxAge: 60 * 60, path: '/' });
  return { success: true };
}

export async function disableStorefrontPreview() {
  const cookieStore = await cookies();
  cookieStore.delete(STOREFRONT_PREVIEW_COOKIE);
  return { success: true };
}
