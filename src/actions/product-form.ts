'use server';

import prisma from '@/lib/prisma';
import { productSchema } from '@/lib/zod';
import { revalidatePath } from 'next/cache';

export async function createOrUpdateProduct(formData: FormData, id?: string) {
  // 1. Extraer datos básicos
  const data = Object.fromEntries(formData.entries());
  
  // 2. Procesar imágenes correctamente (siempre array)
  // El frontend debe enviar 'images' repetido por cada URL
  const images = formData.getAll('images').filter(img => typeof img === 'string' && img.length > 0) as string[];

  // 3. Preparar objeto para Zod
  const rawData = {
    ...data,
    images: images,
    // Checkbox: si está marcado viene 'on', si no viene undefined. Convertimos a boolean.
    isAvailable: formData.get('isAvailable') === 'on',
    
    // Números: Convertir strings vacíos a null o 0 según corresponda para que Zod coerce funcione
    price: data.price === '' ? 0 : data.price,
    stock: data.stock === '' ? 0 : data.stock,
    discountPercentage: data.discountPercentage === '' ? 0 : data.discountPercentage,
    wholesalePrice: data.wholesalePrice === '' ? null : data.wholesalePrice,
    wholesaleMinCount: data.wholesaleMinCount === '' ? null : data.wholesaleMinCount,
  };

  // 4. Validación Zod
  const parsed = productSchema.safeParse(rawData);

  if (!parsed.success) {
    console.error("Error validación:", parsed.error.format()); // Log para debug
    return { success: false, error: parsed.error.issues[0].message };
  }

  // 5. Datos limpios
  const { 
    title, slug, description, price, stock, categoryId, images: validImages, 
    isAvailable, color, groupTag, division, 
    wholesalePrice, wholesaleMinCount, discountPercentage, tags 
  } = parsed.data;

  // 6. Tags: String "a, b" -> Array ["a", "b"]
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
      tags: tagsArray
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
      if (existing) return { success: false, error: 'El slug ya existe.' };

      await prisma.product.create({
        data: productData
      });
    }

    revalidatePath('/admin/products');
    revalidatePath('/'); // Actualizar Home
    return { success: true };
  } catch (error) {
    console.error("Error DB:", error);
    return { success: false, error: 'Error al guardar en base de datos.' };
  }
}