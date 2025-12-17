'use server';

import { auth } from '@/auth';
import prisma from '@/lib/prisma';

export async function getUserProfile() {
  const session = await auth();

  if (!session?.user) {
    return null;
  }

  const userId = session.user.id;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        createdAt: true,
        // Traemos las direcciones
        addresses: {
            take: 3, // Solo las primeras 3 para el resumen
            orderBy: { createdAt: 'desc' }
        },
        // Traemos los pedidos recientes
        orders: {
            take: 5,
            orderBy: { createdAt: 'desc' },
            include: {
                orderItems: true
            }
        }
      },
    });

    return user;
  } catch (error) {
    console.log(error);
    return null;
  }
}