"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BRAND_CONFIG } from "@/lib/brand-config";
import { useCart } from "@/context/cart-context";
import { useFavorites } from "@/context/favorites-context";
import { CartDrawer } from "./cart-drawer";

type CategoryNavItem = { name: string; count: number };

function InstagramIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="size-5 shrink-0">
      <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.8" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="size-5 shrink-0">
      <path d="M20 11.5a8 8 0 0 1-11.8 7L4 20l1.5-4.2A8 8 0 1 1 20 11.5Z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 9.5c.5 2 2 3.5 4 4" strokeLinecap="round" />
    </svg>
  );
}

function AccountIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="size-5 shrink-0">
      <circle cx="12" cy="8" r="3.5" />
      <path d="M4.5 20c.7-3.5 3.3-5.5 7.5-5.5s6.8 2 7.5 5.5" strokeLinecap="round" />
    </svg>
  );
}

function FavoritesIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="size-5 shrink-0">
      <path d="M20.8 8.7c0 5-8.8 10.1-8.8 10.1S3.2 13.7 3.2 8.7A4.7 4.7 0 0 1 12 6.4a4.7 4.7 0 0 1 8.8 2.3Z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function SiteHeader({ categories, isCustomerLoggedIn }: { categories: CategoryNavItem[]; isCustomerLoggedIn: boolean }) {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isNavigatorOpen, setIsNavigatorOpen] = useState(false);
  const { itemCount } = useCart();
  const { favoriteIds } = useFavorites();
  const accountHref = isCustomerLoggedIn ? "/account" : "/account/login";
  const accountLabel = isCustomerLoggedIn ? "Профиль" : "Войти";
  const whatsappHref = `https://wa.me/${BRAND_CONFIG.whatsappNumber}?text=${encodeURIComponent("Здравствуйте! У меня вопрос по сайту")}`;

  useEffect(() => {
    if (!isNavigatorOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") setIsNavigatorOpen(false); };
    document.addEventListener("keydown", closeOnEscape);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", closeOnEscape);
      document.body.style.overflow = "";
    };
  }, [isNavigatorOpen]);

  return (
    <>
      <header className="sticky top-0 z-40 border-b-2 border-[color:var(--ink)]/35 bg-[color:var(--paper)]/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-[90rem] items-center justify-between px-4 py-3 sm:px-6 sm:py-4 lg:px-10">
          <div className="flex items-center gap-4 sm:gap-6">
            <Link href="/" className="font-brand text-base sm:text-xl">
              {BRAND_CONFIG.name}
            </Link>
            <span className="hidden border-l border-[color:var(--ink)]/25 pl-4 font-mono-price text-[0.65rem] tracking-[0.14em] text-[color:var(--ink)]/55 sm:inline">
              КАТАЛОГ / 2026
            </span>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <button type="button" onClick={() => setIsNavigatorOpen(true)} className="text-xs font-medium text-[color:var(--ink)]/70 hover:text-[color:var(--accent)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--accent)] sm:text-sm">
              Каталог
            </button>
            <Link href="/looks" className="hidden text-xs font-medium text-[color:var(--ink)]/70 hover:text-[color:var(--accent)] sm:inline sm:text-sm">
              Образы
            </Link>
            <a
              href={BRAND_CONFIG.instagramUrl}
              target="_blank"
              rel="noreferrer"
              className="ml-1 hidden size-10 place-items-center text-[color:var(--ink)] hover:text-[color:var(--accent)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--accent)] sm:grid sm:size-11"
              aria-label="Instagram магазина"
            >
              <InstagramIcon />
            </a>
            <a
              href={whatsappHref}
              target="_blank"
              rel="noreferrer"
              className="hidden size-10 place-items-center text-[color:var(--ink)] hover:text-[color:var(--accent)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--accent)] sm:grid sm:size-11"
              aria-label="Поддержка в WhatsApp"
            >
              <WhatsAppIcon />
            </a>
            <Link
              href={accountHref}
              className="hidden h-10 items-center gap-1.5 px-1 text-[color:var(--ink)] hover:text-[color:var(--accent)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--accent)] sm:flex sm:h-11"
              aria-label={isCustomerLoggedIn ? "Личный кабинет" : "Войти в личный кабинет"}
            >
              <AccountIcon />
              <span className="text-xs font-medium sm:text-sm">{accountLabel}</span>
            </Link>
            <Link
              href="/favorites"
              className="relative hidden size-10 place-items-center text-[color:var(--ink)] hover:text-[color:var(--accent)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--accent)] sm:grid sm:size-11"
              aria-label={`Избранное, товаров: ${favoriteIds.length}`}
            >
              <FavoritesIcon />
              {favoriteIds.length > 0 ? <span className="absolute -right-1 -top-1 grid min-w-5 place-items-center rounded-full bg-[color:var(--accent)] px-1 text-xs leading-5 text-white">{favoriteIds.length}</span> : null}
            </Link>
            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              className="relative ml-1 grid size-10 place-items-center border-l border-[color:var(--ink)]/25 pl-1 text-[color:var(--ink)] hover:text-[color:var(--accent)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--accent)] sm:ml-2 sm:size-11 sm:pl-2"
              aria-label={`Корзина, товаров: ${itemCount}`}
            >
              <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="size-5">
                <path d="M3 4h2l2.2 10.2a2 2 0 0 0 2 1.6h7.9a2 2 0 0 0 1.9-1.5L20 7H6.2" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="10" cy="20" r="1" fill="currentColor" stroke="none" />
                <circle cx="17" cy="20" r="1" fill="currentColor" stroke="none" />
              </svg>
              {itemCount > 0 ? (
                <span className="absolute -right-1 -top-1 grid min-w-5 place-items-center rounded-full bg-[color:var(--accent)] px-1 text-xs leading-5 text-white">
                  {itemCount}
                </span>
              ) : null}
            </button>
          </div>
        </div>
      </header>
      <div className={`fixed inset-0 z-50 transition-opacity duration-300 ${isNavigatorOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"}`} aria-hidden={!isNavigatorOpen}>
        <button type="button" onClick={() => setIsNavigatorOpen(false)} className="absolute inset-0 bg-[color:var(--ink)]/45" aria-label="Закрыть навигатор каталога" />
        <aside role="dialog" aria-modal="true" aria-label="Навигатор каталога" className={`absolute right-0 top-0 flex h-full w-[78vw] max-w-[420px] flex-col bg-[color:var(--paper)] shadow-2xl transition-transform duration-300 ease-out ${isNavigatorOpen ? "translate-x-0" : "translate-x-full"}`}>
          <div className="flex items-center justify-between border-b border-[color:var(--ink)]/15 px-5 py-5 sm:px-7">
            <div><p className="font-mono-price text-xs tracking-[0.14em] text-[color:var(--accent)]">НАВИГАЦИЯ</p><h2 className="font-section mt-2 text-2xl leading-none">Каталог</h2></div>
            <button type="button" onClick={() => setIsNavigatorOpen(false)} className="grid size-11 place-items-center text-xl text-[color:var(--ink)]/60 hover:text-[color:var(--accent)]" aria-label="Закрыть">×</button>
          </div>
          <nav className="flex-1 overflow-y-auto px-5 py-5 sm:px-7">
            <Link href="/catalog" onClick={() => setIsNavigatorOpen(false)} className="block border-b border-[color:var(--ink)]/15 py-4"><span className="font-section text-lg leading-none">Все товары</span></Link>
            <Link href="/catalog?sale=true" onClick={() => setIsNavigatorOpen(false)} className="block border-b border-[color:var(--ink)]/15 py-4"><span className="font-section text-lg leading-none">Со скидкой</span></Link>
            <div className="pt-3">{categories.map((category) => <Link key={category.name} href={`/catalog?category=${encodeURIComponent(category.name)}`} onClick={() => setIsNavigatorOpen(false)} className="block border-b border-[color:var(--ink)]/15 py-4 hover:text-[color:var(--accent)]"><span className="font-section block text-lg leading-none">{category.name}</span><span className="font-mono-price mt-2 block text-xs text-[color:var(--ink)]/55">{category.count} {category.count === 1 ? "товар" : "товаров"}</span></Link>)}</div>
          </nav>
          <nav aria-label="Аккаунт и контакты" className="border-t border-[color:var(--ink)]/15 px-5 py-3 sm:px-7">
            <Link
              href={accountHref}
              onClick={() => setIsNavigatorOpen(false)}
              className="flex items-center gap-3 py-3 text-[color:var(--ink)] hover:text-[color:var(--accent)]"
            >
              <AccountIcon />
              <span className="text-sm font-medium">{accountLabel}</span>
            </Link>
            <Link
              href="/favorites"
              onClick={() => setIsNavigatorOpen(false)}
              className="flex items-center gap-3 py-3 text-[color:var(--ink)] hover:text-[color:var(--accent)]"
            >
              <FavoritesIcon />
              <span className="text-sm font-medium">Избранное{favoriteIds.length > 0 ? ` (${favoriteIds.length})` : ""}</span>
              {favoriteIds.length > 0 ? <span className="ml-auto grid min-w-5 place-items-center rounded-full bg-[color:var(--accent)] px-1 text-xs leading-5 text-white">{favoriteIds.length}</span> : null}
            </Link>
            <a
              href={BRAND_CONFIG.instagramUrl}
              target="_blank"
              rel="noreferrer"
              onClick={() => setIsNavigatorOpen(false)}
              className="flex items-center gap-3 py-3 text-[color:var(--ink)] hover:text-[color:var(--accent)]"
            >
              <InstagramIcon />
              <span className="text-sm font-medium">Instagram</span>
            </a>
            <a
              href={whatsappHref}
              target="_blank"
              rel="noreferrer"
              onClick={() => setIsNavigatorOpen(false)}
              className="flex items-center gap-3 py-3 text-[color:var(--ink)] hover:text-[color:var(--accent)]"
            >
              <WhatsAppIcon />
              <span className="text-sm font-medium">Написать в поддержку</span>
            </a>
          </nav>
        </aside>
      </div>
      {isCartOpen ? <CartDrawer onClose={() => setIsCartOpen(false)} isCustomerLoggedIn={isCustomerLoggedIn} /> : null}
    </>
  );
}
