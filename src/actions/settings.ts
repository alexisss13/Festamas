'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { getEcommerceContextFromCookie } from '@/lib/ecommerce-context';
import { getAdminBranch } from '@/actions/admin-settings';

const settingsSchema = z.object({
  whatsappPhone: z.string().min(9, "El número debe ser válido"),
  welcomeMessage: z.string().min(5, "El mensaje debe tener contenido"),
  localDeliveryPrice: z.coerce.number().min(0, "El precio no puede ser negativo"),
  templateKey: z.enum(['classic', 'modern', 'playful', 'editorial', 'minimal']),
  primaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  secondaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  accentColor: z.string().regex(/^#[0-9a-fA-F]{6}$/),
});

export async function getStoreConfig() {
  const { business, branches, activeBranch: ecommerceBranch } = await getEcommerceContextFromCookie();
  const adminBranchId = await getAdminBranch();
  const activeBranch = branches.find((branch) => branch.id === adminBranchId) ?? ecommerceBranch;
  const branchConfig = await prisma.storeConfig.findFirst({ where: { businessId: business.id, branchId: activeBranch.id } });
  const config = branchConfig ?? await prisma.storeConfig.findFirst({ where: { businessId: business.id, branchId: null } });
  
  if (config) {
    return {
      ...config,
      localDeliveryPrice: Number(config.localDeliveryPrice),
      // Aseguramos que los campos opcionales nunca sean null para evitar problemas en el form
      heroImage: config.heroImage || '',
      heroTitle: config.heroTitle || '',
      heroSubtitle: config.heroSubtitle || '',
      heroButtonText: config.heroButtonText || '',
      heroButtonLink: config.heroButtonLink || '',
      heroBtnColor: config.heroBtnColor || '#fb3099',
      templateKey: config.templateKey || 'classic',
      primaryColor: (config.themeConfig as any)?.primary || (activeBranch.brandColors as any)?.primary || '#475569',
      secondaryColor: (config.themeConfig as any)?.secondary || (activeBranch.brandColors as any)?.secondary || '#e2e8f0',
      accentColor: (config.themeConfig as any)?.accent || (activeBranch.brandColors as any)?.accent || '#0f172a',
    };
  }

  // Fallback si no hay configuración en BD
  return { 
    whatsappPhone: '51999999999', 
    welcomeMessage: 'Hola FiestasYa...', 
    localDeliveryPrice: 0,
    heroImage: '',
    heroTitle: '',
    heroSubtitle: '',
    heroButtonText: '',
    heroButtonLink: '',
    heroBtnColor: '#fb3099', // 👈 ESTE ERA EL QUE FALTABA
    templateKey: 'classic',
    primaryColor: '#475569',
    secondaryColor: '#e2e8f0',
    accentColor: '#0f172a',
  };
}

export async function updateStoreConfig(data: z.infer<typeof settingsSchema>) {
  try {
    const valid = settingsSchema.parse(data);
    const { business, branches, activeBranch: ecommerceBranch } = await getEcommerceContextFromCookie();
    const adminBranchId = await getAdminBranch();
    const activeBranch = branches.find((branch) => branch.id === adminBranchId) ?? ecommerceBranch;
    const existing = await prisma.storeConfig.findFirst({ where: { businessId: business.id, branchId: activeBranch.id } });
    const configData = {
      whatsappPhone: valid.whatsappPhone,
      welcomeMessage: valid.welcomeMessage,
      localDeliveryPrice: valid.localDeliveryPrice,
      templateKey: valid.templateKey,
      themeConfig: { primary: valid.primaryColor, secondary: valid.secondaryColor, accent: valid.accentColor },
    };

    if (existing) {
      await prisma.storeConfig.update({
        where: { id: existing.id },
        data: configData,
      });
    } else {
      await prisma.storeConfig.create({
        data: { ...configData, businessId: business.id, branchId: activeBranch.id },
      });
    }

    revalidatePath('/');
    return { success: true, message: 'Configuración guardada' };
  } catch (error) {
    console.error(error);
    return { success: false, message: 'Error al guardar configuración' };
  }
}
