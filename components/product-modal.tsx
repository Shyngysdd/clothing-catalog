"use client";

import { useState } from "react";
import type { Product } from "@/data/products";
import { useCart } from "@/context/cart-context";
import { OverlayPanel } from "./overlay-panel";

const formatPrice = new Intl.NumberFormat("ru-KZ");

export function ProductModal({ product, onClose }: { product: Product; onClose: () => void }) {
  const [selectedSize, setSelectedSize] = useState(product.sizes[0]);
  const { addItem } = useCart();

  function addToCart() {
    addItem(product, selectedSize);
    onClose();
  }

  return (
    <OverlayPanel labelledBy="product-dialog-title" onClose={onClose}>
      <div className="flex items-start justify-between gap-6">
        <div>
          <p className="text-sm text-zinc-500">{product.category}</p>
          <h2 id="product-dialog-title" className="mt-1 text-2xl font-semibold tracking-tight">
            {product.name}
          </h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="-mr-2 -mt-2 grid size-11 shrink-0 place-items-center rounded-lg text-xl text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900"
          aria-label="Закрыть"
        >
          ×
        </button>
      </div>
      <div className="mt-6 aspect-[4/3] rounded-lg" style={{ backgroundColor: product.imageColor }} />
      <p className="mt-5 text-lg font-medium">{formatPrice.format(product.price)} ₸</p>
      <fieldset className="mt-6">
        <legend className="text-sm font-medium">Выберите размер</legend>
        <div className="mt-3 flex flex-wrap gap-2">
          {product.sizes.map((size) => (
            <button
              key={size}
              type="button"
              onClick={() => setSelectedSize(size)}
              aria-pressed={selectedSize === size}
              className={`min-h-11 min-w-11 rounded-lg border px-3 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 ${selectedSize === size ? "border-zinc-900 bg-zinc-900 text-white" : "border-zinc-300 hover:border-zinc-900"}`}
            >
              {size}
            </button>
          ))}
        </div>
      </fieldset>
      <button
        type="button"
        onClick={addToCart}
        className="mt-8 flex min-h-12 w-full items-center justify-center rounded-lg bg-zinc-900 px-5 text-sm font-medium text-white hover:bg-zinc-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900"
      >
        В корзину
      </button>
    </OverlayPanel>
  );
}
