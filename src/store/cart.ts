import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Definimos una interfaz local para el Cupón (para evitar problemas con Decimal de Prisma en el cliente)
export interface CartCoupon {
  code: string;
  discount: number; // Valor numérico
  type: 'FIXED' | 'PERCENTAGE';
}

export interface CartProduct {
  id: string;
  slug: string;
  title: string;
  price: number;
  image: string;
  quantity: number;
  stock: number;
  division: string;
  wholesalePrice?: number | null;
  wholesaleMinCount?: number | null;
  discountPercentage?: number;
}

interface CartState {
  cart: CartProduct[];
  coupon: CartCoupon | null; // 👈 Nuevo estado para el cupón
  
  // Actions
  addProductToCart: (product: CartProduct) => void;
  removeProduct: (productId: string) => void;
  updateProductQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  
  applyCoupon: (coupon: CartCoupon) => void; // 👈 Nuevo
  removeCoupon: () => void; // 👈 Nuevo
  
  // Getters
  getTotalItems: () => number;
  getSubtotalPrice: () => number;
  getDiscountAmount: () => number; // 👈 Nuevo
  getFinalPrice: () => number; // 👈 Nuevo
}

// Helper para calcular precio efectivo de un item (Mayorista o Descuento)
export const getEffectivePrice = (item: CartProduct) => {
  if (
    item.wholesalePrice && 
    item.wholesalePrice > 0 && 
    item.wholesaleMinCount && 
    item.quantity >= item.wholesaleMinCount
  ) {
    return Number(item.wholesalePrice);
  }

  if (item.discountPercentage && item.discountPercentage > 0) {
    return item.price * (1 - item.discountPercentage / 100);
  }

  return item.price;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cart: [],
      coupon: null,

      getTotalItems: () => {
        const { cart } = get();
        return cart ? cart.reduce((total, item) => total + item.quantity, 0) : 0;
      },

      getSubtotalPrice: () => {
        const { cart } = get();
        return cart ? cart.reduce((subTotal, item) => {
          const effectivePrice = getEffectivePrice(item);
          return (item.quantity * effectivePrice) + subTotal;
        }, 0) : 0;
      },

      // Calcula cuánto se descuenta en total gracias al cupón
      getDiscountAmount: () => {
        const { coupon, getSubtotalPrice } = get();
        const subtotal = getSubtotalPrice();
        
        if (!coupon) return 0;

        if (coupon.type === 'FIXED') {
          return Math.min(coupon.discount, subtotal); // No descontar más que el total
        } else {
          // Porcentaje
          return subtotal * (coupon.discount / 100);
        }
      },

      // Precio final a pagar (Subtotal - Cupón)
      getFinalPrice: () => {
        const { getSubtotalPrice, getDiscountAmount } = get();
        return Math.max(0, getSubtotalPrice() - getDiscountAmount());
      },

      addProductToCart: (product: CartProduct) => {
        const { cart } = get();
        const currentCart = cart || []; 
        const productInCart = currentCart.some(item => item.id === product.id);

        if (!productInCart) {
          set({ cart: [...currentCart, product] });
          return;
        }

        const updatedCart = currentCart.map(item => {
          if (item.id === product.id) {
            return { ...item, quantity: item.quantity + product.quantity };
          }
          return item;
        });

        set({ cart: updatedCart });
      },

      updateProductQuantity: (productId: string, quantity: number) => {
        const { cart } = get();
        const updatedCart = cart.map(item => {
          if (item.id === productId) {
            return { ...item, quantity: Math.max(1, quantity) }; 
          }
          return item;
        });
        set({ cart: updatedCart });
      },

      removeProduct: (productId: string) => {
        const { cart } = get();
        const updatedCart = cart.filter(item => item.id !== productId);
        set({ cart: updatedCart });
      },

      clearCart: () => {
        set({ cart: [], coupon: null });
      },

      applyCoupon: (coupon: CartCoupon) => {
        set({ coupon });
      },

      removeCoupon: () => {
        set({ coupon: null });
      }
    }),
    {
      name: 'festamas-cart-v4', // Versión 4 para incluir cupones
    }
  )
);