import type { CSSProperties } from "react";
import Link from "next/link";

import type { Product } from "@/data/products";
import { products } from "@/data/products";

const recommendedProducts = products.slice(0, 5);
const latestProducts = [...products].sort((a, b) => b.id - a.id).slice(0, 5);

function formatPrice(price: number) {
  return new Intl.NumberFormat("ru-RU").format(price) + " ₸";
}

function ProductMarquee({ products: selection }: { products: Product[] }) {
  const loopedProducts = [...selection, ...selection];

  return (
    <div className="home-product-marquee">
      <div className="home-product-track">
        {loopedProducts.map((product, index) => (
          <Link
            key={`${product.id}-${index}`}
            href={`/catalog`}
            className="home-look-card look-product-card group block"
            aria-label={`Открыть товар: ${product.name}`}
          >
            <p className="look-number mb-3 text-3xl text-[color:var(--ink)] sm:text-4xl">
              LOOK {String((index % selection.length) + 1).padStart(2, "0")}
            </p>
            <div
              className="look-product-media aspect-[4/5] transition-[filter,transform] duration-200 ease-out group-hover:scale-[0.985] group-hover:brightness-75"
              style={{
                "--look-tone": index % 2 === 0 ? "var(--accent)" : "var(--gold)",
              } as CSSProperties}
            >
              <p className="look-product-sizes">РАЗМЕРЫ: {product.sizes.join(" · ")}</p>
            </div>
            <div className="mt-4 flex items-start justify-between gap-3">
              <h3 className="text-sm font-medium leading-5 sm:text-base">{product.name}</h3>
              <p className="font-mono-price shrink-0 text-sm">{formatPrice(product.price)}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-[90rem] px-4 py-4 sm:px-6 sm:py-6 lg:px-10 lg:py-10">
      <Link
        href="/catalog?category=новинки"
        className="editorial-banner lookbook-media flex min-h-[60svh] cursor-pointer items-end border border-[color:var(--ink)]/15 px-6 py-8 text-[color:var(--white)] sm:px-10 sm:py-12 lg:px-16 lg:py-16"
      >
        <div>
          <p className="font-mono-price text-xs tracking-[0.18em] text-[color:var(--gold)]">КОЛЛЕКЦИЯ / 2026</p>
          <h1 className="font-display mt-5 max-w-4xl text-[clamp(4.4rem,12vw,10.5rem)] font-medium leading-[0.78] tracking-[-0.07em]">
            название<br />магазина
          </h1>
          <p className="mt-7 max-w-sm text-sm leading-6 text-[color:var(--white)]/75 sm:text-base">
            Новая глава городского гардероба — строгая, тактильная, личная.
          </p>
        </div>
      </Link>

      <section className="pt-16 sm:pt-24">
        <div className="mb-7 flex items-end justify-between gap-4 sm:mb-9">
          <h2 className="font-display text-5xl leading-none tracking-[-0.05em] sm:text-6xl">Рекомендуем</h2>
          <Link href="/catalog" className="font-mono-price mb-1 text-xs tracking-[0.08em] text-[color:var(--accent)]">
            В КАТАЛОГ →
          </Link>
        </div>
        <ProductMarquee products={recommendedProducts} />
      </section>

      <section className="grid gap-4 py-16 sm:gap-6 sm:py-24 lg:grid-cols-2">
        <Link
          href="/catalog?category=женское"
          className="editorial-banner lookbook-media flex min-h-[35svh] cursor-pointer items-end border border-[color:var(--ink)]/15 px-6 py-7 text-[color:var(--white)] sm:px-9 sm:py-10"
        >
          <div>
            <p className="font-mono-price text-xs tracking-[0.16em] text-[color:var(--gold)]">ВЫБОРКА / 01</p>
            <h2 className="font-display mt-3 text-6xl leading-none tracking-[-0.05em] sm:text-7xl">Женское</h2>
          </div>
        </Link>
        <Link
          href="/catalog?category=мужское"
          className="editorial-banner lookbook-media lookbook-media--gold flex min-h-[35svh] cursor-pointer items-end border border-[color:var(--ink)]/15 px-6 py-7 text-[color:var(--white)] sm:px-9 sm:py-10"
        >
          <div>
            <p className="font-mono-price text-xs tracking-[0.16em] text-[color:var(--gold)]">ВЫБОРКА / 02</p>
            <h2 className="font-display mt-3 text-6xl leading-none tracking-[-0.05em] sm:text-7xl">Мужское</h2>
          </div>
        </Link>
      </section>

      <section className="pb-10 sm:pb-16">
        <div className="mb-7 flex items-end justify-between gap-4 sm:mb-9">
          <h2 className="font-display text-5xl leading-none tracking-[-0.05em] sm:text-6xl">Новинки</h2>
          <Link href="/catalog?category=новинки" className="font-mono-price mb-1 text-xs tracking-[0.08em] text-[color:var(--accent)]">
            ВСЕ НОВИНКИ →
          </Link>
        </div>
        <ProductMarquee products={latestProducts} />
      </section>
    </main>
  );
}
