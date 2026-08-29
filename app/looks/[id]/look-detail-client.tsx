"use client";

import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/context/cart-context";
import type { CatalogLook } from "@/lib/catalog-types";

const formatPrice = new Intl.NumberFormat("ru-KZ");

export function LookDetailClient({ look }: { look: CatalogLook }) {
  const [activeFrame, setActiveFrame] = useState(0);
  const { addItem } = useCart();
  const lookProducts = look.items;

  function addLookToCart() {
    lookProducts.forEach((product) => {
      const firstAvailableSize = product.sizes.find((size) => size.inStock);
      if (firstAvailableSize) addItem(product, firstAvailableSize.size);
    });
  }

  return (
    <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-16">
      <Link href="/looks" className="font-mono-price text-xs tracking-[0.1em] text-[color:var(--accent)]">← ВСЕ ОБРАЗЫ</Link>
      <div className="mt-6 look-preview aspect-[3/4] max-h-[70svh]">
        {look.photoTones.map((placeholder, index) => (
          <div key={`${placeholder}-${index}`} className={`look-gallery-frame look-gallery-frame--${placeholder} ${index === activeFrame ? "is-active" : ""}`} />
        ))}
      </div>
      <div className="mt-4 flex justify-center gap-2" aria-label="Кадры образа">
        {look.photoTones.map((_, index) => (
          <button key={index} type="button" onClick={() => setActiveFrame(index)} aria-label={`Показать кадр ${index + 1}`} aria-current={activeFrame === index} className={`size-2 rounded-full transition-colors ${activeFrame === index ? "bg-[color:var(--accent)]" : "bg-[color:var(--ink)]/25 hover:bg-[color:var(--ink)]/55"}`} />
        ))}
      </div>
      <div className="mt-10 border-b border-[color:var(--ink)]/15 pb-7">
        <p className="look-number text-4xl leading-none text-[color:var(--accent)]">ОБРАЗ {String(look.id).padStart(2, "0")}</p>
        <h1 className="font-display mt-4 text-5xl leading-[0.9] tracking-[-0.04em] sm:text-7xl">{look.title}</h1>
        <p className="mt-5 max-w-2xl leading-7 text-[color:var(--ink)]/70">{look.description}</p>
      </div>
      <div className="divide-y divide-[color:var(--ink)]/15">
        {lookProducts.map((product) => (
          <div key={product.id} className="flex items-center gap-4 py-4 sm:gap-6">
            <div className="size-16 shrink-0 border border-[color:var(--ink)]/10" style={{ backgroundColor: product.imageColor }} />
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{product.name}</p>
              <p className="font-mono-price mt-1 text-sm text-[color:var(--ink)]/70">{formatPrice.format(product.price)} ₸</p>
            </div>
            <Link href={`/catalog/${product.id}`} className="shrink-0 text-sm underline decoration-[color:var(--gold)] underline-offset-4 hover:text-[color:var(--accent)]">Смотреть товар</Link>
          </div>
        ))}
      </div>
      <div className="mt-8 flex flex-col gap-5 border-t border-[color:var(--ink)]/15 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="font-mono-price text-2xl">{formatPrice.format(lookProducts.reduce((total, product) => total + product.price, 0))} ₸</p>
        <button type="button" onClick={addLookToCart} className="min-h-12 bg-[color:var(--ink)] px-6 text-sm font-medium text-white hover:bg-[color:var(--accent)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--accent)]">Добавить весь образ в корзину</button>
      </div>
    </section>
  );
}
