import Link from "next/link";
import { CartPageClient } from "./cart-page-client";

export default function CartPage() {
  return <main className="cart-page mx-auto max-w-[100rem] px-4 py-10 sm:px-6 sm:py-16 lg:px-10"><Link href="/catalog" className="product-back-link inline-flex min-h-11 items-center font-mono-price text-xs tracking-[0.1em] text-[color:var(--accent)]">← В КАТАЛОГ</Link><header className="cart-page-header mt-4 border-b border-[color:var(--ink)]/20 pb-8 sm:pb-10"><div><p className="font-mono-price text-xs tracking-[0.16em] text-[color:var(--accent)]">ВАШ ВЫБОР</p><h1 className="font-display mt-3 text-[clamp(3.4rem,9vw,6.5rem)] leading-[0.8]">Корзина</h1></div><p>Собранные вещи останутся здесь, пока вы не будете готовы оформить заказ.</p></header><CartPageClient /></main>;
}
