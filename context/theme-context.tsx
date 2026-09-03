"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

type Theme = "light" | "dark";

type ThemeContextValue = {
  theme: Theme;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      setTheme(document.documentElement.classList.contains("dark") ? "dark" : "light");
    });
    return () => window.cancelAnimationFrame(frameId);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((currentTheme) => {
      const nextTheme: Theme = currentTheme === "dark" ? "light" : "dark";
      document.documentElement.classList.toggle("dark", nextTheme === "dark");
      try {
        window.localStorage.setItem("theme", nextTheme);
      } catch {
        // Тема продолжит работать в текущем сеансе, даже если localStorage недоступен.
      }
      return nextTheme;
    });
  }, []);

  const value = useMemo(() => ({ theme, toggleTheme }), [theme, toggleTheme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme должен использоваться внутри ThemeProvider");
  return context;
}
