// src/lib/auth-helpers.ts
import { auth } from '@/auth';

/**
 * Verifica si el usuario actual tiene acceso de administrador
 * Los usuarios OWNER solo pueden acceder a datos de su propio businessId
 */
export async function validateAdminAccess(requiredBusinessId?: string) {
  const session = await auth();

  if (!session?.user) {
    return { authorized: false, error: 'No autenticado' };
  }

  const adminRoles = ['ADMIN', 'OWNER', 'SUPER_ADMIN', 'MANAGER', 'SELLER'];
  
  if (!adminRoles.includes(session.user.role)) {
    return { authorized: false, error: 'No tienes permisos de administrador' };
  }

  // Si es OWNER, validar que tenga businessId y que coincida con el requerido
  if (session.user.role === 'OWNER') {
    if (!session.user.businessId) {
      return { authorized: false, error: 'Usuario OWNER sin businessId asignado' };
    }

    // Si se requiere un businessId específico, validar que coincida
    if (requiredBusinessId && session.user.businessId !== requiredBusinessId) {
      return { 
        authorized: false, 
        error: 'No tienes acceso a este negocio' 
      };
    }
  }

  return { 
    authorized: true, 
    user: session.user,
    businessId: session.user.businessId,
    branchId: session.user.branchId
  };
}

/**
 * Obtiene el businessId del usuario actual
 * Para usuarios OWNER, retorna su businessId asignado
 * Para otros roles admin, puede retornar null (acceso a todos los negocios)
 */
export async function getCurrentUserBusinessId(): Promise<string | null> {
  const session = await auth();

  if (!session?.user) {
    return null;
  }

  // Si es OWNER, debe tener businessId
  if (session.user.role === 'OWNER') {
    return session.user.businessId || null;
  }

  // Otros roles pueden tener businessId opcional
  return session.user.businessId || null;
}

/**
 * Verifica si el usuario tiene acceso a un negocio específico
 */
export async function canAccessBusiness(businessId: string): Promise<boolean> {
  const session = await auth();

  if (!session?.user) {
    return false;
  }

  const adminRoles = ['ADMIN', 'OWNER', 'SUPER_ADMIN', 'MANAGER', 'SELLER'];
  
  if (!adminRoles.includes(session.user.role)) {
    return false;
  }

  // Si es OWNER, solo puede acceder a su propio negocio
  if (session.user.role === 'OWNER') {
    return session.user.businessId === businessId;
  }

  // SUPER_ADMIN puede acceder a cualquier negocio
  if (session.user.role === 'SUPER_ADMIN') {
    return true;
  }

  // Otros roles solo si tienen el businessId asignado
  return session.user.businessId === businessId;
}
