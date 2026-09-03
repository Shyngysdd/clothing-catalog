"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { CSSProperties } from "react";
import type { CatalogLook, CatalogProduct } from "@/lib/catalog-types";
import { useCart } from "@/context/cart-context";
import { useFavorites } from "@/context/favorites-context";

const formatPrice = new Intl.NumberFormat("ru-KZ");

export function FavoritesList({ products, looks }: { products: CatalogProduct[]; looks: CatalogLook[] }) {
  const { favoriteIds, lookFavoriteIds, getFavorite, toggleFavorite, toggleLookFavorite } = useFavorites();
  const { addItem, openDrawer } = useCart();
  const [cartMessage, setCartMessage] = useState("");
  const favoriteProducts = products.filter((product) => favoriteIds.includes(product.id));
  const favoriteLooks = looks.filter((look) => lookFavoriteIds.includes(look.id));

  function addAllToCart() {
    let added = 0;
    let unavailable = 0;
    for (const product of favoriteProducts) {
      const favorite = getFavorite(product.id);
      const selectedSize = favorite?.selectedSize;
      const isSelectedSizeAvailable = selectedSize && product.sizes.some((size) => size.size === selectedSize && size.inStock);
      const size = isSelectedSizeAvailable ? selectedSize : product.sizes.find((item) => item.inStock)?.size;
      if (!size) {
        unavailable += 1;
        continue;
      }
      addItem(product, size);
      added += 1;
    }
    setCartMessage(`Добавлено в корзину: ${added} из ${favoriteProducts.length} товаров${unavailable ? ` · недоступно: ${unavailable}` : ""}`);
    if (added > 0) openDrawer();
  }

  if (favoriteProducts.length === 0 && favoriteLooks.length === 0) {
    return <div className="mt-10 border-y border-[color:var(--ink)]/15 py-10 text-center"><p className="text-[color:var(--ink)]/65">В избранном пока ничего нет.</p><Link href="/catalog" className="mt-4 inline-block text-sm text-[color:var(--accent)] underline underline-offset-4">Перейти в каталог</Link></div>;
  }

  return (
    <div className="mt-10 space-y-14 sm:space-y-20">
      <section aria-labelledby="favorite-products-title">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[color:var(--ink)]/15 pb-5">
          <div><p className="font-mono-price text-xs tracking-[0.14em] text-[color:var(--accent)]">ИЗБРАННОЕ</p><h2 id="favorite-products-title" className="font-section mt-2 text-3xl leading-none">Товары</h2></div>
          {favoriteProducts.length > 0 ? <button type="button" onClick={addAllToCart} className="min-h-11 bg-[color:var(--ink)] px-4 text-sm font-medium text-[color:var(--white)] hover:bg-[color:var(--accent)]">Добавить всё в корзину</button> : null}
        </div>
        {cartMessage ? <p className="mt-4 text-sm text-[color:var(--accent)]">{cartMessage}</p> : null}
        {favoriteProducts.length === 0 ? <p className="mt-6 text-sm text-[color:var(--ink)]/60">Сохранённых товаров пока нет.</p> : <div className="mt-8 grid grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-3 sm:gap-x-6 sm:gap-y-12 lg:grid-cols-4">{favoriteProducts.map((product, index) => { const favorite = getFavorite(product.id); return <article key={product.id} className="look-product-card group relative"><button type="button" onClick={() => toggleFavorite(product.id)} className="absolute right-3 top-10 z-10 grid size-9 place-items-center bg-[color:var(--paper)] text-[color:var(--accent)] shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--accent)]" aria-label={`Удалить ${product.name} из избранного`}><svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor" className="size-5"><path d="M20.8 8.7c0 5-8.8 10.1-8.8 10.1S3.2 13.7 3.2 8.7A4.7 4.7 0 0 1 12 6.4a4.7 4.7 0 0 1 8.8 2.3Z" /></svg></button><Link href={`/catalog/${product.id}`} className="block focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[color:var(--accent)]"><p className="product-card-kicker font-mono-price mb-2 text-[0.62rem] tracking-[0.13em] text-[color:var(--accent)] sm:mb-3">АРТИКУЛ / {product.sku}</p><div className="look-product-media aspect-[4/5]" style={(product.imageUrl ? { background: "var(--white)" } : { "--look-tone": index % 2 === 0 ? "var(--accent)" : "var(--gold)", backgroundColor: product.imageColor }) as CSSProperties}>{product.imageUrl ? <Image src={product.imageUrl} alt={product.name} fill sizes="(max-width: 767px) 50vw, (max-width: 1024px) 33vw, 25vw" className="product-card-photo" /> : null}</div><div className="mt-3"><p className="text-sm font-medium sm:text-lg">{product.name}</p><p className="mt-1 text-xs text-[color:var(--ink)]/60">Размер: {favorite?.selectedSize || "Не выбран"}</p><p className="font-mono-price mt-1 text-sm">{formatPrice.format(product.price)} ₸</p></div></Link></article>; })}</div>}
      </section>
      <section aria-labelledby="favorite-looks-title">
        <div className="border-b border-[color:var(--ink)]/15 pb-5"><p className="font-mono-price text-xs tracking-[0.14em] text-[color:var(--accent)]">ИЗБРАННОЕ</p><h2 id="favorite-looks-title" className="font-section mt-2 text-3xl leading-none">Образы</h2></div>
        {favoriteLooks.length === 0 ? <p className="mt-6 text-sm text-[color:var(--ink)]/60">Сохранённых образов пока нет.</p> : <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4">{favoriteLooks.map((look, index) => { const photoUrls = look.photoUrls.length > 0 ? look.photoUrls : look.items.flatMap((product) => product.imageUrl ? [product.imageUrl] : []); const totalPrice = look.items.reduce((total, product) => total + product.price, 0); return <article key={look.id} className="relative border border-[color:var(--ink)]/15 bg-[color:var(--white)] p-2 sm:p-4"><button type="button" onClick={() => toggleLookFavorite(look.id)} aria-label={`Удалить образ «${look.title}» из избранного`} className="absolute right-4 top-4 z-10 grid size-9 place-items-center rounded-full bg-[color:var(--paper)]/90 text-[color:var(--accent)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--accent)]"><svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor" className="size-5"><path d="M20.8 8.7c0 5-8.8 10.1-8.8 10.1S3.2 13.7 3.2 8.7A4.7 4.7 0 0 1 12 6.4a4.7 4.7 0 0 1 8.8 2.3Z" /></svg></button><Link href={`/looks/${look.id}`} className="block focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[color:var(--accent)]"><div className="look-preview aspect-[3/4]">{photoUrls[0] ? <div className="look-gallery-frame is-active"><Image src={photoUrls[0]} alt={look.title} fill sizes="(max-width: 767px) 50vw, (max-width: 1024px) 33vw, 25vw" className="product-card-photo" /></div> : <div className={`look-gallery-frame look-gallery-frame--${look.photoTones[0] || "accent"} is-active`} />}</div><div className="pt-3 sm:pt-5"><p className="look-number text-base leading-none text-[color:var(--accent)] sm:text-2xl">ОБРАЗ {String(index + 1).padStart(2, "0")}</p><h3 className="font-section mt-2 text-lg leading-tight sm:mt-3 sm:text-3xl">{look.title}</h3><p className="font-mono-price mt-3 text-xs sm:mt-4 sm:text-lg">{formatPrice.format(totalPrice)} ₸</p></div></Link></article>; })}</div>}
      </section>
    </div>
  );
}
