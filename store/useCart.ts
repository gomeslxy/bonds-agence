'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  size: string;
  color: string;
  quantity: number;
  category: string;
}

interface CartStore {
  items: CartItem[];
  isOpen: boolean;

  // Actions
  openCart:   () => void;
  closeCart:  () => void;
  toggleCart: () => void;

  addItem:      (item: Omit<CartItem, 'quantity'>) => void;
  removeItem:   (id: string, size: string) => void;
  updateQty:    (id: string, size: string, qty: number) => void;
  clearCart:    () => void;

  // Computed helpers (as getters)
  totalItems: () => number;
  totalPrice: () => number;
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      openCart:   () => set({ isOpen: true }),
      closeCart:  () => set({ isOpen: false }),
      toggleCart: () => set((s) => ({ isOpen: !s.isOpen })),

      addItem: (incoming) => {
        const { items } = get();
        const existing = items.find(
          (i) => i.id === incoming.id && i.size === incoming.size
        );

        if (existing) {
          set({
            items: items.map((i) =>
              i.id === incoming.id && i.size === incoming.size
                ? { ...i, quantity: i.quantity + 1 }
                : i
            ),
            isOpen: true,
          });
        } else {
          set({ items: [...items, { ...incoming, quantity: 1 }], isOpen: true });
        }
      },

      removeItem: (id, size) =>
        set((s) => ({
          items: s.items.filter((i) => !(i.id === id && i.size === size)),
        })),

      updateQty: (id, size, qty) => {
        if (qty <= 0) {
          get().removeItem(id, size);
          return;
        }
        set((s) => ({
          items: s.items.map((i) =>
            i.id === id && i.size === size ? { ...i, quantity: qty } : i
          ),
        }));
      },

      clearCart: () => set({ items: [] }),

      totalItems: () => get().items.reduce((acc, i) => acc + i.quantity, 0),
      totalPrice: () =>
        get().items.reduce((acc, i) => acc + i.price * i.quantity, 0),
    }),
    {
      name: 'bonds-cart',
      partialize: (s) => ({ items: s.items }),
    }
  )
);
