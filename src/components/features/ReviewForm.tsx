'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { createOrUpdateReview, deleteReview } from '@/actions/reviews';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

interface Props {
  productId: string;
  productSlug: string;
  existingReview?: {
    id: string;
    rating: number;
    comment: string | null;
  } | null;
  onSuccess?: () => void;
}

export function ReviewForm({ productId, productSlug, existingReview, onSuccess }: Props) {
  const router = useRouter();
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState(existingReview?.comment || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      setError('Por favor selecciona una calificación');
      return;
    }

    setIsSubmitting(true);
    setError('');

    const result = await createOrUpdateReview({
      productId,
      rating,
      comment: comment.trim() || undefined,
    });

    setIsSubmitting(false);

    if (result.success) {
      router.refresh();
      onSuccess?.();
    } else {
      setError(result.error || 'Error al enviar la reseña');
    }
  };

  const handleDelete = async () => {
    if (!existingReview?.id) return;
    
    if (!confirm('¿Estás seguro de que quieres eliminar tu reseña?')) {
      return;
    }

    setIsDeleting(true);
    const result = await deleteReview(existingReview.id);
    setIsDeleting(false);

    if (result.success) {
      router.refresh();
      onSuccess?.();
    } else {
      setError(result.error || 'Error al eliminar la reseña');
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8">
      <h3 className="text-xl font-bold text-slate-900 mb-6">
        {existingReview ? 'Editar tu opinión' : 'Escribe tu opinión'}
      </h3>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Calificación */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-3">
            Calificación <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                className="transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
              >
                <Star
                  className={cn(
                    'h-8 w-8 transition-colors',
                    star <= (hoveredRating || rating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-slate-300 hover:text-slate-400'
                  )}
                />
              </button>
            ))}
            {rating > 0 && (
              <span className="ml-2 text-sm text-slate-600">
                {rating === 1 && 'Malo'}
                {rating === 2 && 'Regular'}
                {rating === 3 && 'Bueno'}
                {rating === 4 && 'Muy bueno'}
                {rating === 5 && 'Excelente'}
              </span>
            )}
          </div>
        </div>

        {/* Comentario */}
        <div>
          <label htmlFor="comment" className="block text-sm font-medium text-slate-700 mb-2">
            Comentario (opcional)
          </label>
          <Textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Cuéntanos tu experiencia con este producto..."
            rows={4}
            maxLength={500}
            className="resize-none"
          />
          <p className="text-xs text-slate-500 mt-1">
            {comment.length}/500 caracteres
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Botones */}
        <div className="flex items-center gap-3">
          <Button
            type="submit"
            disabled={isSubmitting || rating === 0}
            className="flex-1 md:flex-none"
          >
            {isSubmitting ? 'Enviando...' : existingReview ? 'Actualizar opinión' : 'Publicar opinión'}
          </Button>

          {existingReview && (
            <Button
              type="button"
              variant="outline"
              onClick={handleDelete}
              disabled={isDeleting}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              {isDeleting ? 'Eliminando...' : 'Eliminar'}
            </Button>
          )}
        </div>

        {!existingReview && (
          <p className="text-xs text-slate-500">
            Tu opinión será revisada antes de publicarse
          </p>
        )}
      </form>
    </div>
  );
}
