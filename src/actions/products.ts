// src/actions/products.ts
'use server';

import prisma from '@/lib/prisma';

// Definimos un tipo simple para el retorno, así el frontend sabe qué esperar
export type ProductWithCategory = {
  id: string;
  title: string;
  slug: string;
  price: number; // Convertiremos el Decimal a Number para evitar problemas en el frontend
  images: string[];
  category: {
    name: string;
    slug: string;
  };
};

export async function getProducts() {
  try {
    // Simulamos un pequeño delay de 0.5s para que veas el esqueleto de carga (Skeleton)
    // En producción esto se quita, pero ayuda a desarrollar la UI de carga.
    // await new Promise((resolve) => setTimeout(resolve, 500));

    const products = await prisma.product.findMany({
      include: {
        category: true, // Traemos también el nombre de la categoría
      },
      orderBy: {
        createdAt: 'desc', // Los más nuevos primero
      },
    });

    // Transformamos el resultado para serializar el Decimal a Number
    // Next.js a veces se queja si pasas objetos Decimal directamente a los componentes
    const cleanProducts: ProductWithCategory[] = products.map((product) => ({
      id: product.id,
      title: product.title,
      slug: product.slug,
      price: Number(product.price),
      images: product.images,
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
      message: 'No se pudieron cargar los productos. Inténtalo más tarde.',
      data: [],
    };
  }
}

export async function getProduct(slug: string) {
  try {
    const product = await prisma.product.findUnique({
      where: {
        slug: slug,
      },
      include: {
        category: true,
      },
    });

    if (!product) return null;

    // Transformación de datos (igual que en getProducts)
    return {
      id: product.id,
      title: product.title,
      description: product.description,
      slug: product.slug,
      price: Number(product.price),
      images: product.images,
      stock: product.stock,
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

export async function getProductsByCategory(categorySlug: string) {
  try {
    const category = await prisma.category.findUnique({
      where: { slug: categorySlug },
    });

    if (!category) return null;

    const products = await prisma.product.findMany({
      where: {
        categoryId: category.id,
      },
      include: {
        category: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Transformación de datos (Misma lógica de siempre)
    const cleanProducts = products.map((product) => ({
      id: product.id,
      title: product.title,
      slug: product.slug,
      price: Number(product.price),
      images: product.images,
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