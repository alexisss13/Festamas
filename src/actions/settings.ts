'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const settingsSchema = z.object({
  whatsappPhone: z.string().min(9, "El número debe ser válido"),
  welcomeMessage: z.string().min(5, "El mensaje debe tener contenido"),
  localDeliveryPrice: z.coerce.number().min(0, "El precio no puede ser negativo"),
});

export async function getStoreConfig() {
  const config = await prisma.storeConfig.findFirst();
  
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
  };
}

export async function updateStoreConfig(data: z.infer<typeof settingsSchema>) {
  try {
    const valid = settingsSchema.parse(data);
    const existing = await prisma.storeConfig.findFirst();

    if (existing) {
      await prisma.storeConfig.update({
        where: { id: existing.id },
        data: valid,
      });
    } else {
      await prisma.storeConfig.create({
        data: valid,
      });
    }

    revalidatePath('/');
    return { success: true, message: 'Configuración guardada' };
  } catch (error) {
    console.error(error);
    return { success: false, message: 'Error al guardar configuración' };
  }
}