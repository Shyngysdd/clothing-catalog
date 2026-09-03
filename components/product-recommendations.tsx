"use client";

import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { useRef, useState } from "react";
import type { CatalogProduct } from "@/lib/catalog-types";
import { getDiscountPercent } from "@/lib/catalog-types";
import { useSwipeGallery } from "@/hooks/use-swipe-gallery";

const formatPrice = new Intl.NumberFormat("ru-KZ");

function RecommendationCard({ product, index }: { product: CatalogProduct; index: number }) {
  const frames = [product.imageUrl, ...product.galleryUrls].filter((imageUrl): imageUrl is string => Boolean(imageUrl));
  const [activeFrame, setActiveFrame] = useState(0);
  const swipeGallery = useSwipeGallery({ frameCount: frames.length, setActiveFrame, maxSwipeDistance: 110 });
  const isSoldOut = !product.sizes.some((size) => size.inStock);
  const discountPercent = getDiscountPercent(product);

  return <article className={`look-product-card group flex h-full w-[clamp(7.75rem,35vw,10rem)] shrink-0 snap-start flex-col sm:w-[17rem] lg:w-[18rem] ${isSoldOut ? "opacity-60" : ""}`}>
    <Link href={`/catalog/${product.id}`} className="flex h-full flex-col focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[color:var(--accent)]" aria-label={`Открыть ${product.name}`}>
      <p className="product-card-kicker font-mono-price mb-3 text-[0.62rem] tracking-[0.13em] text-[color:var(--accent)]">АРТИКУЛ / {product.sku}</p>
      <div className="look-product-media aspect-[4/5]" style={{ "--look-tone": index % 2 === 0 ? "var(--accent)" : "var(--gold)", backgroundColor: product.imageColor } as CSSProperties} onMouseEnter={() => setActiveFrame(frames.length > 1 ? 1 : 0)} onMouseLeave={() => setActiveFrame(0)} {...swipeGallery}>
        {frames.length > 0 ? <div className="look-product-photo-layer">{frames.map((imageUrl, frameIndex) => <div key={imageUrl} className={`look-gallery-frame ${frameIndex === activeFrame ? "is-active" : ""}`}><Image src={imageUrl} alt="" fill sizes="(max-width: 639px) 35vw, (max-width: 1024px) 50vw, 25vw" className={`product-card-photo ${isSoldOut ? "grayscale" : ""}`} /></div>)}</div> : product.galleryTones.map((tone, frameIndex) => <div key={`${tone}-${frameIndex}`} className={`look-gallery-frame look-gallery-frame--${tone} ${frameIndex === activeFrame ? "is-active" : ""}`} />)}
        <p className="look-product-sizes">{isSoldOut ? "НЕТ В НАЛИЧИИ" : `РАЗМЕРЫ: ${product.sizes.filter((size) => size.inStock).map((size) => size.size).join(" · ")}`}</p>
        {discountPercent ? <span className="discount-stamp">−{discountPercent}%</span> : null}
        {frames.length > 1 ? <span className="look-gallery-dots absolute left-1/2 z-[3] flex -translate-x-1/2 gap-1" aria-hidden="true">{frames.map((_, frameIndex) => <i key={frameIndex} className={`block size-1.5 rounded-full border border-[color:var(--paper)]/70 ${activeFrame === frameIndex ? "bg-[color:var(--paper)]" : "bg-transparent"}`} />)}</span> : null}
      </div>
      <div className="mt-4 flex min-h-[6.4rem] flex-1 flex-col">
        <p className="font-mono-price text-[0.65rem] tracking-[0.12em] text-[color:var(--accent)]">{product.brand.toUpperCase()}</p>
        <h3 className="mt-1 line-clamp-2 min-h-[2.7rem] text-lg font-medium leading-[1.2] tracking-[-0.02em]">{product.name}</h3>
        <div className="mt-auto min-h-[2.75rem] pt-2">
          <p className="font-mono-price text-base">{formatPrice.format(product.price)} ₸</p>
          {product.originalPrice ? <p className="mt-0.5 font-mono-price text-xs text-[color:var(--ink)]/45 line-through">{formatPrice.format(product.originalPrice)} ₸</p> : null}
        </div>
      </div>
    </Link>
  </article>;
}

export function ProductRecommendations({ title, products }: { title: string; products: CatalogProduct[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  if (products.length === 0) return null;

  function scrollRecommendations(direction: "previous" | "next") {
    const track = trackRef.current;
    if (!track) return;
    const distance = Math.round(track.clientWidth * 0.82) * (direction === "next" ? 1 : -1);
    track.scrollBy({ left: distance, behavior: "smooth" });
  }

  return <section className="mt-12 border-t border-[color:var(--ink)]/15 pt-10 sm:mt-16 sm:pt-12" aria-labelledby={`${title}-heading`}>
    <div className="mb-7 flex items-end justify-between gap-5"><div><p className="font-mono-price text-xs tracking-[0.16em] text-[color:var(--accent)]">ПОДБОРКА</p><h2 id={`${title}-heading`} className="font-display mt-3 text-[clamp(2.35rem,6vw,3.75rem)] leading-[0.9] tracking-[-0.04em]">{title}</h2></div><div className="hidden items-center gap-2 md:flex"><button type="button" onClick={() => scrollRecommendations("previous")} aria-label={`Прокрутить «${title}» влево`} className="grid size-11 place-items-center border border-[color:var(--ink)]/25 text-[color:var(--ink)] transition hover:border-[color:var(--accent)] hover:bg-[color:var(--accent)] hover:text-[color:var(--white)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--gold)]"><span aria-hidden="true">←</span></button><button type="button" onClick={() => scrollRecommendations("next")} aria-label={`Прокрутить «${title}» вправо`} className="grid size-11 place-items-center border border-[color:var(--ink)]/25 text-[color:var(--ink)] transition hover:border-[color:var(--accent)] hover:bg-[color:var(--accent)] hover:text-[color:var(--white)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--gold)]"><span aria-hidden="true">→</span></button></div></div>
    <div className="relative -mx-4 sm:mx-0"><div aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-0 z-10 w-8 bg-gradient-to-r from-[color:var(--paper)] to-transparent sm:hidden" /><div aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-[color:var(--paper)] to-transparent" /><div ref={trackRef} className="recommendations-track flex items-stretch snap-x snap-mandatory flex-nowrap gap-4 overflow-x-auto scroll-smooth px-4 pb-2 sm:gap-6 sm:px-0">
      {products.map((product, index) => <RecommendationCard key={product.id} product={product} index={index} />)}
    </div></div>
  </section>;
}
