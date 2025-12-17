'use server';

import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const addressSchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  address: z.string().min(5),
  address2: z.string().optional(),
  department: z.string().optional(), 
  province: z.string().optional(), 
  district: z.string().optional(), 
  city: z.string().optional(),     
  phone: z.string().min(9),
  dni: z.string().optional(),      
});

export async function setUserAddress(data: z.infer<typeof addressSchema>) {
  const session = await auth();

  if (!session?.user?.id) {
    return { ok: false, message: 'No hay sesión de usuario' };
  }

  try {
    const userId = session.user.id;
    const storedAddress = await prisma.address.findFirst({ where: { userId } });

    const addressDataToSave = {
      firstName: data.firstName,
      lastName: data.lastName,
      address: data.address,
      address2: data.address2,
      phone: data.phone,
      // DNI: Ahora sí lo guardamos porque existe en el Schema
      dni: data.dni, 
      
      // Mapeo de Ubigeo
      city: data.district || data.city || '', 
      province: (data.department && data.province && !data.province.includes('-')) 
        ? `${data.department} - ${data.province}` 
        : (data.province || ''),
        
      country: 'Perú', // Ahora sí funcionará porque agregamos el campo al schema
      userId: userId,
    };

    if (storedAddress) {
      await prisma.address.update({
        where: { id: storedAddress.id },
        data: addressDataToSave,
      });
      revalidatePath('/profile');
      return { ok: true, message: 'Dirección actualizada correctamente' };
    } else {
      await prisma.address.create({
        data: addressDataToSave,
      });
      revalidatePath('/profile');
      return { ok: true, message: 'Dirección guardada correctamente' };
    }

  } catch (error) {
    console.error("Error al guardar dirección:", error);
    return { ok: false, message: 'No se pudo guardar la dirección. Revisa la consola del servidor.' };
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