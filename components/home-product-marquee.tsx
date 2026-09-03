"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { CSSProperties } from "react";
import type { CatalogProduct } from "@/lib/catalog-types";
import { getDiscountPercent } from "@/lib/catalog-types";

const formatPrice = new Intl.NumberFormat("ru-RU");

function HomeProductPreview({ product, tone }: { product: CatalogProduct; tone: string }) {
  const frames = [product.imageUrl, ...product.galleryUrls].filter((imageUrl): imageUrl is string => Boolean(imageUrl));
  const [activeFrame, setActiveFrame] = useState(0);

  return <div className="look-product-media aspect-[4/5]" style={(product.imageUrl ? { background: "var(--white)" } : { "--look-tone": tone, backgroundColor: product.imageColor }) as CSSProperties} onMouseEnter={() => setActiveFrame(frames.length > 1 ? 1 : 0)} onMouseLeave={() => setActiveFrame(0)}>
    <div className={`look-product-photo-layer ${product.sizes.length > 0 && product.sizes.every((size) => !size.inStock) ? "grayscale" : ""}`}>{frames.map((imageUrl, index) => <div key={imageUrl} className={`look-gallery-frame ${activeFrame === index ? "is-active" : ""}`}><Image src={imageUrl} alt="" fill sizes="(max-width: 767px) 72vw, 18rem" className="product-card-photo" /></div>)}</div>
    <p className="look-product-sizes">РАЗМЕРЫ: {product.sizes.map((size) => size.size).join(" · ")}</p>
    {product.sizes.length > 0 && product.sizes.every((size) => !size.inStock) ? <span className="absolute right-3 top-3 border border-[color:var(--paper)]/50 bg-[color:var(--ink)]/80 px-2 py-1 font-mono-price text-[0.65rem] text-[color:var(--white)]">НЕТ В НАЛИЧИИ</span> : null}
    {getDiscountPercent(product) ? <span className="discount-stamp">−{getDiscountPercent(product)}%</span> : null}
  </div>;
}

export function HomeProductMarquee({ products: selection }: { products: CatalogProduct[] }) {
  const shouldLoop = selection.length >= 6;
  const loopedProducts = shouldLoop ? [...selection, ...selection] : selection;
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  const [touchTimeout, setTouchTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);

  function pauseForTouch() {
    if (touchTimeout) window.clearTimeout(touchTimeout);
    setIsUserScrolling(true);
  }

  function resumeAfterTouch() {
    if (touchTimeout) window.clearTimeout(touchTimeout);
    setTouchTimeout(setTimeout(() => setIsUserScrolling(false), 1500));
  }

  return <div className="home-product-marquee" onTouchStart={pauseForTouch} onTouchEnd={resumeAfterTouch} onTouchCancel={resumeAfterTouch}><div className={`home-product-track ${shouldLoop ? "" : "home-product-track--static"}`} style={{ animationPlayState: isUserScrolling ? "paused" : "running" }}>{loopedProducts.map((product, index) => <Link key={`${product.id}-${index}`} href={`/catalog/${product.id}`} className="home-look-card look-product-card group flex h-full flex-col" aria-label={`Открыть товар: ${product.name}`}><p className="product-card-kicker font-mono-price mb-3 text-[0.62rem] tracking-[0.13em] text-[color:var(--accent)]">АРТИКУЛ / {product.sku}</p><HomeProductPreview product={product} tone={index % 2 === 0 ? "var(--accent)" : "var(--gold)"} /><div className="mt-4 flex min-h-[5.75rem] flex-1 flex-col md:min-h-0 md:flex-row md:items-start md:justify-between md:gap-3"><div><p className="font-mono-price text-[0.6rem] tracking-[0.12em] text-[color:var(--accent)]">{product.brand.toUpperCase()}</p><h3 className="mt-1 line-clamp-2 min-h-[2.5rem] text-sm font-medium leading-5 sm:text-base md:min-h-0">{product.name}</h3></div><div className="mt-auto min-h-[2.25rem] pt-2 text-left md:mt-0 md:min-h-0 md:shrink-0 md:pt-0 md:text-right"><p className="font-mono-price text-sm">{formatPrice.format(product.price)} ₸</p>{product.originalPrice ? <p className="font-mono-price mt-0.5 text-[0.65rem] text-[color:var(--ink)]/45 line-through">{formatPrice.format(product.originalPrice)} ₸</p> : null}</div></div></Link>)}</div></div>;
}
