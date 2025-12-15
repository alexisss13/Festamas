'use server';

import prisma from '@/lib/prisma';
import { productSchema } from '@/lib/zod';
import { revalidatePath } from 'next/cache';

// Recibimos FormData (del formulario HTML) y el ID opcional (para editar)
export async function createOrUpdateProduct(formData: FormData, id?: string) {
  const data = Object.fromEntries(formData.entries());
  
  // Procesamos imágenes (formData.getAll devuelve un array de strings)
  const images = formData.getAll('images') as string[];
  
  // Preparamos el objeto crudo para validarlo con Zod
  const rawData = {
    ...data,
    images: images.length > 0 ? images : [], // Si no hay imágenes, enviamos array vacío para que Zod valide
    isAvailable: formData.get('isAvailable') === 'on', // Checkbox devuelve 'on' si está marcado
    
    // Convertimos campos numéricos vacíos a null para que Zod coerce no falle o lo maneje
    wholesalePrice: data.wholesalePrice === '' ? null : data.wholesalePrice,
    wholesaleMinCount: data.wholesaleMinCount === '' ? null : data.wholesaleMinCount,
  };

  const parsed = productSchema.safeParse(rawData);

  if (!parsed.success) {
    // 🛡️ FIX: Usamos .issues en lugar de .errors para evitar el error de TypeScript
    return { success: false, error: parsed.error.issues[0].message };
  }

  // Obtenemos los datos limpios y tipados
  const { 
    title, slug, description, price, stock, categoryId, images: validImages, 
    isAvailable, color, groupTag, division, 
    wholesalePrice, wholesaleMinCount, discountPercentage, tags 
  } = parsed.data;

  // Procesar Tags: Convertimos string "tag1, tag2" -> Array ["tag1", "tag2"]
  const tagsArray = tags 
    ? tags.split(',').map(t => t.trim().toLowerCase()).filter(t => t !== '')
    : [];

  try {
    const productData = {
      title,
      slug,
      description,
      price,
      stock,
      categoryId,
      images: validImages,
      isAvailable,
      color,
      groupTag,
      division,
      wholesalePrice: wholesalePrice || null,
      wholesaleMinCount: wholesaleMinCount || null,
      discountPercentage,
      tags: tagsArray // Guardamos el array en la BD
    };

    if (id) {
      // ACTUALIZAR
      await prisma.product.update({
        where: { id },
        data: productData
      });
    } else {
      // CREAR
      const existing = await prisma.product.findUnique({ where: { slug } });
      if (existing) return { success: false, error: 'El slug ya existe, usa otro.' };

      await prisma.product.create({
        data: productData
      });
    }

    revalidatePath('/admin/products');
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: 'Error interno al guardar el producto' };
  }
}