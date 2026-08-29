"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { mergeGuestFavorites, toggleCustomerFavorite } from "@/app/favorites/actions";

const FAVORITES_STORAGE_KEY = "favorite-product-ids";

type FavoritesContextValue = {
  favoriteIds: string[];
  isFavorite: (productId: string) => boolean;
  toggleFavorite: (productId: string) => void;
};

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

function readGuestFavorites() {
  try {
    const savedValue = window.localStorage.getItem(FAVORITES_STORAGE_KEY);
    const parsedValue: unknown = savedValue ? JSON.parse(savedValue) : [];
    return Array.isArray(parsedValue) ? parsedValue.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}

export function FavoritesProvider({ children, isCustomerLoggedIn, initialFavoriteIds }: { children: ReactNode; isCustomerLoggedIn: boolean; initialFavoriteIds: string[] }) {
  const [favoriteIds, setFavoriteIds] = useState(initialFavoriteIds);

  useEffect(() => {
    if (isCustomerLoggedIn) {
      const guestFavoriteIds = readGuestFavorites();
      if (guestFavoriteIds.length === 0) return;

      void mergeGuestFavorites(guestFavoriteIds).then((result) => {
        if (!result.authenticated) return;
        setFavoriteIds((currentIds) => [...new Set([...currentIds, ...result.mergedProductIds])]);
        window.localStorage.removeItem(FAVORITES_STORAGE_KEY);
      });
      return;
    }

    const frameId = window.requestAnimationFrame(() => setFavoriteIds(readGuestFavorites()));
    return () => window.cancelAnimationFrame(frameId);
  }, [isCustomerLoggedIn]);

  const toggleFavorite = useCallback((productId: string) => {
    const nextFavorite = !favoriteIds.includes(productId);
    setFavoriteIds((currentIds) => nextFavorite ? [...currentIds, productId] : currentIds.filter((id) => id !== productId));

    if (!isCustomerLoggedIn) {
      const nextIds = nextFavorite ? [...favoriteIds, productId] : favoriteIds.filter((id) => id !== productId);
      window.localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(nextIds));
      return;
    }

    void toggleCustomerFavorite(productId).then((result) => {
      if (!result.authenticated) return;
      setFavoriteIds((currentIds) => result.favorite ? [...new Set([...currentIds, productId])] : currentIds.filter((id) => id !== productId));
    });
  }, [favoriteIds, isCustomerLoggedIn]);

  const value = useMemo(() => ({
    favoriteIds,
    isFavorite: (productId: string) => favoriteIds.includes(productId),
    toggleFavorite,
  }), [favoriteIds, toggleFavorite]);

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) throw new Error("useFavorites должен использоваться внутри FavoritesProvider");
  return context;
}
