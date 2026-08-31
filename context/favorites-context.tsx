"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { mergeGuestFavorites, toggleCustomerFavorite } from "@/app/favorites/actions";

const FAVORITES_STORAGE_KEY = "favorite-product-ids";

export type FavoriteEntry = { productId: string; selectedSize?: string | null };

type FavoritesContextValue = {
  favorites: FavoriteEntry[];
  favoriteIds: string[];
  isFavorite: (productId: string) => boolean;
  getFavorite: (productId: string) => FavoriteEntry | undefined;
  toggleFavorite: (productId: string, selectedSize?: string) => void;
};

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

function readGuestFavorites(): FavoriteEntry[] {
  try {
    const savedValue = window.localStorage.getItem(FAVORITES_STORAGE_KEY);
    const parsedValue: unknown = savedValue ? JSON.parse(savedValue) : [];
    if (!Array.isArray(parsedValue)) return [];
    const parsedFavorites = parsedValue.flatMap((item): FavoriteEntry[] => {
      if (typeof item === "string") return [{ productId: item }];
      if (typeof item === "object" && item && "productId" in item && typeof item.productId === "string") {
        return [{ productId: item.productId, selectedSize: "selectedSize" in item && typeof item.selectedSize === "string" ? item.selectedSize : undefined }];
      }
      return [];
    });
    return [...new Map(parsedFavorites.map((favorite) => [favorite.productId, favorite])).values()];
  } catch {
    return [];
  }
}

export function FavoritesProvider({ children, isCustomerLoggedIn, initialFavorites }: { children: ReactNode; isCustomerLoggedIn: boolean; initialFavorites: FavoriteEntry[] }) {
  const [favorites, setFavorites] = useState(initialFavorites);

  useEffect(() => {
    if (isCustomerLoggedIn) {
      const guestFavorites = readGuestFavorites();
      if (guestFavorites.length === 0) return;
      void mergeGuestFavorites(guestFavorites).then((result) => {
        if (!result.authenticated) return;
        setFavorites((current) => [...new Map([...current, ...guestFavorites].map((favorite) => [favorite.productId, favorite])).values()]);
        window.localStorage.removeItem(FAVORITES_STORAGE_KEY);
      });
      return;
    }
    const frameId = window.requestAnimationFrame(() => setFavorites(readGuestFavorites()));
    return () => window.cancelAnimationFrame(frameId);
  }, [isCustomerLoggedIn]);

  const toggleFavorite = useCallback((productId: string, selectedSize?: string) => {
    const existing = favorites.find((favorite) => favorite.productId === productId);
    const nextFavorites = existing ? favorites.filter((favorite) => favorite.productId !== productId) : [...favorites, { productId, selectedSize }];
    setFavorites(nextFavorites);

    if (!isCustomerLoggedIn) {
      window.localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(nextFavorites));
      return;
    }

    void toggleCustomerFavorite(productId, selectedSize).then((result) => {
      if (!result.authenticated) return;
      setFavorites((current) => result.favorite ? [...new Map([...current, { productId, selectedSize }].map((favorite) => [favorite.productId, favorite])).values()] : current.filter((favorite) => favorite.productId !== productId));
    });
  }, [favorites, isCustomerLoggedIn]);

  const value = useMemo(() => {
    const favoriteIds = favorites.map((favorite) => favorite.productId);
    return { favorites, favoriteIds, isFavorite: (productId: string) => favoriteIds.includes(productId), getFavorite: (productId: string) => favorites.find((favorite) => favorite.productId === productId), toggleFavorite };
  }, [favorites, toggleFavorite]);

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) throw new Error("useFavorites должен использоваться внутри FavoritesProvider");
  return context;
}
