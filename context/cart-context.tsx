"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
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
  incrementItem: (productId: string, size: string) => void;
  decrementItem: (productId: string, size: string) => void;
  removeItemEntirely: (productId: string, size: string) => void;
  clearCart: () => void;
  isDrawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  cartNotice: string | null;
};

const CartContext = createContext<CartContextValue | null>(null);
const CART_STORAGE_KEY = "cart-items";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [cartNotice, setCartNotice] = useState<string | null>(null);
  const noticeTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    try {
      const savedItems = localStorage.getItem(CART_STORAGE_KEY);
      if (savedItems) {
        const parsedItems: unknown = JSON.parse(savedItems);
        // eslint-disable-next-line react-hooks/set-state-in-effect -- клиентская гидратация внешнего хранилища при монтировании.
        if (Array.isArray(parsedItems)) setItems(parsedItems as CartItem[]);
      }
    } catch {
      // Недоступное или повреждённое хранилище не должно мешать работе корзины.
    } finally {
      setIsHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch {
      // В приватном режиме браузер может запретить запись в localStorage.
    }
  }, [isHydrated, items]);

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
    if (window.matchMedia("(min-width: 640px)").matches) {
      setIsDrawerOpen(true);
    } else {
      if (noticeTimeoutRef.current) window.clearTimeout(noticeTimeoutRef.current);
      setCartNotice("Добавлено в корзину");
      noticeTimeoutRef.current = window.setTimeout(() => setCartNotice(null), 2200);
    }
  }

  function removeItemEntirely(productId: string, size: string) {
    setItems((currentItems) => currentItems.filter((item) => item.id !== productId || item.size !== size));
  }

  function incrementItem(productId: string, size: string) {
    setItems((currentItems) => currentItems.map((item) => item.id === productId && item.size === size ? { ...item, quantity: item.quantity + 1 } : item));
  }

  const decrementItem = useCallback((productId: string, size: string) => {
    setItems((currentItems) => currentItems.flatMap((item) => {
      if (item.id !== productId || item.size !== size) return [item];
      return item.quantity > 1 ? [{ ...item, quantity: item.quantity - 1 }] : [];
    }));
  }, []);

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
      incrementItem,
      decrementItem,
      removeItemEntirely,
      clearCart,
      isDrawerOpen,
      openDrawer,
      closeDrawer,
      cartNotice,
    }),
    [items, isDrawerOpen, decrementItem, cartNotice],
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
