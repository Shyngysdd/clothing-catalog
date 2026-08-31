"use client";

import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import type { CatalogProduct } from "@/lib/catalog-types";
import { getDiscountPercent } from "@/lib/catalog-types";

const formatPrice = new Intl.NumberFormat("ru-KZ");

function RecommendationCard({ product, index }: { product: CatalogProduct; index: number }) {
  const frames = [product.imageUrl, ...product.galleryUrls].filter((imageUrl): imageUrl is string => Boolean(imageUrl));
  const isSoldOut = !product.sizes.some((size) => size.inStock);
  const discountPercent = getDiscountPercent(product);

  return <article className={`look-product-card group min-w-[13.5rem] flex-1 md:min-w-0 ${isSoldOut ? "opacity-60" : ""}`}>
    <Link href={`/catalog/${product.id}`} className="block focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[color:var(--accent)]" aria-label={`Открыть ${product.name}`}>
      <p className="font-display mb-3 text-3xl leading-none tracking-[-0.04em] text-[color:var(--accent)]">LOOK {String(index + 1).padStart(2, "0")}</p>
      <div className="look-product-media aspect-[4/5]" style={{ "--look-tone": index % 2 === 0 ? "var(--accent)" : "var(--gold)", backgroundColor: product.imageColor } as CSSProperties}>
        {frames.length > 0 ? <div className="look-product-photo-layer">{frames.map((imageUrl, frameIndex) => <div key={imageUrl} className={`look-gallery-frame ${frameIndex === 0 ? "is-active" : ""}`}><Image src={imageUrl} alt="" fill sizes="(max-width: 767px) 72vw, (max-width: 1024px) 50vw, 25vw" className={`product-card-photo ${isSoldOut ? "grayscale" : ""}`} /></div>)}</div> : product.galleryTones.map((tone, frameIndex) => <div key={`${tone}-${frameIndex}`} className={`look-gallery-frame look-gallery-frame--${tone} ${frameIndex === 0 ? "is-active" : ""}`} />)}
        <p className="look-product-sizes">{isSoldOut ? "НЕТ В НАЛИЧИИ" : `РАЗМЕРЫ: ${product.sizes.filter((size) => size.inStock).map((size) => size.size).join(" · ")}`}</p>
        {discountPercent ? <span className="discount-stamp">−{discountPercent}%</span> : null}
      </div>
      <div className="mt-4"><h3 className="text-lg font-medium tracking-[-0.02em]">{product.name}</h3><div className="mt-2 flex flex-wrap items-center gap-2"><p className="font-mono-price text-base">{formatPrice.format(product.price)} ₸</p>{product.originalPrice ? <p className="font-mono-price text-xs text-[color:var(--ink)]/45 line-through">{formatPrice.format(product.originalPrice)} ₸</p> : null}</div></div>
    </Link>
  </article>;
}

export function ProductRecommendations({ title, products }: { title: string; products: CatalogProduct[] }) {
  if (products.length === 0) return null;

  return <section className="mt-12 border-t border-[color:var(--ink)]/15 pt-10 sm:mt-16 sm:pt-12" aria-labelledby={`${title}-heading`}>
    <div className="mb-7"><p className="font-mono-price text-xs tracking-[0.16em] text-[color:var(--accent)]">ПОДБОРКА</p><h2 id={`${title}-heading`} className="font-display mt-3 text-[clamp(2.35rem,6vw,3.75rem)] leading-[0.9] tracking-[-0.04em]">{title}</h2></div>
    <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-x-6 sm:gap-y-10 sm:overflow-visible sm:px-0 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product, index) => <div key={product.id} className="snap-start sm:contents"><RecommendationCard product={product} index={index} /></div>)}
    </div>
  </section>;
}
