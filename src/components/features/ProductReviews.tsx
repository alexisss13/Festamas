'use client';

import { useState } from 'react';
import { Star, ThumbsUp, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ReviewForm } from './ReviewForm';
import { ReviewList } from './ReviewList';
import { cn } from '@/lib/utils';

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: Date;
  user: {
    id: string;
    name: string | null;
    image: string | null;
  };
}

interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  distribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

interface Props {
  productId: string;
  productSlug: string;
  reviews: Review[];
  stats: ReviewStats;
  userReview: Review | null;
  isAuthenticated: boolean;
}

export function ProductReviews({ 
  productId, 
  productSlug,
  reviews: initialReviews, 
  stats, 
  userReview: initialUserReview,
  isAuthenticated 
}: Props) {
  const [showForm, setShowForm] = useState(false);
  const [reviews] = useState(initialReviews);
  const [userReview] = useState(initialUserReview);

  const { averageRating, totalReviews, distribution } = stats;

  return (
    <div className="space-y-8">
      
      {/* RESUMEN DE CALIFICACIONES */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">
          Opiniones de clientes
        </h2>

        <div className="grid md:grid-cols-2 gap-8">
          
          {/* Promedio */}
          <div className="flex flex-col items-center justify-center text-center p-6 bg-slate-50 rounded-xl">
            <div className="text-5xl font-bold text-slate-900 mb-2">
              {averageRating.toFixed(1)}
            </div>
            <div className="flex items-center gap-1 mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={cn(
                    'h-5 w-5',
                    star <= Math.round(averageRating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-slate-300'
                  )}
                />
              ))}
            </div>
            <p className="text-sm text-slate-600">
              Basado en {totalReviews} {totalReviews === 1 ? 'opinión' : 'opiniones'}
            </p>
          </div>

          {/* Distribución */}
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = distribution[rating as keyof typeof distribution];
              const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
              
              return (
                <div key={rating} className="flex items-center gap-3">
                  <div className="flex items-center gap-1 w-16">
                    <span className="text-sm font-medium text-slate-700">{rating}</span>
                    <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                  </div>
                  <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-yellow-400 transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-slate-600 w-12 text-right">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Botón para escribir reseña */}
        {isAuthenticated && (
          <div className="mt-6 pt-6 border-t border-slate-200">
            {userReview ? (
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <ThumbsUp className="h-4 w-4" />
                <span>Ya has dejado una opinión sobre este producto</span>
                <Button
                  variant="link"
                  size="sm"
                  onClick={() => setShowForm(!showForm)}
                  className="text-primary hover:underline p-0 h-auto"
                >
                  {showForm ? 'Cancelar' : 'Editar'}
                </Button>
              </div>
            ) : (
              <Button
                onClick={() => setShowForm(!showForm)}
                className="w-full md:w-auto"
                variant={showForm ? 'outline' : 'default'}
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                {showForm ? 'Cancelar' : 'Escribir una opinión'}
              </Button>
            )}
          </div>
        )}

        {!isAuthenticated && (
          <div className="mt-6 pt-6 border-t border-slate-200">
            <p className="text-sm text-slate-600 text-center">
              <a href="/auth/login" className="text-primary hover:underline font-medium">
                Inicia sesión
              </a>
              {' '}para dejar tu opinión sobre este producto
            </p>
          </div>
        )}
      </div>

      {/* FORMULARIO DE RESEÑA */}
      {showForm && isAuthenticated && (
        <ReviewForm
          productId={productId}
          productSlug={productSlug}
          existingReview={userReview}
          onSuccess={() => setShowForm(false)}
        />
      )}

      {/* LISTA DE RESEÑAS */}
      {reviews.length > 0 && (
        <ReviewList reviews={reviews} currentUserId={userReview?.user?.id || null} />
      )}

      {reviews.length === 0 && !showForm && (
        <div className="text-center py-12 bg-slate-50 rounded-xl border border-slate-200">
          <MessageSquare className="h-12 w-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-600">
            Sé el primero en opinar sobre este producto
          </p>
        </div>
      )}
    </div>
  );
}
