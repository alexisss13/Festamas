'use client';

import { useTransition, useEffect, useState } from 'react';
import { Heart, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { toggleFavorite } from '@/actions/favorites';
import { toast } from 'sonner';
import { useFavoritesStore } from '@/store/favorites';

interface Props {
  productId: string;
  className?: string;
}

export const FavoriteButton = ({ productId, className }: Props) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [mounted, setMounted] = useState(false);
  
  // Estado global de favoritos
  const isFavorite = useFavoritesStore(state => state.isFavorite(productId));
  const addFavorite = useFavoritesStore(state => state.addFavorite);
  const removeFavorite = useFavoritesStore(state => state.removeFavorite);

  // Evitar hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Optimistic Update
    if (isFavorite) {
        removeFavorite(productId);
    } else {
        addFavorite(productId);
    }

    startTransition(async () => {
      const { ok, message, isFavorite: newState } = await toggleFavorite(productId);
      
      if (!ok) {
        // Revertir cambio si falló
        if (isFavorite) addFavorite(productId); 
        else removeFavorite(productId);

        if (message === 'Debes iniciar sesión') {
            toast.error("Inicia sesión para guardar favoritos");
            router.push('/auth/login');
        } else {
            toast.error(message);
        }
        return;
      }
      
      if (newState) {
        toast.success(message);
      }
    });
  };

  // Renderizar estado neutral hasta que se monte en el cliente
  if (!mounted) {
    return (
      <button
        disabled
        className={cn(
          "group/heart relative p-2 rounded-full bg-white/90 shadow-sm",
          className
        )}
      >
        <Heart className="w-4 h-4 text-slate-400" />
      </button>
    );
  }

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      className={cn(
        "group/heart relative p-2 rounded-full bg-white/90 shadow-sm hover:shadow-md transition-all hover:scale-110 active:scale-95",
        className
      )}
    >
      {isPending ? (
        <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
      ) : (
        <Heart
          className={cn(
            "w-4 h-4 transition-colors duration-300",
            isFavorite 
              ? "fill-rose-500 text-rose-500"
              : "text-slate-400 group-hover/heart:text-rose-500"
          )}
        />
      )}
    </button>
  );
};