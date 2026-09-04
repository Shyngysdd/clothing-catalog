import { Link } from "@/i18n/navigation";
import { CartPageClient } from "./cart-page-client";
import { getTranslations } from "next-intl/server";

export default async function CartPage() {
  const cart = await getTranslations("Cart");
  const product = await getTranslations("Product");
  return <main className="cart-page mx-auto max-w-[100rem] px-4 py-10 sm:px-6 sm:py-16 lg:px-10"><Link href="/catalog" className="product-back-link inline-flex min-h-11 items-center font-mono-price text-xs tracking-[0.1em] text-[color:var(--accent)]">{product("back")}</Link><header className="cart-page-header mt-4 border-b border-[color:var(--border)] pb-8 sm:pb-10"><div><p className="font-mono-price text-xs tracking-[0.16em] text-[color:var(--accent)]">{cart("orderSummary")}</p><h1 className="font-display mt-3 text-[clamp(3.4rem,9vw,6.5rem)] leading-[0.8]">{cart("title")}</h1></div><p>{cart("empty")}</p></header><CartPageClient /></main>;
}
