'use client';

import { useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useCartStore } from '@/store/cart';
import { loadUserCart, syncCartToDB } from '@/actions/cart';

export const CartSyncProvider = ({ children }: { children: React.ReactNode }) => {
  const { status } = useSession();
  const cart = useCartStore(state => state.cart);
  const addProductToCart = useCartStore(state => state.addProductToCart);
  const updateProductQuantity = useCartStore(state => state.updateProductQuantity);
  const hasLoaded = useRef(false);
  const syncTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Merge DB cart into local on first authenticated load
  useEffect(() => {
    if (status !== 'authenticated' || hasLoaded.current) return;
    hasLoaded.current = true;

    loadUserCart().then(dbCart => {
      const currentCart = useCartStore.getState().cart;
      for (const dbItem of dbCart) {
        const local = currentCart.find(i => i.id === dbItem.id);
        if (!local) {
          addProductToCart(dbItem);
        } else if (dbItem.quantity > local.quantity) {
          updateProductQuantity(dbItem.id, dbItem.quantity);
        }
      }
    });
  }, [status, addProductToCart, updateProductQuantity]);

  // Debounced sync to DB on every cart change
  useEffect(() => {
    if (status !== 'authenticated') return;
    clearTimeout(syncTimeout.current);
    syncTimeout.current = setTimeout(() => {
      void syncCartToDB(cart.map(i => ({ productId: i.id, quantity: i.quantity })));
    }, 1500);
    return () => clearTimeout(syncTimeout.current);
  }, [cart, status]);

  return <>{children}</>;
};
