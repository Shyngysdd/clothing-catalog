import type { Metadata } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import Script from "next/script";
import { SessionGate } from "@/components/session-gate";
import { CartProvider } from "@/context/cart-context";
import { FavoritesProvider } from "@/context/favorites-context";
import { ThemeProvider } from "@/context/theme-context";
import { BRAND_CONFIG } from "@/lib/brand-config";
import { getLocale } from "next-intl/server";
import "./globals.css";

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-instrument-serif",
  fallback: ["Georgia", "serif"],
});

const geist = Geist({
  subsets: ["latin", "cyrillic"],
  variable: "--font-geist",
});

const geistMono = Geist_Mono({
  subsets: ["latin", "cyrillic"],
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: `${BRAND_CONFIG.name} — каталог одежды и обуви`,
  description: "Демо-каталог одежды и обуви: выберите товары и оформите заказ через WhatsApp.",
  icons: {
    icon: "/icon",
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  return (
    <html lang={locale} suppressHydrationWarning className={`${instrumentSerif.variable} ${geist.variable} ${geistMono.variable} h-full`}>
      <head>
        <Script id="theme-init" strategy="beforeInteractive">{`try { const savedTheme = localStorage.getItem('theme'); const theme = savedTheme || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'); document.documentElement.classList.toggle('dark', theme === 'dark'); } catch {}`}</Script>
      </head>
      <body className="flex min-h-full flex-col antialiased">
        <ThemeProvider>
          <FavoritesProvider>
            <CartProvider>
              <SessionGate>
                {children}
              </SessionGate>
            </CartProvider>
          </FavoritesProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
