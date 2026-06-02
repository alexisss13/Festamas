// Permission key used in User.permissions JSON field.
// The ERP grants this via its permissions management page.
export const PERM_ECOMMERCE_ADMIN = 'ecommerce_admin';

export type UserForPermission = {
  role?: string | null;
  permissions?: Record<string, unknown> | null | unknown;
};

/**
 * Returns true if the user can access the ecommerce admin.
 * - SUPER_ADMIN and OWNER always have access.
 * - Any other role needs { ecommerce_admin: true } in their permissions JSON.
 */
export function canAccessEcommerceAdmin(user: UserForPermission): boolean {
  if (!user) return false;
  const role = user.role as string | undefined;
  if (role === 'SUPER_ADMIN' || role === 'OWNER') return true;
  const perms = user.permissions as Record<string, unknown> | null | undefined;
  return perms?.[PERM_ECOMMERCE_ADMIN] === true;
}
