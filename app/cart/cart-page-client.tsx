"use client";

import Link from "next/link";
import { CartItemsList } from "@/components/cart-items-list";
import { CartSummary } from "@/components/cart-summary";
import { useCart } from "@/context/cart-context";

export function CartPageClient() {
  const { items, clearCart, openDrawer } = useCart();
  function handleClearCart() { if (window.confirm("Очистить корзину?")) clearCart(); }
  if (items.length === 0) return <div className="mt-10 border-y border-[color:var(--ink)]/15 py-12 text-center"><p className="text-[color:var(--ink)]/65">Корзина пока пуста.</p><Link href="/catalog" className="mt-5 inline-flex min-h-11 items-center bg-[color:var(--ink)] px-5 text-sm font-medium text-[color:var(--white)] hover:bg-[color:var(--accent)]">Перейти в каталог</Link></div>;
  return <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]"><section><CartItemsList className="border-y border-[color:var(--ink)]/15" /></section><aside className="h-fit border border-[color:var(--ink)]/20 p-5 sm:p-6"><CartSummary items={items} /><button type="button" onClick={openDrawer} className="mt-7 flex min-h-12 w-full items-center justify-center bg-[color:var(--ink)] px-5 text-sm font-medium text-[color:var(--white)] hover:bg-[color:var(--accent)]">Оформить заказ</button><button type="button" onClick={handleClearCart} className="mt-3 min-h-11 w-full text-sm text-[color:var(--ink)]/60 underline underline-offset-4 hover:text-[color:var(--accent)]">Очистить всё</button></aside></div>;
}
