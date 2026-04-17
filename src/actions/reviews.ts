'use server';

import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const reviewSchema = z.object({
  productId: z.string().min(1, 'Producto requerido'),
  rating: z.number().min(1, 'Calificación mínima: 1').max(5, 'Calificación máxima: 5'),
  comment: z.string().optional(),
});

// Crear o actualizar reseña
export async function createOrUpdateReview(data: {
  productId: string;
  rating: number;
  comment?: string;
}) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return { success: false, error: 'Debes iniciar sesión para dejar una reseña' };
    }

    const parsed = reviewSchema.safeParse(data);
    
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    const { productId, rating, comment } = parsed.data;

    // Verificar que el producto existe
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return { success: false, error: 'Producto no encontrado' };
    }

    // Verificar si ya existe una reseña del usuario para este producto
    const existingReview = await prisma.review.findUnique({
      where: {
        productId_userId: {
          productId,
          userId: session.user.id,
        },
      },
    });

    let review;

    if (existingReview) {
      // Actualizar reseña existente
      review = await prisma.review.update({
        where: { id: existingReview.id },
        data: {
          rating,
          comment: comment || null,
          status: 'PENDING', // Volver a estado pendiente al actualizar
        },
      });
    } else {
      // Crear nueva reseña
      review = await prisma.review.create({
        data: {
          productId,
          userId: session.user.id,
          rating,
          comment: comment || null,
          status: 'PENDING',
        },
      });
    }

    // Actualizar el promedio de calificación del producto
    await updateProductRating(productId);

    revalidatePath(`/product/${product.slug}`);
    revalidatePath('/admin/reviews');
    
    return { 
      success: true, 
      message: existingReview 
        ? 'Reseña actualizada exitosamente. Está pendiente de aprobación.' 
        : 'Reseña enviada exitosamente. Está pendiente de aprobación.',
      review 
    };
  } catch (error) {
    console.error('Error al crear/actualizar reseña:', error);
    return { success: false, error: 'Error al procesar la reseña' };
  }
}

// Obtener reseñas de un producto (solo aprobadas para usuarios normales)
export async function getProductReviews(productId: string, includeAll = false) {
  try {
    const where = includeAll 
      ? { productId }
      : { productId, status: 'APPROVED' as const };

    const reviews = await prisma.review.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return { success: true, reviews };
  } catch (error) {
    console.error('Error al obtener reseñas:', error);
    return { success: false, error: 'Error al cargar reseñas', reviews: [] };
  }
}

// Obtener reseña del usuario actual para un producto
export async function getUserReviewForProduct(productId: string) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return { success: false, review: null };
    }

    const review = await prisma.review.findUnique({
      where: {
        productId_userId: {
          productId,
          userId: session.user.id,
        },
      },
    });

    return { success: true, review };
  } catch (error) {
    console.error('Error al obtener reseña del usuario:', error);
    return { success: false, review: null };
  }
}

// Eliminar reseña (solo el usuario que la creó)
export async function deleteReview(reviewId: string) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return { success: false, error: 'Debes iniciar sesión' };
    }

    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      include: { product: true },
    });

    if (!review) {
      return { success: false, error: 'Reseña no encontrada' };
    }

    if (review.userId !== session.user.id) {
      return { success: false, error: 'No tienes permiso para eliminar esta reseña' };
    }

    await prisma.review.delete({
      where: { id: reviewId },
    });

    // Actualizar el promedio de calificación del producto
    await updateProductRating(review.productId);

    revalidatePath(`/product/${review.product.slug}`);
    
    return { success: true, message: 'Reseña eliminada exitosamente' };
  } catch (error) {
    console.error('Error al eliminar reseña:', error);
    return { success: false, error: 'Error al eliminar la reseña' };
  }
}

// Función auxiliar para actualizar el rating promedio del producto
async function updateProductRating(productId: string) {
  try {
    const reviews = await prisma.review.findMany({
      where: {
        productId,
        status: 'APPROVED',
      },
      select: {
        rating: true,
      },
    });

    const reviewCount = reviews.length;
    const averageRating = reviewCount > 0
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviewCount
      : 0;

    await prisma.product.update({
      where: { id: productId },
      data: {
        averageRating: Math.round(averageRating * 100) / 100, // Redondear a 2 decimales
        reviewCount,
      },
    });
  } catch (error) {
    console.error('Error al actualizar rating del producto:', error);
  }
}

// Obtener estadísticas de reseñas de un producto
export async function getProductReviewStats(productId: string) {
  try {
    const reviews = await prisma.review.findMany({
      where: {
        productId,
        status: 'APPROVED',
      },
      select: {
        rating: true,
      },
    });

    const totalReviews = reviews.length;
    
    if (totalReviews === 0) {
      return {
        success: true,
        stats: {
          averageRating: 0,
          totalReviews: 0,
          distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
        },
      };
    }

    const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews;
    
    const distribution = reviews.reduce((acc, review) => {
      acc[review.rating] = (acc[review.rating] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    // Asegurar que todas las calificaciones estén presentes
    const fullDistribution = {
      5: distribution[5] || 0,
      4: distribution[4] || 0,
      3: distribution[3] || 0,
      2: distribution[2] || 0,
      1: distribution[1] || 0,
    };

    return {
      success: true,
      stats: {
        averageRating: Math.round(averageRating * 100) / 100,
        totalReviews,
        distribution: fullDistribution,
      },
    };
  } catch (error) {
    console.error('Error al obtener estadísticas de reseñas:', error);
    return {
      success: false,
      stats: {
        averageRating: 0,
        totalReviews: 0,
        distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      },
    };
  }
}

// ADMIN: Aprobar reseña
export async function approveReview(reviewId: string) {
  try {
    const session = await auth();
    
    if (!session?.user || !['ADMIN', 'SUPER_ADMIN', 'OWNER', 'MANAGER'].includes(session.user.role as string)) {
      return { success: false, error: 'No tienes permisos' };
    }

    const review = await prisma.review.update({
      where: { id: reviewId },
      data: { status: 'APPROVED' },
      include: { product: true },
    });

    await updateProductRating(review.productId);
    revalidatePath(`/product/${review.product.slug}`);
    revalidatePath('/admin/reviews');
    
    return { success: true, message: 'Reseña aprobada' };
  } catch (error) {
    console.error('Error al aprobar reseña:', error);
    return { success: false, error: 'Error al aprobar la reseña' };
  }
}

// ADMIN: Rechazar reseña
export async function rejectReview(reviewId: string) {
  try {
    const session = await auth();
    
    if (!session?.user || !['ADMIN', 'SUPER_ADMIN', 'OWNER', 'MANAGER'].includes(session.user.role as string)) {
      return { success: false, error: 'No tienes permisos' };
    }

    const review = await prisma.review.update({
      where: { id: reviewId },
      data: { status: 'REJECTED' },
      include: { product: true },
    });

    await updateProductRating(review.productId);
    revalidatePath(`/product/${review.product.slug}`);
    revalidatePath('/admin/reviews');
    
    return { success: true, message: 'Reseña rechazada' };
  } catch (error) {
    console.error('Error al rechazar reseña:', error);
    return { success: false, error: 'Error al rechazar la reseña' };
  }
}

// ADMIN: Obtener todas las reseñas pendientes
export async function getPendingReviews() {
  try {
    const session = await auth();
    
    if (!session?.user || !['ADMIN', 'SUPER_ADMIN', 'OWNER', 'MANAGER'].includes(session.user.role as string)) {
      return { success: false, error: 'No tienes permisos', reviews: [] };
    }

    const reviews = await prisma.review.findMany({
      where: { status: 'PENDING' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        product: {
          select: {
            id: true,
            title: true,
            slug: true,
            images: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return { success: true, reviews };
  } catch (error) {
    console.error('Error al obtener reseñas pendientes:', error);
    return { success: false, error: 'Error al cargar reseñas', reviews: [] };
  }
}

// ADMIN: Obtener todas las reseñas con paginación
export async function getAllReviews(page: number = 1, status?: string) {
  try {
    const session = await auth();
    
    if (!session?.user || !['ADMIN', 'SUPER_ADMIN', 'OWNER', 'MANAGER'].includes(session.user.role as string)) {
      return { success: false, error: 'No tienes permisos', reviews: [], totalPages: 0, totalCount: 0 };
    }

    const take = 20;
    const skip = (page - 1) * take;

    const where = status && status !== 'all' 
      ? { status: status.toUpperCase() as any }
      : {};

    const [reviews, totalCount] = await Promise.all([
      prisma.review.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
          product: {
            select: {
              id: true,
              title: true,
              slug: true,
              images: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take,
        skip,
      }),
      prisma.review.count({ where }),
    ]);

    const totalPages = Math.ceil(totalCount / take);

    return { success: true, reviews, totalPages, totalCount, currentPage: page };
  } catch (error) {
    console.error('Error al obtener reseñas:', error);
    return { success: false, error: 'Error al cargar reseñas', reviews: [], totalPages: 0, totalCount: 0 };
  }
}
