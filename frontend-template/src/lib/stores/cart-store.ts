import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Cart, CartItem, Product, ProductVariant } from '@/lib/api/types';

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  isLoading: boolean;
  discountCode: string | null;
  discountAmount: number;

  // Actions
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addItem: (product: Product, quantity?: number, variant?: ProductVariant) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  removeItem: (itemId: string) => void;
  clearCart: () => void;
  applyDiscount: (code: string, amount: number) => void;
  removeDiscount: () => void;

  // Computed getters
  getItemCount: () => number;
  getSubtotal: () => number;
  getTotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      isLoading: false,
      discountCode: null,
      discountAmount: 0,

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

      addItem: (product, quantity = 1, variant) => {
        const items = get().items;
        const existingIndex = items.findIndex(
          (item) =>
            item.productId === product.id &&
            (variant ? item.variantId === variant.id : !item.variantId)
        );

        if (existingIndex >= 0) {
          const newItems = [...items];
          newItems[existingIndex] = {
            ...newItems[existingIndex],
            quantity: newItems[existingIndex].quantity + quantity,
          };
          set({ items: newItems, isOpen: true });
        } else {
          const newItem: CartItem = {
            id: `${product.id}-${variant?.id || 'main'}-${Date.now()}`,
            productId: product.id,
            variantId: variant?.id,
            quantity,
            product,
            variant,
          };
          set({ items: [...items, newItem], isOpen: true });
        }
      },

      updateQuantity: (itemId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(itemId);
          return;
        }

        set((state) => ({
          items: state.items.map((item) =>
            item.id === itemId ? { ...item, quantity } : item
          ),
        }));
      },

      removeItem: (itemId) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== itemId),
        }));
      },

      clearCart: () => {
        set({ items: [], discountCode: null, discountAmount: 0 });
      },

      applyDiscount: (code, amount) => {
        set({ discountCode: code, discountAmount: amount });
      },

      removeDiscount: () => {
        set({ discountCode: null, discountAmount: 0 });
      },

      getItemCount: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },

      getSubtotal: () => {
        return get().items.reduce((sum, item) => {
          const price = item.variant?.price ?? item.product.price;
          return sum + price * item.quantity;
        }, 0);
      },

      getTotal: () => {
        const subtotal = get().getSubtotal();
        const discount = get().discountAmount;
        return Math.max(0, subtotal - discount);
      },
    }),
    {
      name: 'cart-storage',
      partialize: (state) => ({
        items: state.items,
        discountCode: state.discountCode,
        discountAmount: state.discountAmount,
      }),
    }
  )
);
