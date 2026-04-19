'use server';

import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const addressSchema = z.object({
  address: z.string().min(5),
  address2: z.string().optional(),
  city: z.string().min(2),
  province: z.string().optional(),
});

export async function setUserAddress(data: z.infer<typeof addressSchema>) {
  const session = await auth();

  if (!session?.user?.id) {
    return { ok: false, message: 'No hay sesión de usuario' };
  }

  try {
    const userId = session.user.id;

    const addressDataToSave = {
      address: data.address,
      address2: data.address2,
      city: data.city,
      province: data.province || '',
      country: 'Perú',
      userId: userId,
    };

    await prisma.address.create({
      data: addressDataToSave,
    });

    revalidatePath('/profile');
    return { ok: true, message: 'Dirección guardada correctamente' };

  } catch (error) {
    console.error("Error al guardar dirección:", error);
    return { ok: false, message: 'No se pudo guardar la dirección.' };
  }
}

export async function updateUserAddress(id: string, data: z.infer<typeof addressSchema>) {
  const session = await auth();

  if (!session?.user?.id) {
    return { ok: false, message: 'No autenticado' };
  }

  try {
    await prisma.address.update({
      where: { id, userId: session.user.id },
      data: {
        address: data.address,
        address2: data.address2,
        city: data.city,
        province: data.province || '',
      }
    });

    revalidatePath('/profile');
    return { ok: true, message: 'Dirección actualizada correctamente' };

  } catch (error) {
    console.error("Error al actualizar dirección:", error);
    return { ok: false, message: 'No se pudo actualizar la dirección.' };
  }
}

export async function deleteUserAddress(id: string) {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, message: 'No autenticado' };

  try {
    await prisma.address.delete({
      where: { id, userId: session.user.id }
    });
    revalidatePath('/profile');
    return { ok: true, message: 'Dirección eliminada' };
  } catch (error) {
    console.log(error);
    return { ok: false, message: 'Error al eliminar' };
  }
}