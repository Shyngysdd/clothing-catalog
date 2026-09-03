import type { Metadata } from "next";
import { Cormorant_Garamond, IBM_Plex_Mono, Inter } from "next/font/google";
import { SiteChrome } from "@/components/site-chrome";
import { MobileTabbar } from "@/components/mobile-tabbar";
import { SessionGate } from "@/components/session-gate";
import { CartProvider } from "@/context/cart-context";
import { FavoritesProvider } from "@/context/favorites-context";
import { ThemeProvider } from "@/context/theme-context";
import { BRAND_CONFIG } from "@/lib/brand-config";
import "./globals.css";

const cormorantGaramond = Cormorant_Garamond({
  subsets: ["latin", "cyrillic"],
  variable: "--font-cormorant-garamond",
  weight: ["400", "500", "600"],
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin", "cyrillic"],
  variable: "--font-ibm-plex-mono",
  weight: ["400", "500"],
});

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-inter",
  weight: ["400", "500", "600"],
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
    <html lang="ru" suppressHydrationWarning className={`${cormorantGaramond.variable} ${ibmPlexMono.variable} ${inter.variable} h-full`}>
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
