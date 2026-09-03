"use client";

import { useEffect, useMemo, useState } from "react";
import { HomeProductMarquee } from "@/components/home-product-marquee";
import type { CatalogProduct } from "@/lib/catalog-types";

const RECENTLY_VIEWED_KEY = "recently-viewed";

function getRecentlyViewedIds() {
  try {
    const storedValue = localStorage.getItem(RECENTLY_VIEWED_KEY);
    const parsedValue: unknown = storedValue ? JSON.parse(storedValue) : [];
    if (!Array.isArray(parsedValue)) return [];

    const uniqueIds = new Set<string>();
    return parsedValue.filter((id): id is string => {
      if (typeof id !== "string" || uniqueIds.has(id)) return false;
      uniqueIds.add(id);
      return true;
    }).slice(0, 12);
  } catch {
    return [];
  }
}

export function RecentlyViewed({ allProducts, disableAnimationForSmallSelection = false }: { allProducts: CatalogProduct[]; disableAnimationForSmallSelection?: boolean }) {
  const [recentIds, setRecentIds] = useState<string[]>([]);

  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => setRecentIds(getRecentlyViewedIds()));
    return () => window.cancelAnimationFrame(frameId);
  }, []);

  const products = useMemo(() => {
    const productsById = new Map(allProducts.map((product) => [product.id, product]));
    return recentIds.flatMap((id) => {
      const product = productsById.get(id);
      return product ? [product] : [];
    });
  }, [allProducts, recentIds]);

  if (products.length === 0) return null;

  return (
    <section className={`mx-auto max-w-[90rem] px-4 pt-16 sm:px-6 sm:pt-24 lg:px-10 ${disableAnimationForSmallSelection && products.length <= 2 ? "recently-viewed--static" : ""}`}>
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4 border-b border-[color:var(--ink)]/15 pb-5 sm:mb-9"><div><p className="font-mono-price text-[0.6rem] tracking-[0.14em] text-[color:var(--accent)]">ВАШ АРХИВ</p><h2 className="font-display mt-3 text-[clamp(2.4rem,7vw,3.75rem)] leading-[0.85]">Вы недавно смотрели</h2></div><span className="font-mono-price text-[0.6rem] tracking-[0.1em] text-[color:var(--ink)]/50">{String(products.length).padStart(2, "0")} ВЕЩЕЙ</span></div>
      <HomeProductMarquee products={products} />
    </section>
  );
}
