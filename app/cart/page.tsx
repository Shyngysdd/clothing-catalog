import Link from "next/link";
import { CartPageClient } from "./cart-page-client";

export default function CartPage() {
  return <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-16"><Link href="/catalog" className="inline-flex min-h-11 items-center font-mono-price text-xs tracking-[0.1em] text-[color:var(--accent)]">← В КАТАЛОГ</Link><header className="mt-4 border-b border-[color:var(--ink)]/15 pb-7"><p className="font-mono-price text-xs tracking-[0.16em] text-[color:var(--accent)]">ВАШ ВЫБОР</p><h1 className="font-display mt-3 text-[clamp(2.6rem,8vw,4.5rem)] leading-[0.9] tracking-[-0.04em]">Корзина</h1></header><CartPageClient /></main>;
}
