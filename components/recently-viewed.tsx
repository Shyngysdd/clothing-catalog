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

export function RecentlyViewed({ allProducts }: { allProducts: CatalogProduct[] }) {
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
    <section className="mx-auto max-w-[90rem] px-4 pt-16 sm:px-6 sm:pt-24 lg:px-10">
      <h2 className="font-display mb-7 text-[clamp(2.4rem,7vw,3.75rem)] leading-[0.9] tracking-[-0.05em] sm:mb-9">Вы недавно смотрели</h2>
      <HomeProductMarquee products={products} />
    </section>
  );
}
