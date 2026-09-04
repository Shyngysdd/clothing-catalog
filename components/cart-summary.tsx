"use client";

import type { CatalogProduct } from "@/lib/catalog-types";
import { useTranslations } from "next-intl";

const formatPrice = new Intl.NumberFormat("ru-KZ");

export type CartSummaryItem = Pick<CatalogProduct, "price" | "originalPrice"> & { quantity: number };

export function getCartSummary(items: CartSummaryItem[]) {
  return items.reduce(
    (summary, item) => {
      const savingsPerItem = item.originalPrice && item.originalPrice > item.price ? item.originalPrice - item.price : 0;
      return {
        itemCount: summary.itemCount + item.quantity,
        itemsTotal: summary.itemsTotal + item.price * item.quantity,
        savings: summary.savings + savingsPerItem * item.quantity,
      };
    },
    { itemCount: 0, itemsTotal: 0, savings: 0 },
  );
}

export function CartSummary({ items }: { items: CartSummaryItem[] }) {
  const t = useTranslations("Cart");
  const { itemCount, itemsTotal, savings } = getCartSummary(items);

  return <div className="space-y-3" aria-label={t("summary")}><div className="flex items-center justify-between gap-4 text-sm"><span className="text-[color:var(--ink)]/65">{t("items", {count: itemCount})}</span><span className="font-mono-price">{formatPrice.format(itemsTotal)} ₸</span></div>{savings > 0 ? <div className="flex items-center justify-between gap-4 text-sm text-[color:var(--accent)]"><span>{t("discount")}</span><span className="font-mono-price">−{formatPrice.format(savings)} ₸</span></div> : null}<div className="flex items-center justify-between gap-4 border-t border-[color:var(--border)] pt-4"><span className="font-display text-3xl leading-none">{t("payTotal")}</span><span className="font-mono-price text-lg">{formatPrice.format(itemsTotal)} ₸</span></div></div>;
}
