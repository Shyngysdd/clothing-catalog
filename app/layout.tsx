import type { Metadata } from "next";
import { Archivo_Black, IBM_Plex_Mono, Montserrat } from "next/font/google";
import { SiteChrome } from "@/components/site-chrome";
import { CartProvider } from "@/context/cart-context";
import { FavoritesProvider } from "@/context/favorites-context";
import { CUSTOMER_SESSION_COOKIE, getCustomerIdFromSession } from "@/lib/customer-auth";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
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
  title: "Billion.co — каталог одежды и обуви",
  description: "Демо-каталог одежды и обуви: выберите товары и оформите заказ через WhatsApp.",
  icons: {
    icon: "/icon",
  },
};

export const dynamic = "force-dynamic";

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const cookieStore = await cookies();
  const customerId = await getCustomerIdFromSession(cookieStore.get(CUSTOMER_SESSION_COOKIE)?.value);
  const categoryGroups = await prisma.product.groupBy({
    by: ["category"],
    _count: { _all: true },
    orderBy: { category: "asc" },
  });
  const categories = categoryGroups.map((group) => ({ name: group.category, count: group._count._all }));
  const initialFavoriteIds = customerId
    ? (await prisma.favorite.findMany({ where: { customerId }, select: { productId: true } })).map((favorite) => favorite.productId)
    : [];

  return (
    <html lang="ru" className={`${archivoBlack.variable} ${ibmPlexMono.variable} ${montserrat.variable} h-full`}>
      <body className="flex min-h-full flex-col antialiased">
        <FavoritesProvider isCustomerLoggedIn={Boolean(customerId)} initialFavoriteIds={initialFavoriteIds}>
          <CartProvider>
            <SiteChrome categories={categories} isCustomerLoggedIn={Boolean(customerId)}>{children}</SiteChrome>
          </CartProvider>
        </FavoritesProvider>
      </body>
    </html>
  );
}
