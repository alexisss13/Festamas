'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

// --- HERO CONFIG ---
const heroSchema = z.object({
  heroImage: z.string().optional(),
  heroTitle: z.string().min(1, "Requerido"),
  heroSubtitle: z.string().optional(),
  heroButtonText: z.string().optional(),
  heroButtonLink: z.string().optional(),
  heroBtnColor: z.string().regex(/^#/, "Debe ser un color Hex (#...)").optional(),
});

export async function updateHeroConfig(data: z.infer<typeof heroSchema>) {
  try {
    const config = await prisma.storeConfig.findFirst();
    const cleanData = { ...data, heroBtnColor: data.heroBtnColor || '#fb3099' };

    if (config) {
      await prisma.storeConfig.update({ where: { id: config.id }, data: cleanData });
    } else {
      await prisma.storeConfig.create({ 
        data: { ...cleanData, whatsappPhone: "519999999", welcomeMessage: "Hola..." } 
      });
    }
    
    revalidatePath('/');
    return { success: true, message: "Portada actualizada" };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Error al guardar" };
  }
}

const bannerSchema = z.object({
  title: z.string().min(3),
  image: z.string().min(1),
  link: z.string().min(1),
  btnText: z.string().min(1),
  btnColor: z.string().min(4),
  // 👇 NUEVO
  btnTextColor: z.string().min(4).default('#FFFFFF'), 
  textColor: z.string().min(4),
  position: z.enum(["TOP", "BOTTOM"]),
  size: z.enum(["GRID", "FULL", "HALF"]), // 👈 Agregado HALF
  order: z.coerce.number().default(0),
});

export async function getBanners(onlyActive = false) {
  return await prisma.banner.findMany({
    where: onlyActive ? { isActive: true } : {},
    orderBy: { order: 'asc' } // Importante: Ordenar por el campo order
  });
}

export async function createBanner(data: z.infer<typeof bannerSchema>) {
  try {
    // Auto-asignar orden: Lo ponemos al final
    const lastBanner = await prisma.banner.findFirst({
        where: { position: data.position },
        orderBy: { order: 'desc' }
    });
    const newOrder = (lastBanner?.order || 0) + 1;

    await prisma.banner.create({ 
        data: { ...data, order: newOrder } 
    });
    revalidatePath('/');
    revalidatePath('/admin/design');
    return { success: true };
  } catch (e) { return { success: false, message: "Error al crear" }; }
}

export async function updateBanner(id: string, data: z.infer<typeof bannerSchema>) {
  try {
    await prisma.banner.update({ where: { id }, data });
    revalidatePath('/');
    revalidatePath('/admin/design');
    return { success: true };
  } catch (e) { return { success: false, message: "Error al actualizar" }; }
}

// 👇 NUEVA ACCIÓN: REORDENAR
export async function reorderBanners(items: { id: string, order: number }[]) {
  try {
    // Usamos una transacción para que sea seguro
    await prisma.$transaction(
        items.map((item) => 
            prisma.banner.update({
                where: { id: item.id },
                data: { order: item.order }
            })
        )
    );
    revalidatePath('/');
    revalidatePath('/admin/design');
    return { success: true };
  } catch (e) { return { success: false }; }
}

export async function deleteBanner(id: string) {
  try {
    await prisma.banner.delete({ where: { id } });
    revalidatePath('/');
    revalidatePath('/admin/design');
    return { success: true };
  } catch (e) { return { success: false, message: "Error al eliminar" }; }
}