"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useFavorites, type FavoriteEntry } from "@/context/favorites-context";
import type { SavedAddress } from "@/lib/address-format";

type SessionState = {
  isCustomerLoggedIn: boolean;
  savedAddresses: SavedAddress[];
  categories: { name: string; count: number }[];
};

type SessionResponse = SessionState & { favorites: FavoriteEntry[]; lookFavoriteIds: string[] };

const SessionContext = createContext<SessionState>({
  isCustomerLoggedIn: false,
  savedAddresses: [],
  categories: [],
});

function isSessionResponse(value: unknown): value is SessionResponse {
  return typeof value === "object" && value !== null
    && "isCustomerLoggedIn" in value && typeof value.isCustomerLoggedIn === "boolean"
    && "favorites" in value && Array.isArray(value.favorites)
    && "lookFavoriteIds" in value && Array.isArray(value.lookFavoriteIds)
    && "savedAddresses" in value && Array.isArray(value.savedAddresses)
    && "categories" in value && Array.isArray(value.categories);
}

export function SessionGate({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { setSession } = useFavorites();
  const [session, setSessionState] = useState<SessionState>({ isCustomerLoggedIn: false, savedAddresses: [], categories: [] });

  useEffect(() => {
    const controller = new AbortController();

    async function loadSession() {
      try {
        const response = await fetch("/api/session", { signal: controller.signal, cache: "no-store" });
        const payload: unknown = await response.json();
        if (!response.ok || !isSessionResponse(payload)) return;
        setSession({ isCustomerLoggedIn: payload.isCustomerLoggedIn, favorites: payload.favorites, lookFavoriteIds: payload.lookFavoriteIds });
        setSessionState({
          isCustomerLoggedIn: payload.isCustomerLoggedIn,
          savedAddresses: payload.savedAddresses,
          categories: payload.categories,
        });
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
      }
    }

    void loadSession();
    return () => controller.abort();
  }, [pathname, setSession]);

  const value = useMemo(() => session, [session]);
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  return useContext(SessionContext);
}
