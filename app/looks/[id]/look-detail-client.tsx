"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/context/cart-context";
import { useFavorites } from "@/context/favorites-context";
import type { CatalogLook } from "@/lib/catalog-types";

const formatPrice = new Intl.NumberFormat("ru-KZ");

export function LookDetailClient({ look, lookNumber }: { look: CatalogLook; lookNumber: number }) {
  const [activeFrame, setActiveFrame] = useState(0);
  const { addItem } = useCart();
  const { isLookFavorite, toggleLookFavorite } = useFavorites();
  const lookProducts = look.items;
  const frames = look.photoUrls.length > 0 ? look.photoUrls : look.photoTones;

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
        {look.photoUrls.length > 0
          ? look.photoUrls.map((photoUrl, index) => <div key={photoUrl} className={`look-gallery-frame ${index === activeFrame ? "is-active" : ""}`}><Image src={photoUrl} alt={`${look.title}, кадр ${index + 1}`} fill sizes="(max-width: 1024px) 100vw, 64rem" className="product-detail-photo" /></div>)
          : look.photoTones.map((placeholder, index) => <div key={`${placeholder}-${index}`} className={`look-gallery-frame look-gallery-frame--${placeholder} ${index === activeFrame ? "is-active" : ""}`} />)}
      </div>
      <div className="mt-4 flex justify-center gap-2" aria-label="Кадры образа">
        {frames.map((_, index) => (
          <button key={index} type="button" onClick={() => setActiveFrame(index)} aria-label={`Показать кадр ${index + 1}`} aria-current={activeFrame === index} className={`size-2 rounded-full transition-colors ${activeFrame === index ? "bg-[color:var(--accent)]" : "bg-[color:var(--ink)]/25 hover:bg-[color:var(--ink)]/55"}`} />
        ))}
      </div>
      <div className="mt-10 border-b border-[color:var(--ink)]/15 pb-7">
        <p className="look-number text-4xl leading-none text-[color:var(--accent)]">ОБРАЗ {String(lookNumber).padStart(2, "0")}</p>
        <h1 className="font-section mt-4 text-[clamp(2.35rem,7vw,3.75rem)] leading-[0.95]">{look.title}</h1>
        <p className="mt-5 max-w-2xl leading-7 text-[color:var(--ink)]/70">{look.description}</p>
      </div>
      <div className="divide-y divide-[color:var(--ink)]/15">
        {lookProducts.map((product) => (
          <div key={product.id} className="flex items-center gap-4 py-4 sm:gap-6">
            {product.imageUrl ? <div className="relative size-16 shrink-0 overflow-hidden border border-[color:var(--ink)]/10"><Image src={product.imageUrl} alt="" fill sizes="64px" className="object-cover" /></div> : <div className="size-16 shrink-0 border border-[color:var(--ink)]/10" style={{ backgroundColor: product.imageColor }} />}
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
        <div className="grid gap-3 sm:flex">
          <button type="button" onClick={() => toggleLookFavorite(look.id)} aria-pressed={isLookFavorite(look.id)} className={`min-h-12 border px-5 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--accent)] ${isLookFavorite(look.id) ? "border-[color:var(--accent)] text-[color:var(--accent)]" : "border-[color:var(--ink)]/25 hover:border-[color:var(--accent)] hover:text-[color:var(--accent)]"}`}>{isLookFavorite(look.id) ? "В избранном" : "В избранное"}</button>
          <button type="button" onClick={addLookToCart} className="min-h-12 bg-[color:var(--ink)] px-6 text-sm font-medium text-[color:var(--paper)] hover:bg-[color:var(--accent)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--accent)]">Добавить весь образ в корзину</button>
        </div>
      </div>
    </section>
  );
}
