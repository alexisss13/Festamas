import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Definimos qué forma tiene un producto EN EL CARRITO (puede ser diferente a la BD)
export interface CartItem {
  id: string;
  slug: string;
  title: string;
  price: number;
  image: string;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  // Actions
  addItem: (product: CartItem) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  // Computed (Getters)
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product) => {
        const { items } = get();
        // 1. ¿El producto ya existe en el carrito?
        const productInCart = items.some((item) => item.id === product.id);

        if (!productInCart) {
          // Si no existe, lo agregamos con las propiedades que vienen
          set({ items: [...items, product] });
          return;
        }

        // 2. Si ya existe, solo aumentamos la cantidad +1
        const updatedItems = items.map((item) => {
          if (item.id === product.id) {
            return { ...item, quantity: item.quantity + 1 };
          }
          return item;
        });

        set({ items: updatedItems });
      },

      removeItem: (productId) => {
        const { items } = get();
        set({
          items: items.filter((item) => item.id !== productId),
        });
      },

      updateQuantity: (productId, quantity) => {
        const { items } = get();
        const updatedItems = items.map((item) => {
          if (item.id === productId) {
            // Evitamos cantidades negativas o cero
            return { ...item, quantity: Math.max(1, quantity) };
          }
          return item;
        });
        set({ items: updatedItems });
      },

      clearCart: () => {
        set({ items: [] });
      },

      getTotalItems: () => {
        const { items } = get();
        return items.reduce((total, item) => total + item.quantity, 0);
      },

      getTotalPrice: () => {
        const { items } = get();
        return items.reduce((total, item) => total + item.price * item.quantity, 0);
      },
    }),
    {
      name: 'fiestasya-cart', // Nombre de la llave en localStorage
      // skipHydration: true, // A veces necesario en Next.js, por ahora probemos sin esto
    }
  )
);