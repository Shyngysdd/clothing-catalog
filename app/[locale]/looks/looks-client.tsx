"use client";

import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useCart } from "@/context/cart-context";
import { useFavorites } from "@/context/favorites-context";
import type { CatalogLook } from "@/lib/catalog-types";

const formatPrice = new Intl.NumberFormat("ru-KZ");

function LookPreview({ photoUrls, placeholders }: { photoUrls: string[]; placeholders: string[] }) {
  const [isHovered, setIsHovered] = useState(false);
  const [activeFrame, setActiveFrame] = useState(0);

  const frames = photoUrls.length > 0 ? photoUrls : placeholders;

  useEffect(() => {
    if (!isHovered || frames.length < 2) return;
    const timer = window.setInterval(() => {
      setActiveFrame((current) => (current + 1) % frames.length);
    }, 520);
    return () => window.clearInterval(timer);
  }, [isHovered, frames.length]);

  function resetPreview() {
    setIsHovered(false);
    setActiveFrame(0);
  }

  return (
    <div
      className="look-preview aspect-[3/4]"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={resetPreview}
    >
      {photoUrls.length > 0
        ? photoUrls.map((photoUrl, index) => <div key={photoUrl} className={`look-gallery-frame ${index === activeFrame ? "is-active" : ""}`}><Image src={photoUrl} alt="" fill sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 28rem" className="product-card-photo" /></div>)
        : placeholders.map((placeholder, index) => <div key={`${placeholder}-${index}`} className={`look-gallery-frame look-gallery-frame--${placeholder} ${index === activeFrame ? "is-active" : ""}`} />)}
    </div>
  );
}

export function LooksClient({ looks }: { looks: CatalogLook[] }) {
  const { addItem } = useCart();
  const { isLookFavorite, toggleLookFavorite } = useFavorites();
  const [selectedSize, setSelectedSize] = useState("Все");
  const sizes = useMemo(() => ["Все", ...Array.from(new Set(looks.flatMap((look) => look.items.flatMap((product) => product.sizes.filter((size) => size.inStock).map((size) => size.size)))).values())], [looks]);
  const filteredLooks = selectedSize === "Все" ? looks : looks.filter((look) => look.items.some((product) => product.sizes.some((size) => size.inStock && size.size === selectedSize)));

  function addLookToCart(look: CatalogLook) {
    look.items.forEach((product) => {
      const firstAvailableSize = product.sizes.find((size) => size.inStock);
      if (firstAvailableSize) addItem(product, firstAvailableSize.size);
    });
  }

  return (
    <section className="looks-page px-4 py-10 sm:px-6 sm:py-16 lg:px-10">
      <div className="looks-page-header border-b border-[color:var(--border)] pb-8 sm:pb-10">
        <div>
          <p className="font-mono-price text-xs tracking-[0.16em] text-[color:var(--accent)]">ГАРДЕРОБ / СОЧЕТАНИЯ</p>
          <h1 className="font-section mt-3 text-[clamp(3.4rem,9vw,6.8rem)] leading-[0.8]">Образы</h1>
        </div>
        <p className="looks-page-manifest">Готовые сочетания, собранные вокруг пропорции и цвета. Выберите образ целиком или начните с одной вещи.</p>
      </div>

      <div className="looks-size-filter mt-7 border-b border-[color:var(--border)] pb-5 sm:mt-9">
        <p className="font-mono-price text-[10px] tracking-[0.12em] text-[color:var(--ink)]/60">РАЗМЕР В СОСТАВЕ ОБРАЗА</p>
        <div className="mt-3 flex flex-wrap gap-2">{sizes.map((size) => <button key={size} type="button" onClick={() => setSelectedSize(size)} aria-pressed={selectedSize === size} className={`min-h-9 border px-3 text-xs font-medium transition ${selectedSize === size ? "border-[color:var(--ink)] bg-[color:var(--ink)] text-[color:var(--paper)]" : "border-[color:var(--border)] hover:border-[color:var(--accent)] hover:text-[color:var(--accent)]"}`}>{size}</button>)}</div>
      </div>

      <div className="looks-editorial-grid mt-8 grid grid-cols-2 gap-x-3 gap-y-10 sm:mt-12 sm:gap-x-7 sm:gap-y-16 lg:grid-cols-2">
        {filteredLooks.map((look, index) => {
          const lookProducts = look.items;
          const previewPhotoUrls =
            look.photoUrls.length > 0
              ? look.photoUrls
              : lookProducts.flatMap((product) =>
                  product.imageUrl ? [product.imageUrl] : [],
                );

          return (
            <article key={look.id} className={`look-editorial-card relative flex h-full flex-col border border-[color:var(--border)] p-2 sm:p-4 ${index === 0 ? "look-editorial-card--lead" : ""}`}>
              <button
                type="button"
                onClick={() => toggleLookFavorite(look.id)}
                aria-label={isLookFavorite(look.id) ? `Убрать образ «${look.title}» из избранного` : `Добавить образ «${look.title}» в избранное`}
                aria-pressed={isLookFavorite(look.id)}
                className="absolute right-4 top-4 z-10 grid size-9 place-items-center rounded-full bg-[color:var(--paper)]/90 text-[color:var(--ink)] hover:text-[color:var(--accent)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--accent)]"
              >
                <svg aria-hidden="true" viewBox="0 0 24 24" fill={isLookFavorite(look.id) ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" className={`size-5 ${isLookFavorite(look.id) ? "text-[color:var(--accent)]" : ""}`}><path d="M20.8 8.7c0 5-8.8 10.1-8.8 10.1S3.2 13.7 3.2 8.7A4.7 4.7 0 0 1 12 6.4a4.7 4.7 0 0 1 8.8 2.3Z" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </button>
              <Link href={`/looks/${look.id}`} className="group flex flex-1 flex-col focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[color:var(--accent)]">
                <LookPreview photoUrls={previewPhotoUrls} placeholders={look.photoTones} />
                <div className="look-editorial-copy flex flex-1 flex-col pt-3 sm:pt-5">
                  <p className="look-number text-base leading-none text-[color:var(--accent)] sm:text-xl">ОБРАЗ {String(index + 1).padStart(2, "0")}</p>
                  <h2 className="font-section mt-2 text-lg leading-tight sm:mt-3 sm:text-4xl">{look.title}</h2>
                  <p className="mt-2 line-clamp-2 text-xs leading-5 text-[color:var(--ink)]/65 sm:mt-3 sm:text-sm sm:leading-6">{lookProducts.map((product) => product.name).join(" · ")}</p>
                  <p className="font-mono-price mt-auto pt-3 text-xs sm:pt-4 sm:text-lg">{formatPrice.format(lookProducts.reduce((total, product) => total + product.price, 0))} ₸</p>
                </div>
              </Link>
              <button type="button" onClick={() => addLookToCart(look)} className="mt-3 min-h-10 w-full bg-[color:var(--ink)] px-2 text-xs font-medium text-[color:var(--paper)] hover:bg-[color:var(--accent)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--accent)] sm:mt-4 sm:min-h-11 sm:px-4 sm:text-sm">
                <span className="sm:hidden">В корзину</span><span className="hidden sm:inline">Добавить весь образ в корзину</span>
              </button>
            </article>
          );
        })}
      </div>
      {filteredLooks.length === 0 ? <div className="mt-8 border border-dashed border-[color:var(--border)] px-6 py-10 text-center text-sm text-[color:var(--ink)]/65">Нет образов с товарами в размере {selectedSize}.</div> : null}
    </section>
  );
}
