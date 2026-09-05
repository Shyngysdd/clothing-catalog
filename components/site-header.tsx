"use client";

import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { Link, useRouter } from "@/i18n/navigation";
import { BRAND_CONFIG } from "@/lib/brand-config";
import { getLocalizedField } from "@/lib/localized";
import { useCart } from "@/context/cart-context";
import { useFavorites } from "@/context/favorites-context";
import { useTheme } from "@/context/theme-context";
import { CartDrawer } from "./cart-drawer";
import type { SavedAddress } from "@/lib/address-format";
import { LocaleSwitcher } from "./locale-switcher";

type CategoryNavItem = { slug: string; nameRu: string; nameEn: string; nameKz: string; count: number };

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

function SearchIcon() {
  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="size-5"><circle cx="10.8" cy="10.8" r="6.3" /><path d="m16 16 4.2 4.2" strokeLinecap="round" /></svg>;
}

function ThemeIcon({ theme }: { theme: "light" | "dark" }) {
  return theme === "dark" ? (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="size-5"><path d="M20.5 15.2A8.5 8.5 0 0 1 8.8 3.5a8.5 8.5 0 1 0 11.7 11.7Z" strokeLinecap="round" strokeLinejoin="round" /></svg>
  ) : (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="size-5"><circle cx="12" cy="12" r="4" /><path d="M12 2.5v2M12 19.5v2M21.5 12h-2M4.5 12h-2M18.7 5.3l-1.4 1.4M6.7 17.3l-1.4 1.4M18.7 18.7l-1.4-1.4M6.7 6.7 5.3 5.3" strokeLinecap="round" /></svg>
  );
}

export function SiteHeader({ categories, isCustomerLoggedIn, savedAddresses, customerName, customerPhone }: { categories: CategoryNavItem[]; isCustomerLoggedIn: boolean; savedAddresses: SavedAddress[]; customerName?: string; customerPhone?: string }) {
  const t = useTranslations("Header");
  const common = useTranslations("Common");
  const locale = useLocale();
  const [isNavigatorOpen, setIsNavigatorOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [search, setSearch] = useState("");
  const router = useRouter();
  const { itemCount, isDrawerOpen, openDrawer, closeDrawer, cartNotice } = useCart();
  const { favoriteIds } = useFavorites();
  const { theme, toggleTheme } = useTheme();
  const accountHref = isCustomerLoggedIn ? "/account" : "/account/login";
  const accountLabel = isCustomerLoggedIn ? common("profile") : common("login");
  const whatsappHref = `https://wa.me/${BRAND_CONFIG.whatsappNumber}?text=${encodeURIComponent(t("question"))}`;

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

  useEffect(() => {
    const query = search.trim();
    if (!isSearchOpen || !query) return;
    const timeoutId = window.setTimeout(() => router.replace(`/catalog?search=${encodeURIComponent(query)}`), 300);
    return () => window.clearTimeout(timeoutId);
  }, [isSearchOpen, router, search]);

  function submitSearch() {
    const query = search.trim();
    if (!query) return;
    router.push(`/catalog?search=${encodeURIComponent(query)}`);
    setIsSearchOpen(false);
  }

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-[color:var(--border)] bg-[color:var(--paper)]/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-[90rem] items-center justify-between gap-4 px-4 py-3 sm:px-6 sm:py-4 lg:px-10">
          <div className="flex shrink-0 items-center gap-4 sm:gap-6">
            <Link href="/" className="font-brand text-xl leading-none sm:text-3xl">
              {BRAND_CONFIG.name}
            </Link>
            <span className="hidden border-l border-[color:var(--border)] pl-4 font-mono-price text-[0.6rem] tracking-[0.12em] text-[color:var(--ink)]/55 md:inline">
              {t("collection")}
            </span>
          </div>
          <div className="flex shrink-0 items-center gap-1 sm:gap-3 lg:gap-4">
            <button type="button" onClick={() => setIsNavigatorOpen(true)} className="hidden shrink-0 whitespace-nowrap min-h-10 items-center px-1.5 text-[0.7rem] font-medium text-[color:var(--ink)]/70 hover:text-[color:var(--accent)] md:inline-flex md:min-h-11 md:px-0 md:text-sm">
              {common("catalog")}
            </button>
            <Link href="/looks" className="inline-flex shrink-0 whitespace-nowrap min-h-10 items-center px-1.5 text-[0.7rem] font-medium text-[color:var(--ink)]/70 hover:text-[color:var(--accent)] sm:min-h-11 sm:px-0 sm:text-sm">
              {common("looks")}
            </Link>
            <button type="button" onClick={() => setIsSearchOpen(true)} className="hidden size-10 place-items-center text-[color:var(--ink)] hover:text-[color:var(--accent)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--accent)] min-[390px]:grid sm:size-11" aria-label={common("search")}><SearchIcon /></button>
            <button type="button" onClick={toggleTheme} className="grid size-10 place-items-center text-[color:var(--ink)] hover:text-[color:var(--accent)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--accent)] sm:size-11" aria-label={theme === "dark" ? t("lightTheme") : t("darkTheme")} title={theme === "dark" ? t("lightTheme") : t("darkTheme")}><ThemeIcon theme={theme} /></button>
            <LocaleSwitcher />
            <a
              href={BRAND_CONFIG.instagramUrl}
              target="_blank"
              rel="noreferrer"
              className="ml-1 hidden size-10 place-items-center text-[color:var(--ink)] hover:text-[color:var(--accent)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--accent)] lg:grid lg:size-11"
              aria-label={t("instagram")}
            >
              <InstagramIcon />
            </a>
            <a
              href={whatsappHref}
              target="_blank"
              rel="noreferrer"
              className="hidden size-10 place-items-center text-[color:var(--ink)] hover:text-[color:var(--accent)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--accent)] lg:grid lg:size-11"
              aria-label={t("whatsapp")}
            >
              <WhatsAppIcon />
            </a>
            <Link
              href={accountHref}
              className="hidden h-10 items-center gap-1 px-1 text-[color:var(--ink)] hover:text-[color:var(--accent)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--accent)] md:flex md:h-11 md:gap-1.5"
              aria-label={isCustomerLoggedIn ? t("account") : t("accountLogin")}
            >
              <AccountIcon />
              <span className="text-[0.7rem] font-medium sm:text-sm">{accountLabel}</span>
            </Link>
            <Link
              href="/favorites"
              className="relative hidden size-10 place-items-center text-[color:var(--ink)] hover:text-[color:var(--accent)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--accent)] md:grid md:size-11"
              aria-label={t("favoritesCount", {count: favoriteIds.length})}
            >
              <FavoritesIcon />
              {favoriteIds.length > 0 ? <span className="absolute -right-1 -top-1 grid min-w-5 place-items-center rounded-full bg-[color:var(--accent)] px-1 text-xs leading-5 text-white">{favoriteIds.length}</span> : null}
            </Link>
            <Link href="/cart" className="relative ml-1 hidden size-10 place-items-center border-l border-[color:var(--border)] pl-1 text-[color:var(--ink)] hover:text-[color:var(--accent)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--accent)]" aria-label={t("cartCount", {count: itemCount})}>
              <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="size-5"><path d="M3 4h2l2.2 10.2a2 2 0 0 0 2 1.6h7.9a2 2 0 0 0 1.9-1.5L20 7H6.2" strokeLinecap="round" strokeLinejoin="round" /><circle cx="10" cy="20" r="1" fill="currentColor" stroke="none" /><circle cx="17" cy="20" r="1" fill="currentColor" stroke="none" /></svg>
              {itemCount > 0 ? <span className="absolute -right-1 -top-1 grid min-w-5 place-items-center rounded-full bg-[color:var(--accent)] px-1 text-xs leading-5 text-white">{itemCount}</span> : null}
            </Link>
            <button type="button" onClick={openDrawer} className="relative ml-2 hidden size-11 place-items-center border-l border-[color:var(--border)] pl-2 text-[color:var(--ink)] hover:text-[color:var(--accent)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--accent)] md:grid" aria-label={t("cartCount", {count: itemCount})}>
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
      <div className={`fixed inset-0 z-[60] transition-opacity duration-200 ${isSearchOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"}`} aria-hidden={!isSearchOpen}>
        <button type="button" onClick={() => setIsSearchOpen(false)} className="absolute inset-0 bg-[color:var(--ink)]/55" aria-label={t("closeSearch")} />
        <form onSubmit={(event) => { event.preventDefault(); submitSearch(); }} className={`absolute left-0 right-0 top-0 border-b-2 border-[color:var(--border)] bg-[color:var(--paper)] px-4 py-5 transition-transform duration-200 sm:px-6 lg:px-10 ${isSearchOpen ? "translate-y-0" : "-translate-y-full"}`}>
          <div className="mx-auto flex max-w-[90rem] items-center gap-3"><SearchIcon /><input autoFocus value={search} onChange={(event) => setSearch(event.target.value)} placeholder={t("searchPlaceholder")} className="min-h-11 min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-[color:var(--ink)]/45" aria-label={common("search")} /><button type="submit" className="min-h-11 px-3 text-sm font-medium hover:text-[color:var(--accent)]">{common("find")}</button><button type="button" onClick={() => setIsSearchOpen(false)} className="grid size-11 place-items-center text-2xl text-[color:var(--ink)]/65 hover:text-[color:var(--accent)]" aria-label={t("closeSearch")}>×</button></div>
        </form>
      </div>
      <div className={`fixed inset-0 z-50 transition-opacity duration-300 ${isNavigatorOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"}`} aria-hidden={!isNavigatorOpen}>
        <button type="button" onClick={() => setIsNavigatorOpen(false)} className="absolute inset-0 bg-[color:var(--ink)]/45" aria-label={t("closeNavigator")} />
        <aside role="dialog" aria-modal="true" aria-label={t("navigator")} className={`absolute right-0 top-0 flex h-full w-[78vw] max-w-[420px] flex-col border-l border-[color:var(--border)] bg-[color:var(--paper)] transition-transform duration-300 ease-out ${isNavigatorOpen ? "translate-x-0" : "translate-x-full"}`}>
          <div className="flex items-center justify-between border-b border-[color:var(--border)] px-5 py-5 sm:px-7">
            <div><p className="font-mono-price text-xs tracking-[0.14em] text-[color:var(--accent)]">{t("navigator")}</p><h2 className="font-section mt-2 text-2xl leading-none">{common("catalog")}</h2></div>
            <button type="button" onClick={() => setIsNavigatorOpen(false)} className="grid size-11 place-items-center text-xl text-[color:var(--ink)]/60 hover:text-[color:var(--accent)]" aria-label={common("close")}>×</button>
          </div>
          <nav className="flex-1 overflow-y-auto px-5 py-5 sm:px-7">
            <Link href="/catalog" onClick={() => setIsNavigatorOpen(false)} className="block border-b border-[color:var(--border)] py-4"><span className="font-section text-lg leading-none">{t("allProducts")}</span></Link>
            <Link href="/catalog?department=men" onClick={() => setIsNavigatorOpen(false)} className="block border-b border-[color:var(--border)] py-4"><span className="font-section text-xl leading-none">{t("men")}</span></Link>
            <Link href="/catalog?department=women" onClick={() => setIsNavigatorOpen(false)} className="block border-b border-[color:var(--border)] py-4"><span className="font-section text-xl leading-none">{t("women")}</span></Link>
            <Link href="/catalog?sale=true" onClick={() => setIsNavigatorOpen(false)} className="block border-b border-[color:var(--border)] py-4"><span className="font-section text-lg leading-none">{t("sale")}</span></Link>
            <div className="pt-3">{categories.map((category) => { const name = getLocalizedField(category, "name", locale); return <Link key={category.slug} href={`/catalog?category=${encodeURIComponent(category.slug)}`} onClick={() => setIsNavigatorOpen(false)} className="block border-b border-[color:var(--border)] py-4 hover:text-[color:var(--accent)]"><span className="font-section block text-lg leading-none">{name}</span><span className="font-mono-price mt-2 block text-xs text-[color:var(--ink)]/55">{category.count} {category.count === 1 ? common("product") : common("products")}</span></Link>; })}</div>
          </nav>
          <nav aria-label="Контакты и избранное" className="border-t border-[color:var(--border)] px-5 py-3 sm:px-7">
            <Link
              href="/favorites"
              onClick={() => setIsNavigatorOpen(false)}
              className="flex items-center gap-3 py-3 text-[color:var(--ink)] hover:text-[color:var(--accent)]"
            >
              <FavoritesIcon />
              <span className="text-sm font-medium">{common("favorites")}{favoriteIds.length > 0 ? ` (${favoriteIds.length})` : ""}</span>
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
              <span className="text-sm font-medium">{t("support")}</span>
            </a>
          </nav>
        </aside>
      </div>
      {isDrawerOpen ? <CartDrawer onClose={closeDrawer} isCustomerLoggedIn={isCustomerLoggedIn} savedAddresses={savedAddresses} customerName={customerName} customerPhone={customerPhone} /> : null}
      {cartNotice ? <div className="pointer-events-none fixed bottom-5 left-1/2 z-[70] -translate-x-1/2 border border-[color:var(--gold)] bg-[color:var(--ink)] px-4 py-3 text-sm text-[color:var(--white)] shadow-sm sm:hidden" role="status">{cartNotice}</div> : null}
    </>
  );
}
