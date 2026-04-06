'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

/**
 * Guarda la preferencia de sucursal del administrador en una cookie.
 * @param branchId ID de la sucursal (Branch)
 */
export async function setAdminBranch(branchId: string) {
  const cookieStore = await cookies();
  cookieStore.set('admin_branch', branchId, { path: '/' });
  
  // Revalidamos todas las rutas del admin
  revalidatePath('/admin', 'layout');
}

/**
 * Obtiene el ID de la sucursal actual que el administrador está gestionando.
 * Retorna null si no hay cookie, para que el layout pueda usar la primera por defecto.
 */
export async function getAdminBranch(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get('admin_branch')?.value || null;
}
