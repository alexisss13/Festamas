import { auth } from '@/auth';
import { canAccessEcommerceAdmin } from '@/lib/permissions';

/**
 * Verifica que el usuario actual puede gestionar el admin de ecommerce.
 * - SUPER_ADMIN y OWNER siempre pueden.
 * - Otros roles necesitan el permiso `ecommerce_admin` en su JSON de permisos.
 * - OWNER solo accede a su propio businessId.
 */
export async function validateAdminAccess(requiredBusinessId?: string) {
  const session = await auth();

  if (!session?.user) {
    return { authorized: false, error: 'No autenticado' };
  }

  if (!canAccessEcommerceAdmin(session.user)) {
    return { authorized: false, error: 'No tienes permiso para acceder al admin de ecommerce' };
  }

  if (session.user.role === 'OWNER') {
    if (!session.user.businessId) {
      return { authorized: false, error: 'Usuario OWNER sin businessId asignado' };
    }
    if (requiredBusinessId && session.user.businessId !== requiredBusinessId) {
      return { authorized: false, error: 'No tienes acceso a este negocio' };
    }
  }

  return {
    authorized: true,
    user: session.user,
    businessId: session.user.businessId,
    branchId: session.user.branchId,
  };
}

/** Retorna el businessId del usuario actual, o null. */
export async function getCurrentUserBusinessId(): Promise<string | null> {
  const session = await auth();
  return session?.user?.businessId ?? null;
}

/** Verifica si el usuario puede acceder a un businessId específico. */
export async function canAccessBusiness(businessId: string): Promise<boolean> {
  const session = await auth();
  if (!session?.user) return false;
  if (!canAccessEcommerceAdmin(session.user)) return false;

  if (session.user.role === 'SUPER_ADMIN') return true;
  if (session.user.role === 'OWNER') return session.user.businessId === businessId;

  return session.user.businessId === businessId;
}
