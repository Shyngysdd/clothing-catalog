"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import type { Product } from "@/data/products";

const formatPrice = new Intl.NumberFormat("ru-KZ");

function parsePrice(value: string) {
  const digits = value.replace(/\D/g, "");
  return digits ? Number(digits) : null;
}

export function CatalogClient({ products }: { products: Product[] }) {
  const productPriceRange = useMemo(() => {
    const prices = products.map((product) => product.price);
    return { min: Math.min(...prices), max: Math.max(...prices) };
  }, [products]);
  const [category, setCategory] = useState("Все");
  const [minPrice, setMinPrice] = useState(productPriceRange.min);
  const [maxPrice, setMaxPrice] = useState(productPriceRange.max);
  const [minPriceInput, setMinPriceInput] = useState(String(productPriceRange.min));
  const [maxPriceInput, setMaxPriceInput] = useState(String(productPriceRange.max));
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const parsedValue = parsePrice(minPriceInput);
      if (parsedValue === null) return;

      const nextMinPrice = Math.min(
        Math.max(parsedValue, productPriceRange.min),
        maxPrice,
      );
      setMinPrice(nextMinPrice);
    }, 300);

    return () => window.clearTimeout(timeoutId);
  }, [minPriceInput, maxPrice, productPriceRange.min]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const parsedValue = parsePrice(maxPriceInput);
      if (parsedValue === null) return;

      const nextMaxPrice = Math.max(
        Math.min(parsedValue, productPriceRange.max),
        minPrice,
      );
      setMaxPrice(nextMaxPrice);
    }, 300);

    return () => window.clearTimeout(timeoutId);
  }, [maxPriceInput, minPrice, productPriceRange.max]);

  const categories = ["Все", ...new Set(products.map((product) => product.category))];
  const filteredProducts = products.filter(
    (product) =>
      (category === "Все" || product.category === category) &&
      product.price >= minPrice &&
      product.price <= maxPrice,
  );
  const filtersActive =
    category !== "Все" ||
    minPrice !== productPriceRange.min ||
    maxPrice !== productPriceRange.max;
  const priceFillStart = ((minPrice - productPriceRange.min) / (productPriceRange.max - productPriceRange.min)) * 100;
  const priceFillEnd = ((maxPrice - productPriceRange.min) / (productPriceRange.max - productPriceRange.min)) * 100;
  const priceSliderStyle = {
    background: `linear-gradient(to right, var(--paper) ${priceFillStart}%, var(--accent) ${priceFillStart}%, var(--accent) ${priceFillEnd}%, var(--paper) ${priceFillEnd}%)`,
  };

  function resetFilters() {
    setCategory("Все");
    setMinPrice(productPriceRange.min);
    setMaxPrice(productPriceRange.max);
    setMinPriceInput(String(productPriceRange.min));
    setMaxPriceInput(String(productPriceRange.max));
  }

  function handleMinSliderChange(nextMinPrice: number) {
    const boundedMinPrice = Math.min(nextMinPrice, maxPrice);
    setMinPrice(boundedMinPrice);
    setMinPriceInput(String(boundedMinPrice));
  }

  function handleMaxSliderChange(nextMaxPrice: number) {
    const boundedMaxPrice = Math.max(nextMaxPrice, minPrice);
    setMaxPrice(boundedMaxPrice);
    setMaxPriceInput(String(boundedMaxPrice));
  }

  return (
    <section className="mx-auto max-w-[90rem] px-4 py-10 sm:px-6 sm:py-16 lg:px-10">
      <div className="mb-10 flex items-end justify-between gap-4 border-b border-[color:var(--ink)]/15 pb-8 sm:mb-14">
        <div>
          <p className="font-mono-price text-xs tracking-[0.16em] text-[color:var(--accent)]">ВЫБОРКА / 2026</p>
          <h1 className="font-display mt-3 text-5xl leading-none tracking-[-0.04em] sm:text-7xl">Каталог</h1>
          <p className="mt-4 text-sm text-[color:var(--ink)]/60">
            Найдено: {filteredProducts.length}
          </p>
        </div>
        <button
          type="button"
          className="inline-flex min-h-11 items-center border border-[color:var(--ink)]/45 px-4 text-sm font-medium hover:border-[color:var(--accent)] hover:text-[color:var(--accent)] md:hidden"
          aria-expanded={filtersOpen}
          aria-controls="catalog-filters"
          onClick={() => setFiltersOpen((isOpen) => !isOpen)}
        >
          Фильтры
        </button>
      </div>

      <div className="flex flex-col gap-8 md:flex-row">
        <aside
          id="catalog-filters"
          className={`${filtersOpen ? "block" : "hidden"} shrink-0 border-b border-[color:var(--ink)]/15 pb-8 md:block md:w-60 md:border-b-0 md:border-r md:pb-0 md:pr-8`}
        >
          <div className="flex items-center justify-between">
            <h2 className="font-mono-price text-xs tracking-[0.16em] text-[color:var(--ink)]/70">ФИЛЬТРЫ</h2>
            {filtersActive ? (
              <button
                type="button"
                onClick={resetFilters}
                className="text-sm text-[color:var(--ink)]/60 underline underline-offset-4 hover:text-[color:var(--accent)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--accent)]"
              >
                Сбросить
              </button>
            ) : null}
          </div>

          <fieldset className="mt-6">
            <legend className="text-sm font-medium">Категория</legend>
            <div className="mt-3 space-y-3">
              {categories.map((item) => (
                <label key={item} className="flex cursor-pointer items-center gap-3 text-sm text-[color:var(--ink)]/75">
                  <input
                    type="radio"
                    name="category"
                    value={item}
                    checked={category === item}
                    onChange={() => setCategory(item)}
                    className="size-4 accent-[color:var(--accent)]"
                  />
                  {item}
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset className="mt-7">
            <legend className="text-sm font-medium">Цена</legend>
            <div className="mt-4">
              <div className="price-slider" style={priceSliderStyle}>
                <input
                  aria-label="Минимальная цена"
                  type="range"
                  min={productPriceRange.min}
                  max={productPriceRange.max}
                  value={minPrice}
                  onChange={(event) => handleMinSliderChange(Number(event.target.value))}
                />
                <input
                  aria-label="Максимальная цена"
                  type="range"
                  min={productPriceRange.min}
                  max={productPriceRange.max}
                  value={maxPrice}
                  onChange={(event) => handleMaxSliderChange(Number(event.target.value))}
                />
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <label className="min-w-0">
                  <span className="text-xs text-zinc-500">от</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={minPriceInput}
                    onChange={(event) => setMinPriceInput(event.target.value)}
                    className="mt-1 min-h-10 w-full border border-[color:var(--ink)]/25 bg-transparent px-2 text-sm tabular-nums outline-none focus:border-[color:var(--accent)]"
                    aria-label="Цена от"
                  />
                </label>
                <label className="min-w-0">
                  <span className="text-xs text-zinc-500">до</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={maxPriceInput}
                    onChange={(event) => setMaxPriceInput(event.target.value)}
                    className="mt-1 min-h-10 w-full border border-[color:var(--ink)]/25 bg-transparent px-2 text-sm tabular-nums outline-none focus:border-[color:var(--accent)]"
                    aria-label="Цена до"
                  />
                </label>
              </div>
              <p className="price-range-readout mt-3 text-xs text-[color:var(--ink)]/55">
                {formatPrice.format(minPrice)} ₸ — {formatPrice.format(maxPrice)} ₸
              </p>
            </div>
          </fieldset>
        </aside>

        <div className="min-w-0 flex-1">
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredProducts.map((product, index) => (
                <article key={product.id} className="look-product-card group">
                  <Link
                    href={`/catalog/${product.id}`}
                    className="block w-full text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[color:var(--accent)]"
                    aria-label={`Открыть ${product.name}`}
                  >
                    <p className="font-display mb-3 text-3xl leading-none tracking-[-0.04em] text-[color:var(--accent)]">LOOK {String(index + 1).padStart(2, "0")}</p>
                    <div
                      className="look-product-media aspect-[4/5] transition-[filter,transform] duration-200 ease-out group-hover:scale-[0.985] group-hover:brightness-75"
                      style={{ "--look-tone": index % 2 === 0 ? "var(--accent)" : "var(--gold)" } as CSSProperties}
                    >
                      <p className="look-product-sizes">РАЗМЕРЫ: {product.sizes.join(" · ")}</p>
                    </div>
                    <div className="mt-4">
                      <p className="text-lg font-medium tracking-[-0.02em]">{product.name}</p>
                      <p className="font-mono-price mt-2 text-base text-[color:var(--ink)]">{formatPrice.format(product.price)} ₸</p>
                    </div>
                  </Link>
                </article>
              ))}
            </div>
          ) : (
            <div className="border border-dashed border-[color:var(--ink)]/30 px-6 py-12 text-center">
              <p className="font-medium">Ничего не найдено</p>
              <button
                type="button"
                onClick={resetFilters}
                className="mt-3 text-sm underline underline-offset-4 hover:text-[color:var(--accent)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--accent)]"
              >
                Сбросить фильтры
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
