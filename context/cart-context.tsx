"use client";

import { createContext, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { CatalogProduct } from "@/lib/catalog-types";

export type CartItem = CatalogProduct & {
  size: string;
  quantity: number;
};

type CartContextValue = {
  items: CartItem[];
  itemCount: number;
  totalPrice: number;
  addItem: (product: CatalogProduct, size: string) => void;
  removeItem: (productId: string, size: string) => void;
  clearCart: () => void;
  isDrawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  function addItem(product: CatalogProduct, size: string) {
    setItems((currentItems) => {
      const matchingItem = currentItems.find(
        (item) => item.id === product.id && item.size === size,
      );

      if (matchingItem) {
        return currentItems.map((item) =>
          item.id === product.id && item.size === size
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }

      return [...currentItems, { ...product, size, quantity: 1 }];
    });
  }

  function removeItem(productId: string, size: string) {
    setItems((currentItems) =>
      currentItems.flatMap((item) => {
        if (item.id !== productId || item.size !== size) return [item];
        return item.quantity > 1 ? [{ ...item, quantity: item.quantity - 1 }] : [];
      }),
    );
  }

  function clearCart() {
    setItems([]);
  }

  function openDrawer() {
    setIsDrawerOpen(true);
  }

  function closeDrawer() {
    setIsDrawerOpen(false);
  }

  const value = useMemo(
    () => ({
      items,
      itemCount: items.reduce((count, item) => count + item.quantity, 0),
      totalPrice: items.reduce((total, item) => total + item.price * item.quantity, 0),
      addItem,
      removeItem,
      clearCart,
      isDrawerOpen,
      openDrawer,
      closeDrawer,
    }),
    [items, isDrawerOpen],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart должен использоваться внутри CartProvider");
  }

  return context;
}
