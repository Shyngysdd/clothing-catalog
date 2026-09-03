"use client";

import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, PointerEvent } from "react";
import type { CatalogProduct } from "@/lib/catalog-types";
import { getDiscountPercent } from "@/lib/catalog-types";
import { useFavorites } from "@/context/favorites-context";
import { useSwipeGallery } from "@/hooks/use-swipe-gallery";

const formatPrice = new Intl.NumberFormat("ru-KZ");

function parsePrice(value: string) {
  const digits = value.replace(/\D/g, "");
  return digits ? Number(digits) : null;
}

type SortOption = "default" | "price-asc" | "price-desc" | "newest" | "alphabetical" | "sale";
type GridDensity = "1" | "2";

const sortOptions: Array<{ value: SortOption; label: string }> = [
  { value: "default", label: "По умолчанию" },
  { value: "price-asc", label: "Сначала дешёвые" },
  { value: "price-desc", label: "Сначала дорогие" },
  { value: "newest", label: "Сначала новинки" },
  { value: "alphabetical", label: "По алфавиту (А–Я)" },
  { value: "sale", label: "Сначала со скидкой" },
];

function CatalogProductPreview({ product, index, isSoldOut }: { product: CatalogProduct; index: number; isSoldOut: boolean }) {
  const frames = [product.imageUrl, ...product.galleryUrls].filter((imageUrl): imageUrl is string => Boolean(imageUrl));
  const [activeFrame, setActiveFrame] = useState(0);
  const swipeGallery = useSwipeGallery({ frameCount: frames.length, setActiveFrame });
  const discountPercent = getDiscountPercent(product);

  return (
    <div
      className="look-product-media aspect-[4/5]"
      style={(product.imageUrl
        ? { background: "var(--white)" }
        : { "--look-tone": index % 2 === 0 ? "var(--accent)" : "var(--gold)", backgroundColor: product.imageColor }) as CSSProperties}
      onMouseEnter={() => setActiveFrame(frames.length > 1 ? 1 : 0)}
      onMouseLeave={() => setActiveFrame(0)}
      {...swipeGallery}
    >
      <div className={`look-product-photo-layer ${isSoldOut ? "grayscale" : ""}`}>{frames.map((imageUrl, frameIndex) => <div key={imageUrl} className={`look-gallery-frame ${activeFrame === frameIndex ? "is-active" : ""}`}><Image src={imageUrl} alt="" fill sizes="(max-width: 767px) 50vw, (max-width: 1024px) 50vw, 25vw" className="product-card-photo" /></div>)}</div>
      <p className="look-product-sizes">РАЗМЕРЫ: {product.sizes.map((size) => size.size).join(" · ")}</p>
      {isSoldOut ? <span className="absolute right-3 top-3 border border-[color:var(--paper)]/50 bg-[color:var(--ink)]/80 px-2 py-1 font-mono-price text-[0.65rem] text-[color:var(--white)]">НЕТ В НАЛИЧИИ</span> : null}
      {discountPercent ? <span className="discount-stamp">−{discountPercent}%</span> : null}
      {frames.length > 1 ? <span className="look-gallery-dots absolute left-1/2 z-[3] flex -translate-x-1/2 gap-1" aria-hidden="true">{frames.map((_, frameIndex) => <i key={frameIndex} className={`block size-1.5 rounded-full border border-[color:var(--paper)]/70 ${activeFrame === frameIndex ? "bg-[color:var(--paper)]" : "bg-transparent"}`} />)}</span> : null}
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
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [gridDensity, setGridDensity] = useState<GridDensity>("2");
  const [search, setSearch] = useState(initialSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch);
  const priceSliderRef = useRef<HTMLDivElement>(null);
  const activePriceHandleRef = useRef<"min" | "max" | null>(null);

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
    "--price-min-position": `${priceFillStart}%`,
    "--price-max-position": `${priceFillEnd}%`,
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

  function getPriceFromPointer(clientX: number) {
    const slider = priceSliderRef.current;
    if (!slider) return null;
    const bounds = slider.getBoundingClientRect();
    const percent = Math.min(1, Math.max(0, (clientX - bounds.left) / bounds.width));
    return Math.round(productPriceRange.min + percent * (productPriceRange.max - productPriceRange.min));
  }

  function updatePriceFromPointer(clientX: number, handle: "min" | "max") {
    const nextValue = getPriceFromPointer(clientX);
    if (nextValue === null) return;
    if (handle === "min") handleMinSliderChange(nextValue);
    else handleMaxSliderChange(nextValue);
  }

  function handlePricePointerDown(event: PointerEvent<HTMLDivElement>) {
    event.preventDefault();
    const nextValue = getPriceFromPointer(event.clientX);
    if (nextValue === null) return;
    activePriceHandleRef.current = Math.abs(nextValue - minPrice) <= Math.abs(nextValue - maxPrice) ? "min" : "max";
    event.currentTarget.setPointerCapture(event.pointerId);
    updatePriceFromPointer(event.clientX, activePriceHandleRef.current);
  }

  function handlePricePointerMove(event: PointerEvent<HTMLDivElement>) {
    const handle = activePriceHandleRef.current;
    if (!handle || !event.currentTarget.hasPointerCapture(event.pointerId)) return;
    updatePriceFromPointer(event.clientX, handle);
  }

  function handlePricePointerEnd(event: PointerEvent<HTMLDivElement>) {
    activePriceHandleRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  }

  return (
    <section className="catalog-page px-4 py-10 sm:px-6 sm:py-16 lg:px-10">
      <div className="catalog-page-header mb-10 border-b border-[color:var(--ink)]/20 pb-8 sm:mb-14 sm:pb-10">
        <div>
          <p className="font-mono-price text-xs tracking-[0.16em] text-[color:var(--accent)]">ВЫБОРКА / 2026</p>
          <h1 className="font-display mt-3 text-[clamp(3.2rem,9vw,6.5rem)] leading-[0.8]">Каталог</h1>
          <p className="mt-4 text-sm text-[color:var(--ink)]/60">
            Найдено: {filteredProducts.length}
          </p>
          <p className="catalog-page-note">Собранная выборка вещей для повседневного города. Открывайте карточку, чтобы увидеть материалы, размеры и все кадры.</p>
        </div>
        <button
          type="button"
          className="catalog-filter-trigger inline-flex min-h-11 items-center border border-[color:var(--ink)]/45 px-4 text-sm font-medium hover:border-[color:var(--accent)] hover:text-[color:var(--accent)] md:hidden"
          aria-expanded={filtersOpen}
          aria-controls="catalog-filters"
          onClick={() => setFiltersOpen((isOpen) => !isOpen)}
        >
          Фильтры
        </button>
      </div>

      <div className="catalog-page-layout flex flex-col gap-8 md:flex-row">
        <aside
          id="catalog-filters"
          className={`${filtersOpen ? "block" : "hidden"} catalog-filter-panel shrink-0 border-b border-[color:var(--ink)]/15 pb-8 md:block md:w-60 md:border-b-0 md:border-r md:pb-0 md:pr-8`}
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

          <div className="mt-6">
            <p className="text-sm font-medium">Сортировка</p>
            <div className="catalog-sort-control relative mt-2">
              <button type="button" onClick={() => setIsSortOpen((isOpen) => !isOpen)} aria-haspopup="listbox" aria-expanded={isSortOpen} className="flex min-h-11 w-full items-center justify-between border border-[color:var(--ink)]/25 bg-transparent px-3 text-left text-sm transition-colors hover:border-[color:var(--accent)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--accent)]"><span>{sortOptions.find((option) => option.value === sort)?.label}</span><svg aria-hidden="true" viewBox="0 0 16 16" className={`size-4 transition-transform ${isSortOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="1.6"><path d="m3 5.5 5 5 5-5" /></svg></button>
              {isSortOpen ? <div role="listbox" aria-label="Сортировка товаров" className="absolute left-0 right-0 top-[calc(100%+0.35rem)] z-20 border border-[color:var(--ink)]/25 bg-[color:var(--paper)] p-1">{sortOptions.map((option) => <button key={option.value} type="button" role="option" aria-selected={sort === option.value} onClick={() => { setSort(option.value); setIsSortOpen(false); }} className={`flex min-h-10 w-full items-center px-3 text-left text-sm transition-colors ${sort === option.value ? "bg-[color:var(--ink)] text-[color:var(--white)]" : "hover:bg-[color:var(--ink)]/8 hover:text-[color:var(--accent)]"}`}>{option.label}</button>)}</div> : null}
            </div>
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
                    className="category-filter-radio size-4"
                  />
                  {item}
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset className="mt-7">
            <legend className="text-sm font-medium">Цена</legend>
            <div className="price-range-panel mt-5">
              <div className="price-slider-summary grid grid-cols-2 gap-3" aria-live="polite">
                <p><span>ОТ</span><strong>{formatPrice.format(minPrice)} ₸</strong></p>
                <p><span>ДО</span><strong>{formatPrice.format(maxPrice)} ₸</strong></p>
              </div>
              <div ref={priceSliderRef} className="price-slider" style={priceSliderStyle} onPointerDown={handlePricePointerDown} onPointerMove={handlePricePointerMove} onPointerUp={handlePricePointerEnd} onPointerCancel={handlePricePointerEnd}>
                <div className="price-slider-track" aria-hidden="true" />
                <span className="price-slider-handle price-slider-handle--min" aria-hidden="true" />
                <span className="price-slider-handle price-slider-handle--max" aria-hidden="true" />
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <label className="min-w-0">
                  <span className="font-mono-price text-[0.6rem] tracking-[0.1em] text-[color:var(--ink)]/55">МИНИМУМ</span>
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
                  <span className="font-mono-price text-[0.6rem] tracking-[0.1em] text-[color:var(--ink)]/55">МАКСИМУМ</span>
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
            </div>
          </fieldset>
        </aside>

        <div className="catalog-results min-w-0 flex-1">
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
            <div data-density={gridDensity === "2" ? "compact" : "comfortable"} className={`catalog-product-grid grid items-stretch ${gridDensity === "2" ? "grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"} gap-x-6 gap-y-12`}>
              {sortedProducts.map((product, index) => {
                const isSoldOut = product.sizes.length > 0 && product.sizes.every((size) => !size.inStock);
                return (
                <article key={product.id} className={`look-product-card group relative flex h-full flex-col ${isSoldOut ? "opacity-60" : ""}`}>
                  <Link
                    href={`/catalog/${product.id}`}
                    className="flex h-full w-full flex-col text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[color:var(--accent)]"
                    aria-label={`Открыть ${product.name}`}
                  >
                    <p className="product-card-kicker font-mono-price mb-3 text-[0.62rem] tracking-[0.13em] text-[color:var(--accent)]">АРТИКУЛ / {product.sku}</p>
                    <CatalogProductPreview product={product} index={index} isSoldOut={isSoldOut} />
                    <div className="catalog-product-info mt-4 flex min-h-[5.45rem] flex-1 flex-col sm:min-h-[6.4rem]">
                      <p className="font-mono-price text-[0.65rem] tracking-[0.12em] text-[color:var(--accent)]">{product.brand.toUpperCase()}</p>
                      <p className="catalog-product-name mt-1 line-clamp-2 min-h-[2.1rem] text-lg font-medium leading-[1.2] tracking-[-0.02em] sm:min-h-[2.7rem]">{product.name}</p>
                      <div className="mt-2 min-h-[2.5rem] sm:min-h-[2.75rem]"><p className="catalog-product-price font-mono-price text-base text-[color:var(--ink)]">{formatPrice.format(product.price)} ₸</p>{product.originalPrice ? <p className="mt-0.5 font-mono-price text-xs text-[color:var(--ink)]/45 line-through">{formatPrice.format(product.originalPrice)} ₸</p> : null}</div>
                    </div>
                  </Link>
                  <button type="button" onClick={() => toggleFavorite(product.id, product.sizes.find((size) => size.inStock)?.size)} className="absolute right-3 top-12 z-10 grid size-9 place-items-center rounded-full bg-[color:var(--paper)]/90 text-[color:var(--ink)] hover:text-[color:var(--accent)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--accent)]" aria-label={isFavorite(product.id) ? "Убрать из избранного" : "Добавить в избранное"} aria-pressed={isFavorite(product.id)}><svg aria-hidden="true" viewBox="0 0 24 24" fill={isFavorite(product.id) ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" className={`size-5 ${isFavorite(product.id) ? "text-[color:var(--accent)]" : ""}`}><path d="M20.8 8.7c0 5-8.8 10.1-8.8 10.1S3.2 13.7 3.2 8.7A4.7 4.7 0 0 1 12 6.4a4.7 4.7 0 0 1 8.8 2.3Z" strokeLinecap="round" strokeLinejoin="round" /></svg></button>
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
