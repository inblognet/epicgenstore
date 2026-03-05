// lib/cart-store.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface CartItem {
  id: string; // Product ID
  name: string;
  slug: string;
  price: number;
  imageUrl: string | null;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean; // --- NEW: Track if the cart is open ---
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  openCart: () => void; // --- NEW: Function to open cart ---
  closeCart: () => void; // --- NEW: Function to close cart ---
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false, // Initial state is closed

      // --- NEW FUNCTIONS ---
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      addItem: (item) => {
        const currentItems = get().items;
        const existingItem = currentItems.find((i) => i.id === item.id);

        if (existingItem) {
          // If product is already in cart, just increase the quantity
          set({
            items: currentItems.map((i) =>
              i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i
            )
          });
        } else {
          // Otherwise, add the new item
          set({ items: [...currentItems, item] });
        }
      },
      removeItem: (id) => set({ items: get().items.filter((i) => i.id !== id) }),
      updateQuantity: (id, quantity) => set({
        items: get().items.map((i) => i.id === id ? { ...i, quantity } : i)
      }),
      clearCart: () => set({ items: [] }),
      getTotal: () => get().items.reduce((total, item) => total + (item.price * item.quantity), 0),
    }),
    {
      name: "epicgenstore-cart", // The key used in localStorage
      storage: createJSONStorage(() => localStorage),
      skipHydration: true, // Crucial: We tell Zustand NOT to hydrate immediately on the server

      // --- NEW: Only save the 'items' to local storage, not the 'isOpen' state ---
      partialize: (state) => ({ items: state.items }),
    }
  )
);