"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useCart } from "@/context/cart-context";
import type { CatalogLook } from "@/lib/catalog-types";

const formatPrice = new Intl.NumberFormat("ru-KZ");

function LookPreview({ placeholders }: { placeholders: string[] }) {
  const [isHovered, setIsHovered] = useState(false);
  const [activeFrame, setActiveFrame] = useState(0);

  useEffect(() => {
    if (!isHovered || placeholders.length < 2) return;
    const timer = window.setInterval(() => {
      setActiveFrame((current) => (current + 1) % placeholders.length);
    }, 520);
    return () => window.clearInterval(timer);
  }, [isHovered, placeholders.length]);

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
      {placeholders.map((placeholder, index) => (
        <div
          key={`${placeholder}-${index}`}
          className={`look-gallery-frame look-gallery-frame--${placeholder} ${index === activeFrame ? "is-active" : ""}`}
        />
      ))}
    </div>
  );
}

export function LooksClient({ looks }: { looks: CatalogLook[] }) {
  const { addItem } = useCart();

  function addLookToCart(look: CatalogLook) {
    look.items.forEach((product) => {
      const firstAvailableSize = product.sizes.find((size) => size.inStock);
      if (firstAvailableSize) addItem(product, firstAvailableSize.size);
    });
  }

  return (
    <section className="mx-auto max-w-[90rem] px-4 py-10 sm:px-6 sm:py-16 lg:px-10">
      <div className="max-w-2xl">
        <p className="font-mono-price text-xs tracking-[0.16em] text-[color:var(--accent)]">ГАРДЕРОБ / СОЧЕТАНИЯ</p>
        <h1 className="font-section mt-3 text-5xl leading-none sm:text-7xl">Образы</h1>
        <p className="mt-5 leading-7 text-[color:var(--ink)]/70">Готовые сочетания из каталога — выбирайте целиком или открывайте отдельные вещи.</p>
      </div>

      <div className="mt-10 grid gap-5 sm:mt-12 sm:gap-6 lg:grid-cols-3">
        {looks.map((look, index) => {
          const lookProducts = look.items;

          return (
            <article key={look.id} className="flex h-full flex-col border border-[color:var(--ink)]/15 bg-[color:var(--white)] p-3 sm:p-4">
              <Link href={`/looks/${look.id}`} className="group flex flex-1 flex-col focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[color:var(--accent)]">
                <LookPreview placeholders={look.photoTones} />
                <div className="flex flex-1 flex-col pt-4 sm:pt-5">
                  <p className="look-number text-xl leading-none text-[color:var(--accent)] sm:text-2xl">ОБРАЗ {String(index + 1).padStart(2, "0")}</p>
                  <h2 className="font-section mt-3 text-2xl leading-tight sm:text-3xl">{look.title}</h2>
                  <p className="mt-3 text-sm leading-6 text-[color:var(--ink)]/65">{lookProducts.map((product) => product.name).join(" · ")}</p>
                  <p className="font-mono-price mt-auto pt-4 text-base sm:text-lg">{formatPrice.format(lookProducts.reduce((total, product) => total + product.price, 0))} ₸</p>
                </div>
              </Link>
              <button type="button" onClick={() => addLookToCart(look)} className="mt-4 min-h-11 w-full bg-[color:var(--ink)] px-4 text-sm font-medium text-white hover:bg-[color:var(--accent)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--accent)]">
                Добавить весь образ в корзину
              </button>
            </article>
          );
        })}
      </div>
    </section>
  );
}
