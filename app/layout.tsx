import type { Metadata } from "next";
import { Archivo_Black, IBM_Plex_Mono, Montserrat } from "next/font/google";
import { SiteChrome } from "@/components/site-chrome";
import { MobileTabbar } from "@/components/mobile-tabbar";
import { SessionGate } from "@/components/session-gate";
import { CartProvider } from "@/context/cart-context";
import { FavoritesProvider } from "@/context/favorites-context";
import { BRAND_CONFIG } from "@/lib/brand-config";
import "./globals.css";

const archivoBlack = Archivo_Black({
  subsets: ["latin"],
  variable: "--font-archivo-black",
  weight: "400",
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin", "cyrillic"],
  variable: "--font-ibm-plex-mono",
  weight: ["400", "500"],
});

const montserrat = Montserrat({
  subsets: ["latin", "cyrillic"],
  variable: "--font-montserrat",
  weight: ["400", "500", "600", "700", "800"],
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
    <html lang="ru" className={`${archivoBlack.variable} ${ibmPlexMono.variable} ${montserrat.variable} h-full`}>
      <body className="flex min-h-full flex-col antialiased">
        <FavoritesProvider>
          <CartProvider>
            <SessionGate>
              <SiteChrome>{children}</SiteChrome>
              <MobileTabbar />
            </SessionGate>
          </CartProvider>
        </FavoritesProvider>
      </body>
    </html>
  );
}
