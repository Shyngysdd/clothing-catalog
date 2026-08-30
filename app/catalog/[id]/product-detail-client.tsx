"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useCart } from "@/context/cart-context";
import { useFavorites } from "@/context/favorites-context";
import type { CatalogProduct } from "@/lib/catalog-types";
import { getDiscountPercent } from "@/lib/catalog-types";

const formatPrice = new Intl.NumberFormat("ru-KZ");

export function ProductDetailClient({ product }: { product: CatalogProduct }) {
  const [activeFrame, setActiveFrame] = useState(0);
  const galleryImages = [product.imageUrl, ...product.galleryUrls].filter((imageUrl): imageUrl is string => Boolean(imageUrl));
  const firstAvailableSize = product.sizes.find((size) => size.inStock)?.size ?? "";
  const [selectedSize, setSelectedSize] = useState(firstAvailableSize);
  const [isSizeTableOpen, setIsSizeTableOpen] = useState(false);
  const { addItem } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();

  return (
    <main className="mx-auto max-w-[90rem] px-4 py-8 sm:px-6 sm:py-12 lg:px-10">
      <Link href="/catalog" className="font-mono-price text-xs tracking-[0.12em] text-[color:var(--accent)]">← В КАТАЛОГ</Link>
      <div className="mt-6 grid gap-9 lg:grid-cols-2 lg:gap-14">
        <section>
          <div className="look-preview aspect-[4/5]">
            {galleryImages.length > 0
              ? galleryImages.map((imageUrl, index) => <Image key={imageUrl} src={imageUrl} alt={`${product.name}, кадр ${index + 1}`} fill sizes="(max-width: 1024px) 100vw, 50vw" className={`look-gallery-frame product-detail-photo ${activeFrame === index ? "is-active" : ""}`} />)
              : product.galleryTones.map((tone, index) => <div key={`${tone}-${index}`} className={`look-gallery-frame look-gallery-frame--${tone} ${activeFrame === index ? "is-active" : ""}`} />)}
            {getDiscountPercent(product) ? <span className="discount-stamp">−{getDiscountPercent(product)}%</span> : null}
          </div>
          <div className="mt-3 flex gap-3 overflow-x-auto pb-1">
            {(galleryImages.length > 0 ? galleryImages : product.galleryTones).map((frame, index) => <button key={`${frame}-${index}`} type="button" onClick={() => setActiveFrame(index)} aria-label={`Показать кадр ${index + 1}`} aria-pressed={activeFrame === index} className={`relative aspect-[4/5] w-16 shrink-0 overflow-hidden border-2 transition-colors sm:w-20 ${galleryImages.length > 0 ? "" : `look-gallery-frame look-gallery-frame--${frame}`} ${activeFrame === index ? "border-[color:var(--accent)]" : "border-transparent hover:border-[color:var(--gold)]"}`}>{galleryImages.length > 0 ? <Image src={frame} alt="" fill sizes="80px" className="object-cover" /> : null}</button>)}
          </div>
        </section>
        <section className="lg:pt-3">
          <p className="font-mono-price text-xs tracking-[0.16em] text-[color:var(--accent)]">{product.category.toUpperCase()}</p>
          <div className="mt-4 flex items-start justify-between gap-4"><h1 className="font-display text-[clamp(2.5rem,8vw,4.5rem)] leading-[0.9] tracking-[-0.05em]">{product.name}</h1><span className="font-mono-price pt-2 text-xs text-[color:var(--ink)]/60">{product.sku}</span></div>
          <div className="mt-7 flex flex-wrap items-center gap-3"><p className="font-mono-price text-2xl">{formatPrice.format(product.price)} ₸</p>{product.originalPrice ? <p className="font-mono-price text-sm text-[color:var(--ink)]/45 line-through">{formatPrice.format(product.originalPrice)} ₸</p> : null}</div>
          <p className="mt-7 max-w-xl leading-7 text-[color:var(--ink)]/70">{product.description}</p>
          <fieldset className="mt-8"><legend className="text-sm font-medium">Выберите размер</legend><div className="mt-3 flex flex-wrap gap-2">{product.sizes.map((size) => <button key={size.size} type="button" disabled={!size.inStock} onClick={() => setSelectedSize(size.size)} aria-pressed={selectedSize === size.size} className={`min-h-11 min-w-11 border px-3 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:border-[color:var(--ink)]/15 disabled:text-[color:var(--ink)]/35 disabled:line-through ${selectedSize === size.size && size.inStock ? "border-[color:var(--ink)] bg-[color:var(--ink)] text-[color:var(--white)]" : "border-[color:var(--ink)]/25 hover:border-[color:var(--ink)]"}`}>{size.size}</button>)}</div></fieldset>
          <button type="button" onClick={() => setIsSizeTableOpen(true)} className="mt-4 text-sm underline decoration-[color:var(--gold)] underline-offset-4 hover:text-[color:var(--accent)]">Таблица размеров</button>
          <details className="mt-8 border-y border-[color:var(--ink)]/15 py-5" open><summary className="cursor-pointer font-medium">Состав и уход</summary><div className="mt-4 space-y-3 text-sm leading-6 text-[color:var(--ink)]/70"><p><span className="text-[color:var(--ink)]">Состав:</span> {product.composition}</p><p><span className="text-[color:var(--ink)]">Посадка:</span> {product.fit}</p><ul className="list-disc space-y-1 pl-5">{product.care.map((item) => <li key={item}>{item}</li>)}</ul></div></details>
          <div className="border-b border-[color:var(--ink)]/15 py-5"><h2 className="font-medium">Доставка и возврат</h2><p className="mt-3 text-sm leading-6 text-[color:var(--ink)]/70">Самовывоз и доставка по городу. Возврат возможен в течение 14 дней при сохранении товарного вида.</p></div>
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <button type="button" disabled={!firstAvailableSize} onClick={() => addItem(product, selectedSize)} className="flex min-h-12 items-center justify-center bg-[color:var(--ink)] px-5 text-sm font-medium text-[color:var(--white)] hover:bg-[color:var(--accent)] disabled:cursor-not-allowed disabled:bg-[color:var(--ink)]/35">{firstAvailableSize ? "В корзину" : "Нет в наличии"}</button>
            <button type="button" onClick={() => toggleFavorite(product.id)} aria-pressed={isFavorite(product.id)} className={`flex min-h-12 items-center justify-center gap-2 border px-5 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--accent)] ${isFavorite(product.id) ? "border-[color:var(--accent)] text-[color:var(--accent)]" : "border-[color:var(--ink)]/25 hover:border-[color:var(--accent)] hover:text-[color:var(--accent)]"}`}><svg aria-hidden="true" viewBox="0 0 24 24" fill={isFavorite(product.id) ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" className="size-5"><path d="M20.8 8.7c0 5-8.8 10.1-8.8 10.1S3.2 13.7 3.2 8.7A4.7 4.7 0 0 1 12 6.4a4.7 4.7 0 0 1 8.8 2.3Z" strokeLinecap="round" strokeLinejoin="round" /></svg>{isFavorite(product.id) ? "В избранном" : "В избранное"}</button>
          </div>
        </section>
      </div>
      {isSizeTableOpen ? <div className="fixed inset-0 z-50 grid place-items-center bg-[color:var(--ink)]/45 p-4" role="dialog" aria-modal="true" aria-label="Таблица размеров"><div className="w-full max-w-sm bg-[color:var(--paper)] p-6 shadow-xl"><div className="flex items-start justify-between gap-4"><h2 className="font-display text-3xl leading-none">Таблица размеров</h2><button type="button" onClick={() => setIsSizeTableOpen(false)} className="text-xl text-[color:var(--ink)]/60 hover:text-[color:var(--ink)]" aria-label="Закрыть">×</button></div><p className="mt-5 text-sm leading-6 text-[color:var(--ink)]/70">Уточняйте параметры и наличие у консультанта.</p></div></div> : null}
    </main>
  );
}
