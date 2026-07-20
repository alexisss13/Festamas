'use server';

/**
 * El maestro de productos, variantes, precios y stock pertenece al POS.
 * Esta acción se conserva solo como barrera explícita para componentes
 * heredados: ecommerce no puede crear ni alterar esos datos operativos.
 */
export async function createOrUpdateProduct(_formData: FormData, _id?: string) {
  return {
    success: false,
    error: 'Los productos se administran desde el POS. En ecommerce solo se personaliza su presentación comercial.',
  };
}
