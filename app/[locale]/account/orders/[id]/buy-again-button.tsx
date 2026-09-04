"use client";

import { useState } from "react";
import { useCart } from "@/context/cart-context";
import type { CatalogProduct } from "@/lib/catalog-types";

type RepeatItem = {
  product: CatalogProduct;
  size: string;
  quantity: number;
};

export function BuyAgainButton({ items, unavailableItemCount }: { items: RepeatItem[]; unavailableItemCount: number }) {
  const { addItem, openDrawer } = useCart();
  const [wasAdded, setWasAdded] = useState(false);

  function handleBuyAgain() {
    items.forEach((item) => {
      for (let index = 0; index < item.quantity; index += 1) {
        addItem(item.product, item.size);
      }
    });
    setWasAdded(true);
    openDrawer();
  }

  if (items.length === 0) {
    return <p className="text-sm leading-6 text-[color:var(--ink)]/60">Эти товары больше недоступны для повторного заказа.</p>;
  }

  return <div>
    <button type="button" onClick={handleBuyAgain} className="flex min-h-12 w-full items-center justify-center bg-[color:var(--ink)] px-5 text-sm font-medium text-[color:var(--white)] transition-colors hover:bg-[color:var(--accent)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--accent)]">Купить снова</button>
    <div className="mt-3 space-y-1" aria-live="polite">
      {wasAdded ? <p className="text-sm text-[color:var(--accent)]">Добавлено в корзину.</p> : null}
      {unavailableItemCount > 0 ? <p className="text-sm leading-6 text-[color:var(--ink)]/60">Некоторые товары больше недоступны.</p> : null}
    </div>
  </div>;
}
