"use client";

import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { useRef, useState, type TouchEvent } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useCart } from "@/context/cart-context";
import { useFavorites } from "@/context/favorites-context";
import type { CatalogLook } from "@/lib/catalog-types";
import { getLocalizedField } from "@/lib/localized";

const formatPrice = new Intl.NumberFormat("ru-KZ");

export function LookDetailClient({ look, lookNumber }: { look: CatalogLook; lookNumber: number }) {
  const t = useTranslations("Look");
  const locale = useLocale();
  const lookTitle = getLocalizedField(look, "title", locale);
  const lookDescription = getLocalizedField(look, "description", locale);
  const [activeFrame, setActiveFrame] = useState(0);
  const { addItem } = useCart();
  const { isLookFavorite, toggleLookFavorite } = useFavorites();
  const lookProducts = look.items;
  const frames = look.photoUrls.length > 0 ? look.photoUrls : look.photoTones;
  const touchStartX = useRef<number | null>(null);

  function showPreviousFrame() {
    if (frames.length > 1) setActiveFrame((previous) => (previous - 1 + frames.length) % frames.length);
  }

  function showNextFrame() {
    if (frames.length > 1) setActiveFrame((previous) => (previous + 1) % frames.length);
  }

  function handleTouchStart(event: TouchEvent<HTMLDivElement>) {
    touchStartX.current = event.touches[0]?.clientX ?? null;
  }

  function handleTouchEnd(event: TouchEvent<HTMLDivElement>) {
    if (touchStartX.current === null) return;
    const endX = event.changedTouches[0]?.clientX;
    if (endX !== undefined) {
      const deltaX = endX - touchStartX.current;
      if (deltaX > 40) showPreviousFrame();
      else if (deltaX < -40) showNextFrame();
    }
    touchStartX.current = null;
  }

  function addLookToCart() {
    lookProducts.forEach((product) => {
      const firstAvailableSize = product.sizes.find((size) => size.inStock);
      if (firstAvailableSize) addItem(product, firstAvailableSize.size);
    });
  }

  return (
    <section className="look-detail-page mx-auto max-w-[100rem] px-4 py-10 sm:px-6 sm:py-16">
      <Link href="/looks" className="product-back-link font-mono-price text-xs tracking-[0.1em] text-[color:var(--accent)]">{t("back")}</Link>
      <div className="look-detail-layout mt-6 grid gap-8 lg:grid-cols-[minmax(0,1.12fr)_minmax(18rem,0.88fr)] lg:gap-0">
      <section className="look-detail-gallery">
      <div className="look-detail-preview look-preview group aspect-[4/5]" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
        {look.photoUrls.length > 0
          ? look.photoUrls.map((photoUrl, index) => <div key={photoUrl} className={`look-gallery-frame ${index === activeFrame ? "is-active" : ""}`}><Image src={photoUrl} alt={`${lookTitle}, кадр ${index + 1}`} fill sizes="(max-width: 1024px) 100vw, 64rem" className="product-detail-photo" /></div>)
          : look.photoTones.map((placeholder, index) => <div key={`${placeholder}-${index}`} className={`look-gallery-frame look-gallery-frame--${placeholder} ${index === activeFrame ? "is-active" : ""}`} />)}
        {frames.length > 1 ? <><button type="button" onClick={showPreviousFrame} aria-label="Предыдущий кадр" className="absolute left-3 top-1/2 z-10 hidden size-10 -translate-y-1/2 place-items-center border border-[color:var(--paper)]/55 bg-[color:var(--ink)]/55 text-2xl leading-none text-[color:var(--white)] opacity-0 transition-opacity hover:bg-[color:var(--accent)] focus-visible:opacity-100 group-hover:opacity-100 md:grid">‹</button><button type="button" onClick={showNextFrame} aria-label="Следующий кадр" className="absolute right-3 top-1/2 z-10 hidden size-10 -translate-y-1/2 place-items-center border border-[color:var(--paper)]/55 bg-[color:var(--ink)]/55 text-2xl leading-none text-[color:var(--white)] opacity-0 transition-opacity hover:bg-[color:var(--accent)] focus-visible:opacity-100 group-hover:opacity-100 md:grid">›</button></> : null}
      </div>
      <div className="mt-4 flex justify-center gap-2" aria-label="Кадры образа">
        {frames.map((_, index) => (
          <button key={index} type="button" onClick={() => setActiveFrame(index)} aria-label={`Показать кадр ${index + 1}`} aria-current={activeFrame === index} className={`size-2 rounded-full transition-colors ${activeFrame === index ? "bg-[color:var(--accent)]" : "bg-[color:var(--ink)]/25 hover:bg-[color:var(--ink)]/55"}`} />
        ))}
      </div>
      </section>
      <section className="look-detail-content">
      <div className="border-b border-[color:var(--border)] pb-7">
        <p className="look-number text-4xl leading-none text-[color:var(--accent)]">{t("number", {number: String(lookNumber).padStart(2, "0")})}</p>
        <h1 className="font-section mt-4 text-[clamp(2.35rem,7vw,3.75rem)] leading-[0.95]">{lookTitle}</h1>
        <p className="mt-5 max-w-2xl leading-7 text-[color:var(--ink)]/70">{lookDescription}</p>
      </div>
      <div className="divide-y divide-[color:var(--ink)]/15">
        {lookProducts.map((product) => (
          <div key={product.id} className="flex items-center gap-4 py-4 sm:gap-6">
            {product.imageUrl ? <div className="relative size-16 shrink-0 overflow-hidden border border-[color:var(--border)]"><Image src={product.imageUrl} alt="" fill sizes="64px" className="object-cover" /></div> : <div className="size-16 shrink-0 border border-[color:var(--border)]" style={{ backgroundColor: product.imageColor }} />}
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{getLocalizedField(product, "name", locale)}</p>
              <p className="font-mono-price mt-1 whitespace-nowrap text-sm text-[color:var(--ink)]/70">{formatPrice.format(product.price)} ₸</p>
            </div>
            <Link href={`/catalog/${product.id}`} className="shrink-0 text-sm underline decoration-[color:var(--gold)] underline-offset-4 hover:text-[color:var(--accent)]">{t("viewProduct")}</Link>
          </div>
        ))}
      </div>
      <div className="mt-4 flex flex-col gap-4 border-t border-[color:var(--border)] pt-4 xl:flex-row xl:items-center xl:justify-between">
        <p className="font-mono-price shrink-0 whitespace-nowrap text-2xl">{formatPrice.format(lookProducts.reduce((total, product) => total + product.price, 0))} ₸</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <button type="button" onClick={() => toggleLookFavorite(look.id)} aria-pressed={isLookFavorite(look.id)} className={`min-h-12 whitespace-nowrap border px-5 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--accent)] ${isLookFavorite(look.id) ? "border-[color:var(--accent)] text-[color:var(--accent)]" : "border-[color:var(--border)] hover:border-[color:var(--accent)] hover:text-[color:var(--accent)]"}`}>{isLookFavorite(look.id) ? t("inFavorites") : t("toFavorites")}</button>
          <button type="button" onClick={addLookToCart} className="min-h-12 whitespace-nowrap bg-[color:var(--ink)] px-6 text-sm font-medium text-[color:var(--paper)] hover:bg-[color:var(--accent)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--accent)]">{t("addAll")}</button>
        </div>
      </div>
      </section>
      </div>
    </section>
  );
}
