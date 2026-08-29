import Link from "next/link";
import { HomeProductMarquee } from "@/components/home-product-marquee";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function Home() {
  const products = await prisma.product.findMany({ include: { sizes: true }, orderBy: { createdAt: "desc" } });
  const recommendedProducts = products.slice(0, 5);
  const latestProducts = [...products].reverse().slice(0, 5);
  return (
    <main className="w-full">
      <Link
        href="/catalog?category=новинки"
        className="editorial-banner lookbook-media flex min-h-[60svh] cursor-pointer items-end border border-[color:var(--ink)]/15 px-6 py-8 text-[color:var(--white)] sm:px-10 sm:py-12 lg:px-16 lg:py-16"
      >
        <div>
          <p className="font-mono-price text-xs tracking-[0.18em] text-[color:var(--gold)]">КОЛЛЕКЦИЯ / 2026</p>
          <h1 className="font-brand mt-5 max-w-4xl text-[clamp(4.4rem,12vw,10.5rem)] leading-[0.78]">
            Billion.co
          </h1>
          <p className="mt-7 max-w-sm text-sm leading-6 text-[color:var(--white)]/75 sm:text-base">
            Новая глава городского гардероба — строгая, тактильная, личная.
          </p>
        </div>
      </Link>

      <section className="mx-auto max-w-[90rem] px-4 pt-16 sm:px-6 sm:pt-24 lg:px-10">
        <div className="mb-7 flex items-end justify-between gap-4 sm:mb-9">
          <h2 className="font-display text-5xl leading-none tracking-[-0.05em] sm:text-6xl">Рекомендуем</h2>
          <Link href="/catalog" className="font-mono-price mb-1 text-xs tracking-[0.08em] text-[color:var(--accent)]">
            В КАТАЛОГ →
          </Link>
        </div>
        <HomeProductMarquee products={recommendedProducts} />
      </section>

      <section className="grid gap-0 py-16 sm:py-24 lg:grid-cols-2">
        <Link
          href="/catalog?category=женское"
          className="editorial-banner lookbook-media flex min-h-[35svh] cursor-pointer items-end border border-[color:var(--ink)]/15 px-6 py-7 text-[color:var(--white)] sm:px-9 sm:py-10"
        >
          <div>
            <p className="font-mono-price text-xs tracking-[0.16em] text-[color:var(--gold)]">ВЫБОРКА / 01</p>
            <h2 className="font-display mt-3 text-6xl leading-none tracking-[-0.05em] sm:text-7xl">Женское</h2>
          </div>
        </Link>
        <Link
          href="/catalog?category=мужское"
          className="editorial-banner lookbook-media lookbook-media--gold flex min-h-[35svh] cursor-pointer items-end border border-[color:var(--ink)]/15 px-6 py-7 text-[color:var(--white)] sm:px-9 sm:py-10"
        >
          <div>
            <p className="font-mono-price text-xs tracking-[0.16em] text-[color:var(--gold)]">ВЫБОРКА / 02</p>
            <h2 className="font-display mt-3 text-6xl leading-none tracking-[-0.05em] sm:text-7xl">Мужское</h2>
          </div>
        </Link>
      </section>

      <section className="mx-auto max-w-[90rem] px-4 pb-10 sm:px-6 sm:pb-16 lg:px-10">
        <div className="mb-7 flex items-end justify-between gap-4 sm:mb-9">
          <h2 className="font-display text-5xl leading-none tracking-[-0.05em] sm:text-6xl">Новинки</h2>
          <Link href="/catalog?category=новинки" className="font-mono-price mb-1 text-xs tracking-[0.08em] text-[color:var(--accent)]">
            ВСЕ НОВИНКИ →
          </Link>
        </div>
        <HomeProductMarquee products={latestProducts} />
      </section>
    </main>
  );
}
