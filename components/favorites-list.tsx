"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { CSSProperties } from "react";
import type { CatalogProduct } from "@/lib/catalog-types";
import { useCart } from "@/context/cart-context";
import { useFavorites } from "@/context/favorites-context";

const formatPrice = new Intl.NumberFormat("ru-KZ");

export function FavoritesList({ products }: { products: CatalogProduct[] }) {
  const { favoriteIds, getFavorite, toggleFavorite } = useFavorites();
  const { addItem, openDrawer } = useCart();
  const [cartMessage, setCartMessage] = useState("");
  const favoriteProducts = products.filter((product) => favoriteIds.includes(product.id));

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

  if (favoriteProducts.length === 0) {
    return <div className="mt-10 border-y border-[color:var(--ink)]/15 py-10 text-center"><p className="text-[color:var(--ink)]/65">В избранном пока ничего нет.</p><Link href="/catalog" className="mt-4 inline-block text-sm text-[color:var(--accent)] underline underline-offset-4">Перейти в каталог</Link></div>;
  }

  return <div className="mt-10"><div className="flex flex-wrap items-center justify-between gap-4 border-b border-[color:var(--ink)]/15 pb-5"><p className="text-sm text-[color:var(--ink)]/65">Сохранённые товары: {favoriteProducts.length}</p><button type="button" onClick={addAllToCart} className="min-h-11 bg-[color:var(--ink)] px-4 text-sm font-medium text-[color:var(--white)] hover:bg-[color:var(--accent)]">Добавить всё в корзину</button></div>{cartMessage ? <p className="mt-4 text-sm text-[color:var(--accent)]">{cartMessage}</p> : null}<div className="mt-8 grid grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-3 sm:gap-x-6 sm:gap-y-12 lg:grid-cols-4">{favoriteProducts.map((product, index) => { const favorite = getFavorite(product.id); return <article key={product.id} className="look-product-card group relative"><button type="button" onClick={() => toggleFavorite(product.id)} className="absolute right-3 top-10 z-10 grid size-9 place-items-center bg-[color:var(--paper)] text-[color:var(--accent)] shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--accent)]" aria-label={`Удалить ${product.name} из избранного`}><svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor" className="size-5"><path d="M20.8 8.7c0 5-8.8 10.1-8.8 10.1S3.2 13.7 3.2 8.7A4.7 4.7 0 0 1 12 6.4a4.7 4.7 0 0 1 8.8 2.3Z" /></svg></button><Link href={`/catalog/${product.id}`} className="block focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[color:var(--accent)]"><p className="font-display mb-2 text-2xl leading-none tracking-[-0.04em] text-[color:var(--accent)] sm:mb-3 sm:text-3xl">LOOK {String(index + 1).padStart(2, "0")}</p><div className="look-product-media aspect-[4/5]" style={(product.imageUrl ? { background: "var(--white)" } : { "--look-tone": index % 2 === 0 ? "var(--accent)" : "var(--gold)", backgroundColor: product.imageColor }) as CSSProperties}>{product.imageUrl ? <Image src={product.imageUrl} alt={product.name} fill sizes="(max-width: 767px) 50vw, (max-width: 1024px) 33vw, 25vw" className="product-card-photo" /> : null}</div><div className="mt-3"><p className="text-sm font-medium sm:text-lg">{product.name}</p><p className="mt-1 text-xs text-[color:var(--ink)]/60">Размер: {favorite?.selectedSize || "Не выбран"}</p><p className="font-mono-price mt-1 text-sm">{formatPrice.format(product.price)} ₸</p></div></Link></article>; })}</div></div>;
}
