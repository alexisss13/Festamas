'use client';

import { Star, User } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

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

interface Props {
  reviews: Review[];
  currentUserId?: string | null;
}

export function ReviewList({ reviews, currentUserId }: Props) {
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-slate-900 mb-4">
        Opiniones ({reviews.length})
      </h3>

      <div className="space-y-4">
        {reviews.map((review) => {
          const isCurrentUser = currentUserId === review.user.id;
          
          return (
            <div
              key={review.id}
              className={cn(
                'bg-white rounded-xl border p-6 transition-all',
                isCurrentUser 
                  ? 'border-primary/30 bg-primary/5' 
                  : 'border-slate-200 hover:border-slate-300'
              )}
            >
              <div className="flex items-start gap-4">
                
                {/* Avatar */}
                <div className="flex-shrink-0">
                  {review.user.image ? (
                    <Image
                      src={review.user.image}
                      alt={review.user.name || 'Usuario'}
                      width={48}
                      height={48}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center">
                      <User className="h-6 w-6 text-slate-400" />
                    </div>
                  )}
                </div>

                {/* Contenido */}
                <div className="flex-1 min-w-0">
                  
                  {/* Header */}
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-slate-900">
                          {review.user.name || 'Usuario'}
                        </h4>
                        {isCurrentUser && (
                          <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                            Tu opinión
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={cn(
                                'h-4 w-4',
                                star <= review.rating
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-slate-300'
                              )}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-slate-500">
                          {formatDistanceToNow(new Date(review.createdAt), {
                            addSuffix: true,
                            locale: es,
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Comentario */}
                  {review.comment && (
                    <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">
                      {review.comment}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
