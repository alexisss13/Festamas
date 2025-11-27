'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export type ProductWithCategory = {
  id: string;
  title: string;
  slug: string;
  price: number;
  stock: number;
  images: string[];
  isAvailable: boolean; // 👈 Agregamos esto al tipo
  category: {
    name: string;
    slug: string;
  };
};

// Modificamos para aceptar filtros (útil para el Admin)
export async function getProducts({ includeInactive = false } = {}) {
  try {
    const whereClause = includeInactive ? {} : { isAvailable: true };

    const products = await prisma.product.findMany({
      where: whereClause, // 👈 Filtro dinámico
      include: {
        category: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const cleanProducts: ProductWithCategory[] = products.map((product) => ({
      id: product.id,
      title: product.title,
      slug: product.slug,
      price: Number(product.price),
      stock: product.stock,
      images: product.images,
      isAvailable: product.isAvailable, // 👈 Mapeamos el nuevo campo
      category: {
        name: product.category.name,
        slug: product.category.slug,
      },
    }));

    return {
      success: true,
      data: cleanProducts,
    };
  } catch (error) {
    console.error('Error obteniendo productos:', error);
    return {
      success: false,
      message: 'No se pudieron cargar los productos.',
      data: [],
    };
  }
}

// Búsqueda por slug (Solo activos, porque es para la tienda pública)
export async function getProduct(slug: string) {
  try {
    const product = await prisma.product.findFirst({ // Usamos findFirst para poder filtrar
      where: {
        slug: slug,
        isAvailable: true, // 👈 Solo si está activo
      },
      include: {
        category: true,
      },
    });

    if (!product) return null;

    return {
      id: product.id,
      title: product.title,
      description: product.description,
      slug: product.slug,
      price: Number(product.price),
      stock: product.stock,
      images: product.images,
      isAvailable: product.isAvailable,
      category: {
        name: product.category.name,
        slug: product.category.slug,
      },
    };
  } catch (error) {
    console.log(error);
    throw new Error('Error al obtener el producto por slug');
  }
}

// Por Categoría (Solo activos)
export async function getProductsByCategory(categorySlug: string) {
  try {
    const category = await prisma.category.findUnique({
      where: { slug: categorySlug },
    });

    if (!category) return null;

    const products = await prisma.product.findMany({
      where: {
        categoryId: category.id,
        isAvailable: true, // 👈 Solo activos
      },
      include: {
        category: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const cleanProducts = products.map((product) => ({
      id: product.id,
      title: product.title,
      slug: product.slug,
      price: Number(product.price),
      stock: product.stock,
      images: product.images,
      isAvailable: product.isAvailable,
      category: {
        name: product.category.name,
        slug: product.category.slug,
      },
    }));

    return {
      categoryName: category.name,
      products: cleanProducts,
    };
  } catch (error) {
    console.log(error);
    return null;
  }
}

// 🔥 SOFT DELETE (Borrado Lógico)
export async function deleteProduct(id: string) {
  try {
    // En lugar de .delete, usamos .update
    await prisma.product.update({
      where: { id },
      data: { 
        isAvailable: false, // 👈 Lo "apagamos"
        slug: `${id}-deleted`, // Truco Pro: Cambiamos el slug para liberar el original por si quieren crear otro igual
      },
    });
    
    revalidatePath('/admin/products');
    revalidatePath('/');
    revalidatePath('/(shop)');
    
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, message: 'No se pudo eliminar el producto' };
  }
}