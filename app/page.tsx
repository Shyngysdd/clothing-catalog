import Image from "next/image";
import Link from "next/link";
import { HomeProductMarquee } from "@/components/home-product-marquee";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const bannerFallbacks = {
  hero: { title: "Billion.co", subtitle: "Новая глава городского гардероба — строгая, тактильная, личная.", linkUrl: "/catalog?category=новинки", imageUrl: null },
  "category-1": { title: "Ветровки", subtitle: "ВЫБОРКА / 01", linkUrl: "/catalog?category=Ветровки", imageUrl: null },
  "category-2": { title: "Обувь", subtitle: "ВЫБОРКА / 02", linkUrl: "/catalog?category=Обувь", imageUrl: null },
};

function BannerBackground({ imageUrl }: { imageUrl: string | null }) {
  if (!imageUrl) return null;
  return <div className="editorial-banner-image absolute inset-0"><Image src={imageUrl} alt="" fill sizes="100vw" className="object-cover" /><span className="absolute inset-0 bg-gradient-to-t from-[color:var(--ink)]/85 via-[color:var(--ink)]/25 to-[color:var(--ink)]/15" /></div>;
}

export default async function Home() {
  const [products, dbBanners] = await Promise.all([
    prisma.product.findMany({ include: { sizes: true }, orderBy: { createdAt: "desc" } }),
    prisma.banner.findMany({ where: { slot: { in: ["hero", "category-1", "category-2"] } } }),
  ]);
  const banners = new Map(dbBanners.map((banner) => [banner.slot, banner]));
  const hero = banners.get("hero") ?? bannerFallbacks.hero;
  const categoryOne = banners.get("category-1") ?? bannerFallbacks["category-1"];
  const categoryTwo = banners.get("category-2") ?? bannerFallbacks["category-2"];
  const recommendedProducts = products.slice(0, 5);
  const latestProducts = [...products].reverse().slice(0, 5);

  return <main className="w-full">
    <Link href={hero.linkUrl} className={`editorial-banner ${hero.imageUrl ? "bg-[color:var(--ink)]" : "lookbook-media"} flex min-h-[60svh] cursor-pointer items-end border border-[color:var(--ink)]/15 px-6 py-8 text-[color:var(--white)] sm:px-10 sm:py-12 lg:px-16 lg:py-16`}>
      <BannerBackground imageUrl={hero.imageUrl} />
      <div><p className="font-mono-price text-xs tracking-[0.18em] text-[color:var(--gold)]">КОЛЛЕКЦИЯ / 2026</p><h1 className="font-brand mt-5 max-w-4xl text-[clamp(2.8rem,14vw,10.5rem)] leading-[0.86] sm:leading-[0.78]">{hero.title}</h1>{hero.subtitle ? <p className="mt-7 max-w-sm text-sm leading-6 text-[color:var(--white)]/75 sm:text-base">{hero.subtitle}</p> : null}</div>
    </Link>

    <section className="mx-auto max-w-[90rem] px-4 pt-16 sm:px-6 sm:pt-24 lg:px-10"><div className="mb-7 flex flex-col items-start gap-3 sm:mb-9 sm:flex-row sm:items-end sm:justify-between sm:gap-4"><h2 className="font-display text-[clamp(2.4rem,7vw,3.75rem)] leading-[0.9] tracking-[-0.05em]">Рекомендуем</h2><Link href="/catalog" className="font-mono-price mb-1 text-xs tracking-[0.08em] text-[color:var(--accent)]">В КАТАЛОГ →</Link></div><HomeProductMarquee products={recommendedProducts} /></section>

    <section className="grid gap-0 py-16 sm:py-24 lg:grid-cols-2">
      <Link href={categoryOne.linkUrl} className={`editorial-banner ${categoryOne.imageUrl ? "bg-[color:var(--ink)]" : "lookbook-media"} flex min-h-[35svh] cursor-pointer items-end border border-[color:var(--ink)]/15 px-6 py-7 text-[color:var(--white)] sm:px-9 sm:py-10`}><BannerBackground imageUrl={categoryOne.imageUrl} /><div>{categoryOne.subtitle ? <p className="font-mono-price text-xs tracking-[0.16em] text-[color:var(--gold)]">{categoryOne.subtitle}</p> : null}<h2 className="font-display mt-3 text-[clamp(2.5rem,9vw,4.5rem)] leading-[0.9] tracking-[-0.05em]">{categoryOne.title}</h2></div></Link>
      <Link href={categoryTwo.linkUrl} className={`editorial-banner ${categoryTwo.imageUrl ? "bg-[color:var(--ink)]" : "lookbook-media lookbook-media--gold"} flex min-h-[35svh] cursor-pointer items-end border border-[color:var(--ink)]/15 px-6 py-7 text-[color:var(--white)] sm:px-9 sm:py-10`}><BannerBackground imageUrl={categoryTwo.imageUrl} /><div>{categoryTwo.subtitle ? <p className="font-mono-price text-xs tracking-[0.16em] text-[color:var(--gold)]">{categoryTwo.subtitle}</p> : null}<h2 className="font-display mt-3 text-[clamp(2.5rem,9vw,4.5rem)] leading-[0.9] tracking-[-0.05em]">{categoryTwo.title}</h2></div></Link>
    </section>

    <section className="mx-auto max-w-[90rem] px-4 pb-10 sm:px-6 sm:pb-16 lg:px-10"><div className="mb-7 flex flex-col items-start gap-3 sm:mb-9 sm:flex-row sm:items-end sm:justify-between sm:gap-4"><h2 className="font-display text-[clamp(2.4rem,7vw,3.75rem)] leading-[0.9] tracking-[-0.05em]">Новинки</h2><Link href="/catalog?category=новинки" className="font-mono-price mb-1 text-xs tracking-[0.08em] text-[color:var(--accent)]">ВСЕ НОВИНКИ →</Link></div><HomeProductMarquee products={latestProducts} /></section>
  </main>;
}
