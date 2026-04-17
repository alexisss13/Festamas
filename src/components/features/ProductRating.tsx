import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  rating: number;
  reviewCount: number;
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
  className?: string;
}

export function ProductRating({ 
  rating, 
  reviewCount, 
  size = 'sm', 
  showCount = true,
  className 
}: Props) {
  if (reviewCount === 0) return null;

  const sizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={cn(
              sizeClasses[size],
              star <= Math.round(rating)
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-slate-300'
            )}
          />
        ))}
      </div>
      {showCount && (
        <span className={cn('text-slate-600 font-medium', textSizeClasses[size])}>
          {rating.toFixed(1)} ({reviewCount})
        </span>
      )}
    </div>
  );
}
