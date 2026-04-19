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
    let user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        createdAt: true,
        customerId: true,
        businessId: true,
        // Traemos las direcciones
        addresses: {
            orderBy: { createdAt: 'desc' }
        },
        // Traemos los pedidos recientes
        orders: {
            take: 5,
            orderBy: { createdAt: 'desc' },
            include: {
                orderItems: true
            }
        },
        // Traemos el Customer vinculado (POS/ERP)
        customer: {
          select: {
            id: true,
            name: true,
            pointsBalance: true,
            totalSpent: true,
            visits: true,
            lastPurchase: true,
            docType: true,
            docNumber: true,
            phone: true
          }
        }
      },
    });

    if (!user) return null;

    // Si no tiene customer vinculado pero tiene email, buscar y vincular
    if (!user.customerId && user.email) {
      const customer = await prisma.customer.findFirst({
        where: {
          email: user.email,
          businessId: user.businessId || undefined
        },
        select: {
          id: true,
          name: true,
          pointsBalance: true,
          totalSpent: true,
          visits: true,
          lastPurchase: true,
          docType: true,
          docNumber: true,
          phone: true
        }
      });

      // Si encontramos un customer, vincularlo
      if (customer) {
        await prisma.user.update({
          where: { id: userId },
          data: { customerId: customer.id }
        });

        // Actualizar el objeto user con el customer encontrado
        user = {
          ...user,
          customerId: customer.id,
          customer: customer
        };
      }
    }

    return user;
  } catch (error) {
    console.log(error);
    return null;
  }
}

export async function updateCustomerInfo(data: {
  docType?: string;
  docNumber?: string;
  phone?: string;
}) {
  const session = await auth();

  if (!session?.user) {
    return { ok: false, message: 'No autenticado' };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { customerId: true, businessId: true, email: true, name: true }
    });

    if (!user) {
      return { ok: false, message: 'Usuario no encontrado' };
    }

    // Si no tiene customer, crear uno
    if (!user.customerId) {
      const business = await prisma.business.findFirst({
        select: { id: true }
      });

      if (!business) {
        return { ok: false, message: 'Error de configuración' };
      }

      const newCustomer = await prisma.customer.create({
        data: {
          businessId: business.id,
          name: user.name || 'Usuario',
          email: user.email || '',
          docType: data.docType,
          docNumber: data.docNumber,
          phone: data.phone,
          pointsBalance: 0,
          totalSpent: 0,
          visits: 0,
        }
      });

      await prisma.user.update({
        where: { id: session.user.id },
        data: { customerId: newCustomer.id }
      });

      return { ok: true, message: 'Información actualizada' };
    }

    // Si ya tiene customer, actualizar
    await prisma.customer.update({
      where: { id: user.customerId },
      data: {
        docType: data.docType,
        docNumber: data.docNumber,
        phone: data.phone,
      }
    });

    return { ok: true, message: 'Información actualizada' };
  } catch (error) {
    console.error('Error actualizando customer:', error);
    return { ok: false, message: 'Error al actualizar' };
  }
}