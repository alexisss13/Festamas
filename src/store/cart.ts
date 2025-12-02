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
  coupon: { code: string; discount: number; type: 'FIXED' | 'PERCENTAGE' } | null; // 👈 Nuevo estado
  
  addItem: (product: CartItem) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  applyCoupon: (coupon: { code: string; discount: number; type: 'FIXED' | 'PERCENTAGE' }) => void; // 👈 Acción
  removeCoupon: () => void; // 👈 Acción
  
  getTotalItems: () => number;
  getTotalPrice: () => number;
  getDiscountAmount: () => number; // 👈 Helper
  getFinalPrice: () => number; // 👈 Helper
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      coupon: null,

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

      applyCoupon: (coupon) => set({ coupon }),
      removeCoupon: () => set({ coupon: null }),
      
      getTotalItems: () => {
        const { items } = get();
        return items.reduce((total, item) => total + item.quantity, 0);
      },

      getTotalPrice: () => {
        const { items } = get();
        return items.reduce((total, item) => total + item.price * item.quantity, 0);
      },

      // Calcular cuánto se descuenta
      getDiscountAmount: () => {
        const { coupon } = get();
        const subtotal = get().getTotalPrice();
        if (!coupon) return 0;

        if (coupon.type === 'FIXED') return coupon.discount;
        if (coupon.type === 'PERCENTAGE') return (subtotal * coupon.discount) / 100;
        return 0;
      },

      // Precio final a pagar
      getFinalPrice: () => {
        const subtotal = get().getTotalPrice();
        const discount = get().getDiscountAmount();
        return Math.max(0, subtotal - discount);
      },

    }),
    {
      name: 'fiestasya-cart', // Nombre de la llave en localStorage
      // skipHydration: true, // A veces necesario en Next.js, por ahora probemos sin esto
    }
  )
);