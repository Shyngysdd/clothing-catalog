"use client";

import { Link } from "@/i18n/navigation";
import { CartItemsList } from "@/components/cart-items-list";
import { CartSummary } from "@/components/cart-summary";
import { useCart } from "@/context/cart-context";
import { useTranslations } from "next-intl";

export function CartPageClient() {
  const t = useTranslations("Cart");
  const { items, clearCart, openDrawer } = useCart();
  function handleClearCart() { if (window.confirm(t("clearConfirm"))) clearCart(); }
  if (items.length === 0) return <div className="mt-10 border-y border-[color:var(--border)] py-12 text-center"><p className="text-[color:var(--ink)]/65">{t("empty")}</p><Link href="/catalog" className="mt-5 inline-flex min-h-11 items-center bg-[color:var(--ink)] px-5 text-sm font-medium text-[color:var(--paper)] hover:bg-[color:var(--accent)]">{t("openCatalog")}</Link></div>;
  return <div className="cart-page-layout mt-8 grid gap-0 lg:grid-cols-[minmax(0,1fr)_24rem]"><section className="cart-items-panel lg:pr-12"><CartItemsList className="border-y border-[color:var(--border)]" /></section><aside className="cart-summary-panel mt-8 h-fit border-t border-[color:var(--border)] pt-6 lg:mt-0 lg:border-l lg:border-t-0 lg:pl-12 lg:pt-1"><p className="font-mono-price text-[0.65rem] tracking-[0.14em] text-[color:var(--accent)]">{t("orderSummary")}</p><div className="mt-5"><CartSummary items={items} /></div><button type="button" onClick={openDrawer} className="mt-8 flex min-h-12 w-full items-center justify-center bg-[color:var(--ink)] px-5 text-sm font-medium text-[color:var(--paper)] hover:bg-[color:var(--accent)]">{t("checkout")}</button><button type="button" onClick={handleClearCart} className="mt-3 min-h-11 w-full text-sm text-[color:var(--ink)]/60 underline underline-offset-4 hover:text-[color:var(--accent)]">{t("clear")}</button></aside></div>;
}
