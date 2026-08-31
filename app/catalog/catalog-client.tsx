"use client";

import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import type { CatalogProduct } from "@/lib/catalog-types";
import { getDiscountPercent } from "@/lib/catalog-types";
import { useFavorites } from "@/context/favorites-context";

const formatPrice = new Intl.NumberFormat("ru-KZ");

function parsePrice(value: string) {
  const digits = value.replace(/\D/g, "");
  return digits ? Number(digits) : null;
}

type SortOption = "default" | "price-asc" | "price-desc" | "newest" | "alphabetical" | "sale";
type GridDensity = "1" | "2";

function CatalogProductPreview({ product, index, isSoldOut, favorite, onToggleFavorite }: { product: CatalogProduct; index: number; isSoldOut: boolean; favorite: boolean; onToggleFavorite: () => void }) {
  const frames = [product.imageUrl, ...product.galleryUrls].filter((imageUrl): imageUrl is string => Boolean(imageUrl));
  const [activeFrame, setActiveFrame] = useState(0);
  const discountPercent = getDiscountPercent(product);

  return (
    <div
      className={`look-product-media aspect-[4/5] transition-[filter,transform] duration-200 ease-out group-hover:scale-[0.985] group-hover:brightness-75 ${isSoldOut ? "grayscale" : ""}`}
      style={{ "--look-tone": index % 2 === 0 ? "var(--accent)" : "var(--gold)", backgroundColor: product.imageColor } as CSSProperties}
      onMouseEnter={() => setActiveFrame(frames.length > 1 ? 1 : 0)}
      onMouseLeave={() => setActiveFrame(0)}
    >
      {frames.map((imageUrl, frameIndex) => <Image key={imageUrl} src={imageUrl} alt="" fill sizes="(max-width: 767px) 50vw, (max-width: 1024px) 50vw, 25vw" className={`look-gallery-frame product-card-photo ${activeFrame === frameIndex ? "is-active" : ""}`} />)}
      <p className="look-product-sizes">РАЗМЕРЫ: {product.sizes.map((size) => size.size).join(" · ")}</p>
      {isSoldOut ? <span className="absolute left-3 top-3 border border-[color:var(--paper)]/50 bg-[color:var(--ink)]/80 px-2 py-1 font-mono-price text-[0.65rem] text-[color:var(--white)]">НЕТ В НАЛИЧИИ</span> : null}
      {discountPercent ? <span className="discount-stamp">−{discountPercent}%</span> : null}
      <button
        type="button"
        onClick={(event) => { event.preventDefault(); event.stopPropagation(); onToggleFavorite(); }}
        className={`absolute right-3 z-10 grid size-9 place-items-center rounded-full bg-[color:var(--paper)]/90 text-[color:var(--ink)] hover:text-[color:var(--accent)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--accent)] ${discountPercent ? "top-20" : "top-3"}`}
        aria-label={favorite ? "Убрать из избранного" : "Добавить в избранное"}
        aria-pressed={favorite}
      >
        <svg aria-hidden="true" viewBox="0 0 24 24" fill={favorite ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" className={`size-5 ${favorite ? "text-[color:var(--accent)]" : ""}`}><path d="M20.8 8.7c0 5-8.8 10.1-8.8 10.1S3.2 13.7 3.2 8.7A4.7 4.7 0 0 1 12 6.4a4.7 4.7 0 0 1 8.8 2.3Z" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </button>
    </div>
  );
}

export function CatalogClient({ products, initialSearch }: { products: CatalogProduct[]; initialSearch: string }) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const searchParams = useSearchParams();
  const requestedCategory = searchParams.get("category");
  const requestedSale = searchParams.get("sale") === "true";
  const productPriceRange = useMemo(() => {
    const prices = products.map((product) => product.price);
    return { min: Math.min(...prices), max: Math.max(...prices) };
  }, [products]);
  const [category, setCategory] = useState(requestedCategory ?? "Все");
  const [saleOnly, setSaleOnly] = useState(requestedSale);
  const [minPrice, setMinPrice] = useState(productPriceRange.min);
  const [maxPrice, setMaxPrice] = useState(productPriceRange.max);
  const [minPriceInput, setMinPriceInput] = useState(String(productPriceRange.min));
  const [maxPriceInput, setMaxPriceInput] = useState(String(productPriceRange.max));
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sort, setSort] = useState<SortOption>("default");
  const [gridDensity, setGridDensity] = useState<GridDensity>("2");
  const [search, setSearch] = useState(initialSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch);

  useEffect(() => {
    const savedDensity = window.localStorage.getItem("catalog-grid-density");
    if (savedDensity === "1" || savedDensity === "2") {
      const frameId = window.requestAnimationFrame(() => setGridDensity(savedDensity));
      return () => window.cancelAnimationFrame(frameId);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem("catalog-grid-density", gridDensity);
  }, [gridDensity]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => window.clearTimeout(timeoutId);
  }, [search]);

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
      (!saleOnly || (product.originalPrice !== null && product.originalPrice > product.price)) &&
      product.price >= minPrice &&
      product.price <= maxPrice &&
      (!debouncedSearch || product.name.toLocaleLowerCase("ru").includes(debouncedSearch.toLocaleLowerCase("ru")) || product.sku.toLocaleLowerCase("ru").includes(debouncedSearch.toLocaleLowerCase("ru"))),
  );
  const sortedProducts = [...filteredProducts].sort((first, second) => {
    if (sort === "price-asc") return first.price - second.price;
    if (sort === "price-desc") return second.price - first.price;
    if (sort === "newest") return new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime();
    if (sort === "alphabetical") return first.name.localeCompare(second.name, "ru");
    if (sort === "sale") {
      const firstOnSale = Number(first.originalPrice !== null && first.originalPrice > first.price);
      const secondOnSale = Number(second.originalPrice !== null && second.originalPrice > second.price);
      return secondOnSale - firstOnSale;
    }
    return 0;
  });
  const filtersActive =
    category !== "Все" ||
    saleOnly ||
    Boolean(debouncedSearch) ||
    minPrice !== productPriceRange.min ||
    maxPrice !== productPriceRange.max;
  const priceFillStart = ((minPrice - productPriceRange.min) / (productPriceRange.max - productPriceRange.min)) * 100;
  const priceFillEnd = ((maxPrice - productPriceRange.min) / (productPriceRange.max - productPriceRange.min)) * 100;
  const priceSliderStyle = {
    "--price-fill-start": `${priceFillStart}%`,
    "--price-fill-end": `${priceFillEnd}%`,
  } as CSSProperties;

  function resetFilters() {
    setCategory("Все");
    setSaleOnly(false);
    setMinPrice(productPriceRange.min);
    setMaxPrice(productPriceRange.max);
    setMinPriceInput(String(productPriceRange.min));
    setMaxPriceInput(String(productPriceRange.max));
    setSearch("");
    setDebouncedSearch("");
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
          <h1 className="font-display mt-3 text-[clamp(2.6rem,8vw,4.5rem)] leading-[0.9] tracking-[-0.04em]">Каталог</h1>
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

          <label className="mt-6 block">
            <span className="text-sm font-medium">Поиск</span>
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Найти товар..." className="mt-2 min-h-11 w-full border border-[color:var(--ink)]/25 bg-[color:var(--paper)] px-3 text-sm outline-none placeholder:text-[color:var(--ink)]/45 focus:border-[color:var(--accent)]" />
          </label>

          <label className="mt-6 block">
            <span className="text-sm font-medium">Сортировка</span>
            <select value={sort} onChange={(event) => setSort(event.target.value as SortOption)} className="mt-2 min-h-11 w-full border border-[color:var(--ink)]/25 bg-[color:var(--paper)] px-3 text-sm outline-none focus:border-[color:var(--accent)]">
              <option value="default">По умолчанию</option>
              <option value="price-asc">Сначала дешёвые</option>
              <option value="price-desc">Сначала дорогие</option>
              <option value="newest">Сначала новинки</option>
              <option value="alphabetical">По алфавиту (А-Я)</option>
              <option value="sale">Сначала со скидкой</option>
            </select>
          </label>

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
                <div className="price-slider-track" aria-hidden="true" />
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
          {debouncedSearch ? <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-[color:var(--ink)]/15 pb-4 text-sm"><p>Результаты по запросу «{debouncedSearch}»: {filteredProducts.length} {filteredProducts.length === 1 ? "товар" : "товаров"}</p><button type="button" onClick={() => { setSearch(""); setDebouncedSearch(""); }} className="text-sm text-[color:var(--accent)] underline underline-offset-4">Сбросить поиск</button></div> : null}
          <div className="mb-5 flex items-center justify-end gap-1 md:hidden" aria-label="Плотность сетки">
            <span className="mr-2 font-mono-price text-[0.65rem] tracking-[0.08em] text-[color:var(--ink)]/55">СЕТКА</span>
            <button
              type="button"
              onClick={() => setGridDensity("1")}
              aria-label="Показывать товары в одну колонку"
              aria-pressed={gridDensity === "1"}
              className={`grid size-9 place-items-center border transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--accent)] ${gridDensity === "1" ? "border-[color:var(--ink)] bg-[color:var(--ink)] text-[color:var(--white)]" : "border-[color:var(--ink)]/25 text-[color:var(--ink)]/60"}`}
            >
              <svg aria-hidden="true" viewBox="0 0 16 16" className="size-4 fill-current"><rect x="2" y="2" width="12" height="12" rx="1" /></svg>
            </button>
            <button
              type="button"
              onClick={() => setGridDensity("2")}
              aria-label="Показывать товары в две колонки"
              aria-pressed={gridDensity === "2"}
              className={`grid size-9 place-items-center border transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--accent)] ${gridDensity === "2" ? "border-[color:var(--ink)] bg-[color:var(--ink)] text-[color:var(--white)]" : "border-[color:var(--ink)]/25 text-[color:var(--ink)]/60"}`}
            >
              <svg aria-hidden="true" viewBox="0 0 16 16" className="size-4 fill-current"><rect x="2" y="2" width="5" height="5" rx="0.5" /><rect x="9" y="2" width="5" height="5" rx="0.5" /><rect x="2" y="9" width="5" height="5" rx="0.5" /><rect x="9" y="9" width="5" height="5" rx="0.5" /></svg>
            </button>
          </div>
          {sortedProducts.length > 0 ? (
            <div data-density={gridDensity === "2" ? "compact" : "comfortable"} className={`catalog-product-grid grid ${gridDensity === "2" ? "grid-cols-2" : "grid-cols-1"} gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`}>
              {sortedProducts.map((product, index) => {
                const isSoldOut = product.sizes.length > 0 && product.sizes.every((size) => !size.inStock);
                return (
                <article key={product.id} className={`look-product-card group relative ${isSoldOut ? "opacity-60" : ""}`}>
                  <Link
                    href={`/catalog/${product.id}`}
                    className="block w-full text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[color:var(--accent)]"
                    aria-label={`Открыть ${product.name}`}
                  >
                    <p className="font-display mb-3 text-3xl leading-none tracking-[-0.04em] text-[color:var(--accent)]">LOOK {String(index + 1).padStart(2, "0")}</p>
                    <CatalogProductPreview product={product} index={index} isSoldOut={isSoldOut} favorite={isFavorite(product.id)} onToggleFavorite={() => toggleFavorite(product.id, product.sizes.find((size) => size.inStock)?.size)} />
                    <div className="catalog-product-info mt-4">
                      <p className="catalog-product-name text-lg font-medium tracking-[-0.02em]">{product.name}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-2"><p className="catalog-product-price font-mono-price text-base text-[color:var(--ink)]">{formatPrice.format(product.price)} ₸</p>{product.originalPrice ? <p className="font-mono-price text-xs text-[color:var(--ink)]/45 line-through">{formatPrice.format(product.originalPrice)} ₸</p> : null}</div>
                    </div>
                  </Link>
                </article>
                );
              })}
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
