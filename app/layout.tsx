import type { Metadata } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import { SiteChrome } from "@/components/site-chrome";
import { MobileTabbar } from "@/components/mobile-tabbar";
import { SessionGate } from "@/components/session-gate";
import { CartProvider } from "@/context/cart-context";
import { FavoritesProvider } from "@/context/favorites-context";
import { ThemeProvider } from "@/context/theme-context";
import { BRAND_CONFIG } from "@/lib/brand-config";
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

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ru" suppressHydrationWarning className={`${instrumentSerif.variable} ${geist.variable} ${geistMono.variable} h-full`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: "try { const savedTheme = localStorage.getItem('theme'); const theme = savedTheme || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'); document.documentElement.classList.toggle('dark', theme === 'dark'); } catch {}" }} />
      </head>
      <body className="flex min-h-full flex-col antialiased">
        <ThemeProvider>
          <FavoritesProvider>
            <CartProvider>
              <SessionGate>
                <SiteChrome>{children}</SiteChrome>
                <MobileTabbar />
              </SessionGate>
            </CartProvider>
          </FavoritesProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
