"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { mergeGuestFavorites, mergeGuestLookFavorites, toggleCustomerFavorite, toggleCustomerLookFavorite } from "@/app/[locale]/favorites/actions";

const FAVORITES_STORAGE_KEY = "favorite-product-ids";
const LOOK_FAVORITES_STORAGE_KEY = "favorite-look-ids";

export type FavoriteEntry = { productId: string; selectedSize?: string | null };

type FavoritesContextValue = {
  favorites: FavoriteEntry[];
  favoriteIds: string[];
  lookFavoriteIds: string[];
  isCustomerLoggedIn: boolean;
  setSession: (session: { isCustomerLoggedIn: boolean; favorites: FavoriteEntry[]; lookFavoriteIds: string[] }) => void;
  isFavorite: (productId: string) => boolean;
  getFavorite: (productId: string) => FavoriteEntry | undefined;
  toggleFavorite: (productId: string, selectedSize?: string) => void;
  isLookFavorite: (lookId: string) => boolean;
  toggleLookFavorite: (lookId: string) => void;
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

function readGuestLookFavorites(): string[] {
  try {
    const savedValue = window.localStorage.getItem(LOOK_FAVORITES_STORAGE_KEY);
    const parsedValue: unknown = savedValue ? JSON.parse(savedValue) : [];
    return Array.isArray(parsedValue) ? [...new Set(parsedValue.filter((item): item is string => typeof item === "string"))] : [];
  } catch {
    return [];
  }
}

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<FavoriteEntry[]>([]);
  const [lookFavoriteIds, setLookFavoriteIds] = useState<string[]>([]);
  const [isCustomerLoggedIn, setIsCustomerLoggedIn] = useState(false);

  useEffect(() => {
    if (isCustomerLoggedIn) {
      const guestFavorites = readGuestFavorites();
      if (guestFavorites.length > 0) {
        void mergeGuestFavorites(guestFavorites).then((result) => {
          if (!result.authenticated) return;
          setFavorites((current) => [...new Map([...current, ...guestFavorites].map((favorite) => [favorite.productId, favorite])).values()]);
          window.localStorage.removeItem(FAVORITES_STORAGE_KEY);
        });
      }
      const guestLookFavorites = readGuestLookFavorites();
      if (guestLookFavorites.length > 0) {
        void mergeGuestLookFavorites(guestLookFavorites).then((result) => {
          if (!result.authenticated) return;
          setLookFavoriteIds((current) => [...new Set([...current, ...guestLookFavorites])]);
          window.localStorage.removeItem(LOOK_FAVORITES_STORAGE_KEY);
        });
      }
      return;
    }
    const frameId = window.requestAnimationFrame(() => {
      setFavorites(readGuestFavorites());
      setLookFavoriteIds(readGuestLookFavorites());
    });
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

  const toggleLookFavorite = useCallback((lookId: string) => {
    const nextLookFavoriteIds = lookFavoriteIds.includes(lookId)
      ? lookFavoriteIds.filter((id) => id !== lookId)
      : [...lookFavoriteIds, lookId];
    setLookFavoriteIds(nextLookFavoriteIds);

    if (!isCustomerLoggedIn) {
      window.localStorage.setItem(LOOK_FAVORITES_STORAGE_KEY, JSON.stringify(nextLookFavoriteIds));
      return;
    }

    void toggleCustomerLookFavorite(lookId).then((result) => {
      if (!result.authenticated) return;
      setLookFavoriteIds((current) => result.favorite ? [...new Set([...current, lookId])] : current.filter((id) => id !== lookId));
    });
  }, [isCustomerLoggedIn, lookFavoriteIds]);

  const setSession = useCallback((session: { isCustomerLoggedIn: boolean; favorites: FavoriteEntry[]; lookFavoriteIds: string[] }) => {
    setIsCustomerLoggedIn(session.isCustomerLoggedIn);
    setFavorites(session.isCustomerLoggedIn ? session.favorites : readGuestFavorites());
    setLookFavoriteIds(session.isCustomerLoggedIn ? session.lookFavoriteIds : readGuestLookFavorites());
  }, []);

  const value = useMemo(() => {
    const favoriteIds = favorites.map((favorite) => favorite.productId);
    return { favorites, favoriteIds, lookFavoriteIds, isCustomerLoggedIn, setSession, isFavorite: (productId: string) => favoriteIds.includes(productId), getFavorite: (productId: string) => favorites.find((favorite) => favorite.productId === productId), toggleFavorite, isLookFavorite: (lookId: string) => lookFavoriteIds.includes(lookId), toggleLookFavorite };
  }, [favorites, isCustomerLoggedIn, lookFavoriteIds, setSession, toggleFavorite, toggleLookFavorite]);

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) throw new Error("useFavorites должен использоваться внутри FavoritesProvider");
  return context;
}
