'use server';

import prisma from '@/lib/prisma';
import { productSchema } from '@/lib/zod';
import { revalidatePath } from 'next/cache';

const generateBarcode = () => {
  return Math.floor(100000000000 + Math.random() * 900000000000).toString();
};

export async function createOrUpdateProduct(formData: FormData, id?: string) {
  const data = Object.fromEntries(formData.entries());

  const images = formData.getAll('images').filter(img => typeof img === 'string' && img.length > 0) as string[];

  const rawBarcode = data.barcode?.toString().trim();
  const rawGroupTag = data.groupTag?.toString().trim().toUpperCase();
  const groupTag = rawGroupTag && rawGroupTag.length > 0 ? rawGroupTag : null;
  const barcode = (rawBarcode && rawBarcode.length > 0) ? rawBarcode : generateBarcode();

  const rawColor = data.color?.toString().trim();
  const color = rawColor && rawColor.length > 0 ? rawColor : null;

  const rawData = {
    ...data,
    images: images,
    isAvailable: formData.get('isAvailable') === 'on',
    price: data.price === '' ? 0 : data.price,
    stock: data.stock === '' ? 0 : data.stock,
    discountPercentage: data.discountPercentage === '' ? 0 : data.discountPercentage,
    wholesalePrice: data.wholesalePrice === '' ? null : data.wholesalePrice,
    wholesaleMinCount: data.wholesaleMinCount === '' ? null : data.wholesaleMinCount,
    groupTag: groupTag ?? undefined,
    color: color ?? undefined,
    barcode,
  };

  const parsed = productSchema.safeParse(rawData);

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const {
    title, slug, description, price, stock, categoryId, isAvailable,
    division, wholesalePrice, wholesaleMinCount, discountPercentage, tags
  } = parsed.data;

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
      images,
      isAvailable,
      color,
      groupTag,
      division,
      wholesalePrice,
      wholesaleMinCount,
      discountPercentage,
      tags: tagsArray,
      barcode,
    };

    if (id) {
      await prisma.product.update({ where: { id }, data: productData });
    } else {
      const existing = await prisma.product.findUnique({ where: { slug } });
      if (existing) return { success: false, error: 'El slug ya existe.' };
      await prisma.product.create({ data: productData });
    }

    revalidatePath('/admin/products');
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error("Error DB:", error);
    return { success: false, error: 'Error al guardar en base de datos.' };
  }
}
