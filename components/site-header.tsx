"use client";

import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/context/cart-context";
import { CartDrawer } from "./cart-drawer";

export function SiteHeader() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { itemCount } = useCart();

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-[color:var(--ink)]/25 bg-[color:var(--paper)]/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-[90rem] items-center justify-between px-4 py-3 sm:px-6 sm:py-4 lg:px-10">
          <div className="flex items-center gap-4 sm:gap-6">
            <Link href="/" className="font-display text-base font-medium tracking-tight sm:text-xl">
              название магазина
            </Link>
            <span className="hidden border-l border-[color:var(--ink)]/25 pl-4 font-mono-price text-[0.65rem] tracking-[0.14em] text-[color:var(--ink)]/55 sm:inline">
              КАТАЛОГ / 2026
            </span>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <Link href="/catalog" className="text-xs font-medium text-[color:var(--ink)]/70 hover:text-[color:var(--accent)] sm:text-sm">
              Каталог
            </Link>
            <Link href="/looks" className="text-xs font-medium text-[color:var(--ink)]/70 hover:text-[color:var(--accent)] sm:text-sm">
              Образы
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
      {isCartOpen ? <CartDrawer onClose={() => setIsCartOpen(false)} /> : null}
    </>
  );
}
