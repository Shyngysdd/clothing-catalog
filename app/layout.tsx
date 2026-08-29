import type { Metadata } from "next";
import { Bodoni_Moda, IBM_Plex_Mono, Inter } from "next/font/google";
import { SiteHeader } from "@/components/site-header";
import { CartProvider } from "@/context/cart-context";
import "./globals.css";

const bodoniModa = Bodoni_Moda({
  subsets: ["latin"],
  variable: "--font-bodoni-moda",
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin", "cyrillic"],
  variable: "--font-ibm-plex-mono",
  weight: ["400", "500"],
});

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Название магазина — каталог одежды и обуви",
  description: "Демо-каталог одежды и обуви: выберите товары и оформите заказ через WhatsApp.",
  icons: {
    icon: "/icon",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ru" className={`${bodoniModa.variable} ${ibmPlexMono.variable} ${inter.variable} h-full`}>
      <body className="flex min-h-full flex-col antialiased">
        <CartProvider>
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <footer className="border-t border-[color:var(--ink)]/15">
            <div className="mx-auto max-w-6xl px-4 py-5 text-sm text-[color:var(--ink)]/60 sm:px-6">
              Демо-каталог одежды и обуви
            </div>
          </footer>
        </CartProvider>
      </body>
    </html>
  );
}
