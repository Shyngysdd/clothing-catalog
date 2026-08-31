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

  return <div className={`look-product-media aspect-[4/5] transition-[filter,transform] duration-200 ease-out group-hover:scale-[0.985] group-hover:brightness-75 ${product.sizes.length > 0 && product.sizes.every((size) => !size.inStock) ? "grayscale" : ""}`} style={{ "--look-tone": tone, backgroundColor: product.imageColor } as CSSProperties} onMouseEnter={() => setActiveFrame(frames.length > 1 ? 1 : 0)} onMouseLeave={() => setActiveFrame(0)}>
    {frames.map((imageUrl, index) => <Image key={imageUrl} src={imageUrl} alt="" fill sizes="(max-width: 767px) 72vw, 18rem" className={`look-gallery-frame product-card-photo ${activeFrame === index ? "is-active" : ""}`} />)}
    <p className="look-product-sizes">РАЗМЕРЫ: {product.sizes.map((size) => size.size).join(" · ")}</p>
    {product.sizes.length > 0 && product.sizes.every((size) => !size.inStock) ? <span className="absolute left-3 top-3 border border-[color:var(--paper)]/50 bg-[color:var(--ink)]/80 px-2 py-1 font-mono-price text-[0.65rem] text-[color:var(--white)]">НЕТ В НАЛИЧИИ</span> : null}
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

  return <div className="home-product-marquee" onTouchStart={pauseForTouch} onTouchEnd={resumeAfterTouch} onTouchCancel={resumeAfterTouch}><div className={`home-product-track ${shouldLoop ? "" : "home-product-track--static"}`} style={{ animationPlayState: isUserScrolling ? "paused" : "running" }}>{loopedProducts.map((product, index) => <Link key={`${product.id}-${index}`} href={`/catalog/${product.id}`} className="home-look-card look-product-card group block" aria-label={`Открыть товар: ${product.name}`}><p className="look-number mb-3 text-3xl text-[color:var(--ink)] sm:text-4xl">LOOK {String((index % selection.length) + 1).padStart(2, "0")}</p><HomeProductPreview product={product} tone={index % 2 === 0 ? "var(--accent)" : "var(--gold)"} /><div className="mt-4 flex items-start justify-between gap-3"><h3 className="text-sm font-medium leading-5 sm:text-base">{product.name}</h3><div className="shrink-0 text-right"><p className="font-mono-price text-sm">{formatPrice.format(product.price)} ₸</p>{product.originalPrice ? <p className="font-mono-price mt-0.5 text-[0.65rem] text-[color:var(--ink)]/45 line-through">{formatPrice.format(product.originalPrice)} ₸</p> : null}</div></div></Link>)}</div></div>;
}
