'use client';

import { useState } from 'react';
import { Star, Check, X, Eye, User, Calendar, MessageSquare, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { approveReview, rejectReview } from '@/actions/reviews';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  status: string;
  createdAt: Date;
  user: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
  };
  product: {
    id: string;
    title: string;
    slug: string;
    images: string[];
  };
}

interface Props {
  initialReviews: Review[];
  initialPage: number;
  totalPages: number;
  totalCount: number;
  initialStatus: string;
}

export function ReviewsManagement({ initialReviews, initialPage, totalPages, totalCount, initialStatus }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [reviews, setReviews] = useState(initialReviews);
  const [filter, setFilter] = useState(initialStatus);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleFilterChange = (newFilter: string) => {
    setFilter(newFilter);
    const params = new URLSearchParams(searchParams.toString());
    params.set('status', newFilter);
    params.set('page', '1');
    router.push(`?${params.toString()}`);
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage.toString());
    router.push(`?${params.toString()}`);
  };

  const handleApprove = async (reviewId: string) => {
    setProcessingId(reviewId);
    const result = await approveReview(reviewId);
    
    if (result.success) {
      setReviews(reviews.filter(r => r.id !== reviewId));
      router.refresh();
    } else {
      alert(result.error || 'Error al aprobar la reseña');
    }
    
    setProcessingId(null);
  };

  const handleReject = async (reviewId: string) => {
    if (!confirm('¿Estás seguro de que quieres rechazar esta reseña?')) {
      return;
    }

    setProcessingId(reviewId);
    const result = await rejectReview(reviewId);
    
    if (result.success) {
      setReviews(reviews.filter(r => r.id !== reviewId));
      router.refresh();
    } else {
      alert(result.error || 'Error al rechazar la reseña');
    }
    
    setProcessingId(null);
  };

  return (
    <div className="space-y-6">
      
      {/* Filtros y Stats */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant={filter === 'PENDING' || filter === 'pending' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleFilterChange('PENDING')}
          >
            Pendientes
          </Button>
          <Button
            variant={filter === 'APPROVED' || filter === 'approved' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleFilterChange('APPROVED')}
          >
            Aprobadas
          </Button>
          <Button
            variant={filter === 'REJECTED' || filter === 'rejected' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleFilterChange('REJECTED')}
          >
            Rechazadas
          </Button>
        </div>

        <div className="text-sm text-slate-600">
          Total: <span className="font-semibold">{totalCount}</span> reseñas
        </div>
      </div>

      {/* Lista de reseñas */}
      {reviews.length === 0 ? (
        <Card className="p-12 text-center">
          <MessageSquare className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            No hay reseñas
          </h3>
          <p className="text-slate-600">
            {filter === 'PENDING' || filter === 'pending' ? 'No hay reseñas pendientes de revisión' : 'No se encontraron reseñas con este filtro'}
          </p>
        </Card>
      ) : (
        <>
          <div className="space-y-4">
            {reviews.map((review) => (
              <Card key={review.id} className="p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  
                  {/* Imagen del producto */}
                  <div className="flex-shrink-0">
                    <Link href={`/product/${review.product.slug}`} target="_blank">
                      <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-slate-100 hover:opacity-80 transition-opacity">
                        {review.product.images[0] ? (
                          <Image
                            src={review.product.images[0]}
                            alt={review.product.title}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Eye className="h-8 w-8 text-slate-300" />
                          </div>
                        )}
                      </div>
                    </Link>
                  </div>

                  {/* Contenido */}
                  <div className="flex-1 min-w-0">
                    
                    {/* Header */}
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex-1 min-w-0">
                        <Link 
                          href={`/product/${review.product.slug}`}
                          target="_blank"
                          className="font-semibold text-slate-900 hover:text-primary transition-colors line-clamp-1"
                        >
                          {review.product.title}
                        </Link>
                        <div className="flex items-center gap-3 mt-1 text-sm text-slate-600">
                          <div className="flex items-center gap-1">
                            <User className="h-3.5 w-3.5" />
                            <span>{review.user.name || 'Usuario'}</span>
                          </div>
                          <span>•</span>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            <span>
                              {formatDistanceToNow(new Date(review.createdAt), {
                                addSuffix: true,
                                locale: es,
                              })}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Estado */}
                      <Badge
                        variant={
                          review.status === 'PENDING' ? 'secondary' :
                          review.status === 'APPROVED' ? 'default' :
                          'destructive'
                        }
                      >
                        {review.status === 'PENDING' && 'Pendiente'}
                        {review.status === 'APPROVED' && 'Aprobada'}
                        {review.status === 'REJECTED' && 'Rechazada'}
                      </Badge>
                    </div>

                    {/* Calificación */}
                    <div className="flex items-center gap-1 mb-3">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={cn(
                            'h-5 w-5',
                            star <= review.rating
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-slate-300'
                          )}
                        />
                      ))}
                      <span className="ml-2 text-sm font-medium text-slate-700">
                        {review.rating}/5
                      </span>
                    </div>

                    {/* Comentario */}
                    {review.comment && (
                      <div className="bg-slate-50 rounded-lg p-4 mb-4">
                        <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">
                          {review.comment}
                        </p>
                      </div>
                    )}

                    {/* Acciones */}
                    {review.status === 'PENDING' && (
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleApprove(review.id)}
                          disabled={processingId === review.id}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Aprobar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleReject(review.id)}
                          disabled={processingId === review.id}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                        >
                          <X className="h-4 w-4 mr-1" />
                          Rechazar
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(initialPage - 1)}
                disabled={initialPage <= 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Anterior
              </Button>

              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (initialPage <= 3) {
                    pageNum = i + 1;
                  } else if (initialPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = initialPage - 2 + i;
                  }

                  return (
                    <Button
                      key={pageNum}
                      variant={initialPage === pageNum ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handlePageChange(pageNum)}
                      className="w-10"
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(initialPage + 1)}
                disabled={initialPage >= totalPages}
              >
                Siguiente
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
