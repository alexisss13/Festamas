'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

export interface UserInput {
  name: string;
  email: string;
  password?: string;
  role: Role;
  image?: string; // 👈 Nuevo campo imagen
}

// 1. Obtener SOLO Staff (Admins y Vendedores)
export const getStaffUsers = async () => {
  try {
    const users = await prisma.user.findMany({
      where: {
        role: { in: ['ADMIN', 'SELLER'] } // Filtro clave
      },
      orderBy: { createdAt: 'desc' },
      include: {
        accounts: { select: { provider: true } }
      }
    });
    return { ok: true, users };
  } catch (error) {
    console.error('Error fetching staff:', error);
    return { ok: false, users: [] };
  }
};

// 2. Obtener Estadísticas de Clientes (Para no listarlos todos)
export const getCustomerStats = async () => {
    try {
        const totalCustomers = await prisma.user.count({ where: { role: 'USER' } });
        const googleUsers = await prisma.account.count({ where: { provider: 'google' } });
        
        // Clientes nuevos este mes (ejemplo)
        const date = new Date();
        const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
        const newCustomers = await prisma.user.count({
            where: { 
                role: 'USER',
                createdAt: { gte: firstDay }
            }
        });

        return { totalCustomers, googleUsers, newCustomers };
    } catch (error) {
        return { totalCustomers: 0, googleUsers: 0, newCustomers: 0 };
    }
}

export const getAdminUserById = async (id: string) => {
  try {
    return await prisma.user.findUnique({
      where: { id },
      include: { accounts: true }
    });
  } catch (error) { return null; }
};

// 🔍 1. BUSCADOR DE CLIENTES (Solo trae USER, max 5 resultados para no saturar)
export const searchCustomers = async (query: string) => {
  if (!query || query.length < 3) return { ok: true, users: [] };

  try {
    const users = await prisma.user.findMany({
      where: {
        role: 'USER', // Solo clientes
        OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { email: { contains: query, mode: 'insensitive' } }
        ]
      },
      take: 5, // Limite de seguridad
      include: {
        accounts: { select: { provider: true } }
      }
    });
    return { ok: true, users };
  } catch (error) {
    return { ok: false, users: [] };
  }
};

// 🔐 2. RESTABLECER CONTRASEÑA (Admin Override)
export const adminResetPassword = async (userId: string, newPassword: string) => {
    try {
        const hashedPassword = bcrypt.hashSync(newPassword, 10);
        
        await prisma.user.update({
            where: { id: userId },
            data: { password: hashedPassword }
        });
        
        revalidatePath('/admin/users');
        return { ok: true, message: 'Contraseña actualizada correctamente' };
    } catch (error) {
        return { ok: false, message: 'No se pudo actualizar la contraseña' };
    }
}

// ✏️ 3. EDITAR DATOS DE CLIENTE (Por si escribió mal su email)
export const updateCustomerProfile = async (userId: string, data: { name: string, email: string }) => {
    try {
        await prisma.user.update({
            where: { id: userId },
            data: { name: data.name, email: data.email }
        });
        revalidatePath('/admin/users');
        return { ok: true, message: 'Datos del cliente actualizados' };
    } catch (error) {
        return { ok: false, message: 'El correo ya está en uso o hubo un error' };
    }
}



export const saveAdminUser = async (data: UserInput, id?: string) => {
  try {
    // Preparar datos
    const userPayload: any = {
        name: data.name,
        email: data.email,
        role: data.role,
        image: data.image, // Guardamos la foto
    };

    // Si hay password y no está vacío, hasheamos
    if (data.password && data.password.trim() !== '') {
        userPayload.password = bcrypt.hashSync(data.password, 10);
    }

    if (id) {
        // EDITAR
        await prisma.user.update({ where: { id }, data: userPayload });
    } else {
        // CREAR
        if (!data.password) return { ok: false, message: 'Contraseña requerida' };
        
        const exists = await prisma.user.findUnique({ where: { email: data.email } });
        if (exists) return { ok: false, message: 'El correo ya existe' };

        await prisma.user.create({
            data: {
                ...userPayload,
                password: bcrypt.hashSync(data.password, 10),
                emailVerified: new Date(),
            }
        });
    }

    revalidatePath('/admin/users');
    return { ok: true, message: 'Usuario guardado' };
  } catch (error) {
    console.error(error);
    return { ok: false, message: 'Error al guardar' };
  }
};

export const deleteAdminUser = async (id: string) => {
  try {
    await prisma.user.delete({ where: { id } });
    revalidatePath('/admin/users');
    return { ok: true };
  } catch (error) {
    return { ok: false, message: 'No se puede eliminar (tiene datos asociados)' };
  }
};

