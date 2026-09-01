"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/context/cart-context";
import { useFavorites } from "@/context/favorites-context";

type Tab = { href: string; label: string; icon: React.ReactNode; matches: (pathname: string) => boolean };

function HomeIcon() { return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="size-5"><path d="m3.5 10 8.5-7 8.5 7v10.5h-5.8v-6.2H9.3v6.2H3.5V10Z" strokeLinecap="round" strokeLinejoin="round" /></svg>; }
function CatalogIcon() { return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="size-5"><rect x="3.5" y="3.5" width="7" height="7" rx="1" /><rect x="13.5" y="3.5" width="7" height="7" rx="1" /><rect x="3.5" y="13.5" width="7" height="7" rx="1" /><rect x="13.5" y="13.5" width="7" height="7" rx="1" /></svg>; }
function FavoritesIcon() { return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="size-5"><path d="M20.8 8.7c0 5-8.8 10.1-8.8 10.1S3.2 13.7 3.2 8.7A4.7 4.7 0 0 1 12 6.4a4.7 4.7 0 0 1 8.8 2.3Z" strokeLinecap="round" strokeLinejoin="round" /></svg>; }
function CartIcon() { return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="size-5"><path d="M3 4h2l2.2 10.2a2 2 0 0 0 2 1.6h7.9a2 2 0 0 0 1.9-1.5L20 7H6.2" strokeLinecap="round" strokeLinejoin="round" /><circle cx="10" cy="20" r="1" fill="currentColor" stroke="none" /><circle cx="17" cy="20" r="1" fill="currentColor" stroke="none" /></svg>; }
function AccountIcon() { return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="size-5"><circle cx="12" cy="8" r="3.5" /><path d="M4.5 20c.7-3.5 3.3-5.5 7.5-5.5s6.8 2 7.5 5.5" strokeLinecap="round" /></svg>; }

export function MobileTabbar({ isCustomerLoggedIn }: { isCustomerLoggedIn: boolean }) {
  const pathname = usePathname();
  const { itemCount } = useCart();
  const { favoriteIds } = useFavorites();
  if (pathname.startsWith("/admin")) return null;

  const tabs: Tab[] = [
    { href: "/", label: "Главная", icon: <HomeIcon />, matches: (path) => path === "/" },
    { href: "/catalog", label: "Каталог", icon: <CatalogIcon />, matches: (path) => path.startsWith("/catalog") || path.startsWith("/looks") },
    { href: "/favorites", label: "Избранное", icon: <FavoritesIcon />, matches: (path) => path === "/favorites" },
    { href: "/cart", label: "Корзина", icon: <CartIcon />, matches: (path) => path === "/cart" },
    { href: isCustomerLoggedIn ? "/account" : "/account/login", label: "Профиль", icon: <AccountIcon />, matches: (path) => path.startsWith("/account") },
  ];

  return <nav aria-label="Мобильная навигация" className="fixed inset-x-0 bottom-0 z-50 flex h-[4.75rem] border-t border-[color:var(--ink)]/20 bg-[color:var(--paper)]/95 px-1 pb-[env(safe-area-inset-bottom)] backdrop-blur-sm sm:hidden">{tabs.map((tab) => { const isActive = tab.matches(pathname); const badgeCount = tab.href === "/cart" ? itemCount : tab.href === "/favorites" ? favoriteIds.length : 0; return <Link key={tab.href} href={tab.href} className={`relative flex min-w-0 flex-1 flex-col items-center justify-center gap-1 text-[0.6rem] font-medium ${isActive ? "text-[color:var(--accent)]" : "text-[color:var(--ink)]/60"}`} aria-current={isActive ? "page" : undefined}><span className="relative">{tab.icon}{badgeCount > 0 ? <span className="absolute -right-3 -top-2 grid min-w-4 place-items-center rounded-full bg-[color:var(--accent)] px-1 text-[0.6rem] leading-4 text-[color:var(--white)]">{badgeCount}</span> : null}</span><span>{tab.label}</span></Link>; })}</nav>;
}
