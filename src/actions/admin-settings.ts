'use server';

import { cookies } from 'next/headers';
import { Division } from '@prisma/client';

/**
 * Guarda la preferencia de división del administrador en una cookie.
 * @param division 'JUGUETERIA' | 'FIESTAS'
 */
export async function setAdminDivision(division: Division) {
  const cookieStore = await cookies();
  // Guardamos la cookie por defecto (sin expiración explícita es de sesión, pero podemos ponerle maxAge si queremos persistencia larga)
  cookieStore.set('admin_division', division, { path: '/' });
}

/**
 * Obtiene la división actual que el administrador está gestionando.
 * Por defecto retorna 'JUGUETERIA' si no hay cookie.
 */
export async function getAdminDivision(): Promise<Division> {
  const cookieStore = await cookies();
  const division = cookieStore.get('admin_division')?.value;
  
  // Validación de seguridad para asegurar que el valor sea un Enum válido
  if (division === 'FIESTAS' || division === 'JUGUETERIA') {
    return division as Division;
  }
  
  return 'JUGUETERIA'; // Default
}