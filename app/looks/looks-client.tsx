"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useCart } from "@/context/cart-context";
import type { Look } from "@/data/looks";
import type { Product } from "@/data/products";

const formatPrice = new Intl.NumberFormat("ru-KZ");

function LookPreview({ placeholders }: { placeholders: string[] }) {
  const [isHovered, setIsHovered] = useState(false);
  const [activeFrame, setActiveFrame] = useState(0);

  useEffect(() => {
    if (!isHovered || placeholders.length < 2) return;
    const timer = window.setInterval(() => {
      setActiveFrame((current) => (current + 1) % placeholders.length);
    }, 900);
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

export function LooksClient({ looks, products }: { looks: Look[]; products: Product[] }) {
  const { addItem } = useCart();
  const productsById = useMemo(() => new Map(products.map((product) => [product.id, product])), [products]);

  function addLookToCart(look: Look) {
    look.productIds.forEach((productId) => {
      const product = productsById.get(productId);
      if (product) addItem(product, product.sizes[0]);
    });
  }

  return (
    <section className="mx-auto max-w-[90rem] px-4 py-10 sm:px-6 sm:py-16 lg:px-10">
      <div className="max-w-2xl">
        <p className="font-mono-price text-xs tracking-[0.16em] text-[color:var(--accent)]">ГАРДЕРОБ / СОЧЕТАНИЯ</p>
        <h1 className="font-display mt-3 text-5xl leading-none tracking-[-0.04em] sm:text-7xl">Образы</h1>
        <p className="mt-5 leading-7 text-[color:var(--ink)]/70">Готовые сочетания из каталога — выбирайте целиком или открывайте отдельные вещи.</p>
      </div>

      <div className="mt-10 grid gap-5 sm:mt-12 sm:gap-6 lg:grid-cols-3">
        {looks.map((look, index) => {
          const lookProducts = look.productIds.flatMap((id) => {
            const product = productsById.get(id);
            return product ? [product] : [];
          });

          return (
            <article key={look.id} className="border border-[color:var(--ink)]/15 bg-[color:var(--white)] p-3 sm:p-4">
              <Link href={`/looks/${look.id}`} className="group block focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[color:var(--accent)]">
                <LookPreview placeholders={look.photoPlaceholders} />
                <div className="pt-4 sm:pt-5">
                  <p className="look-number text-3xl leading-none text-[color:var(--accent)] sm:text-4xl">ОБРАЗ {String(index + 1).padStart(2, "0")}</p>
                  <h2 className="font-display mt-3 text-3xl leading-[0.95] tracking-[-0.04em] sm:text-4xl">{look.title}</h2>
                  <p className="mt-3 text-sm leading-6 text-[color:var(--ink)]/65">{lookProducts.map((product) => product.name).join(" · ")}</p>
                  <p className="font-mono-price mt-4 text-base sm:text-lg">{formatPrice.format(look.totalPrice)} ₸</p>
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
