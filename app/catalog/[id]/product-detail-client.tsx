"use client";

import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/context/cart-context";
import type { Product } from "@/data/products";

const formatPrice = new Intl.NumberFormat("ru-KZ");

export function ProductDetailClient({ product }: { product: Product }) {
  const [activeFrame, setActiveFrame] = useState(0);
  const [selectedSize, setSelectedSize] = useState(product.sizes[0]);
  const [isSizeTableOpen, setIsSizeTableOpen] = useState(false);
  const { addItem } = useCart();

  return (
    <main className="mx-auto max-w-[90rem] px-4 py-8 sm:px-6 sm:py-12 lg:px-10">
      <Link href="/catalog" className="font-mono-price text-xs tracking-[0.12em] text-[color:var(--accent)]">← В КАТАЛОГ</Link>
      <div className="mt-6 grid gap-9 lg:grid-cols-2 lg:gap-14">
        <section>
          <div className="look-preview aspect-[4/5]">
            {product.galleryTones.map((tone, index) => <div key={`${tone}-${index}`} className={`look-gallery-frame look-gallery-frame--${tone} ${activeFrame === index ? "is-active" : ""}`} />)}
          </div>
          <div className="mt-3 flex gap-3 overflow-x-auto pb-1">
            {product.galleryTones.map((tone, index) => <button key={`${tone}-${index}`} type="button" onClick={() => setActiveFrame(index)} aria-label={`Показать кадр ${index + 1}`} aria-pressed={activeFrame === index} className={`look-gallery-frame look-gallery-frame--${tone} relative aspect-[4/5] w-16 shrink-0 border-2 transition-colors sm:w-20 ${activeFrame === index ? "border-[color:var(--accent)]" : "border-transparent hover:border-[color:var(--gold)]"}`} />)}
          </div>
        </section>
        <section className="lg:pt-3">
          <p className="font-mono-price text-xs tracking-[0.16em] text-[color:var(--accent)]">{product.category.toUpperCase()}</p>
          <div className="mt-4 flex items-start justify-between gap-4"><h1 className="font-display text-5xl leading-[0.9] tracking-[-0.05em] sm:text-7xl">{product.name}</h1><span className="font-mono-price pt-2 text-xs text-[color:var(--ink)]/60">{product.sku}</span></div>
          <p className="font-mono-price mt-7 text-2xl">{formatPrice.format(product.price)} ₸</p>
          <p className="mt-7 max-w-xl leading-7 text-[color:var(--ink)]/70">{product.description}</p>
          <fieldset className="mt-8"><legend className="text-sm font-medium">Выберите размер</legend><div className="mt-3 flex flex-wrap gap-2">{product.sizes.map((size) => <button key={size} type="button" onClick={() => setSelectedSize(size)} aria-pressed={selectedSize === size} className={`min-h-11 min-w-11 border px-3 text-sm font-medium transition-colors ${selectedSize === size ? "border-[color:var(--ink)] bg-[color:var(--ink)] text-[color:var(--white)]" : "border-[color:var(--ink)]/25 hover:border-[color:var(--ink)]"}`}>{size}</button>)}</div></fieldset>
          <button type="button" onClick={() => setIsSizeTableOpen(true)} className="mt-4 text-sm underline decoration-[color:var(--gold)] underline-offset-4 hover:text-[color:var(--accent)]">Таблица размеров</button>
          <details className="mt-8 border-y border-[color:var(--ink)]/15 py-5" open><summary className="cursor-pointer font-medium">Состав и уход</summary><div className="mt-4 space-y-3 text-sm leading-6 text-[color:var(--ink)]/70"><p><span className="text-[color:var(--ink)]">Состав:</span> {product.composition}</p><p><span className="text-[color:var(--ink)]">Посадка:</span> {product.fit}</p><ul className="list-disc space-y-1 pl-5">{product.care.map((item) => <li key={item}>{item}</li>)}</ul></div></details>
          <div className="border-b border-[color:var(--ink)]/15 py-5"><h2 className="font-medium">Доставка и возврат</h2><p className="mt-3 text-sm leading-6 text-[color:var(--ink)]/70">Самовывоз и доставка по городу. Возврат возможен в течение 14 дней при сохранении товарного вида.</p></div>
          <button type="button" onClick={() => addItem(product, selectedSize)} className="mt-8 flex min-h-12 w-full items-center justify-center bg-[color:var(--ink)] px-5 text-sm font-medium text-[color:var(--white)] hover:bg-[color:var(--accent)]">В корзину</button>
        </section>
      </div>
      {isSizeTableOpen ? <div className="fixed inset-0 z-50 grid place-items-center bg-[color:var(--ink)]/45 p-4" role="dialog" aria-modal="true" aria-label="Таблица размеров"><div className="w-full max-w-sm bg-[color:var(--paper)] p-6 shadow-xl"><div className="flex items-start justify-between gap-4"><h2 className="font-display text-3xl leading-none">Таблица размеров</h2><button type="button" onClick={() => setIsSizeTableOpen(false)} className="text-xl text-[color:var(--ink)]/60 hover:text-[color:var(--ink)]" aria-label="Закрыть">×</button></div><p className="mt-5 text-sm leading-6 text-[color:var(--ink)]/70">Уточняйте параметры и наличие у консультанта.</p></div></div> : null}
    </main>
  );
}
