import Image from "next/image";
import Link from "next/link";
import { HomeProductMarquee } from "@/components/home-product-marquee";
import { RecentlyViewed } from "@/components/recently-viewed";
import { prisma } from "@/lib/prisma";
import { resolveSectionProducts } from "@/lib/home-sections";
import { BRAND_CONFIG } from "@/lib/brand-config";

export const revalidate = 60;

const bannerFallbacks = {
  hero: { title: BRAND_CONFIG.name, subtitle: "Новая глава городского гардероба — строгая, тактильная, личная.", linkUrl: "/catalog?category=новинки", imageUrl: null },
  "category-1": { title: "Ветровки", subtitle: "ВЫБОРКА / 01", linkUrl: "/catalog?category=Ветровки", imageUrl: null },
  "category-2": { title: "Обувь", subtitle: "ВЫБОРКА / 02", linkUrl: "/catalog?category=Обувь", imageUrl: null },
};

function BannerBackground({ imageUrl }: { imageUrl: string | null }) {
  if (!imageUrl) return null;
  return <div className="editorial-banner-image absolute inset-0"><Image src={imageUrl} alt="" fill sizes="100vw" className="object-cover" /><span className="editorial-banner-image-overlay absolute inset-0" /></div>;
}

export default async function Home() {
  const [products, dbBanners, homeSections, groupedOrderItems] = await Promise.all([
    prisma.product.findMany({ include: { sizes: true }, orderBy: { createdAt: "desc" } }),
    prisma.banner.findMany({ where: { slot: { in: ["hero", "category-1", "category-2"] } } }),
    prisma.homeSection.findMany({ where: { isActive: true }, orderBy: { position: "asc" } }),
    prisma.orderItem.groupBy({ by: ["productId"], _sum: { quantity: true } }),
  ]);
  const banners = new Map(dbBanners.map((banner) => [banner.slot, banner]));
  const hero = banners.get("hero") ?? bannerFallbacks.hero;
  const categoryOne = banners.get("category-1") ?? bannerFallbacks["category-1"];
  const categoryTwo = banners.get("category-2") ?? bannerFallbacks["category-2"];
  const resolvedSections = homeSections.map((section) => ({ section, products: resolveSectionProducts(section, products, groupedOrderItems) })).filter((item) => item.products.length > 0);

  return <main className="w-full overflow-x-clip">
    <section className="home-editorial-hero">
      <div className="home-hero-intro"><p className="font-mono-price text-[0.62rem] tracking-[0.16em] text-[color:var(--accent)]">КОЛЛЕКЦИЯ / 2026</p><p className="home-hero-index">01 — 01</p><div className="mt-auto"><p className="font-display max-w-xs text-[clamp(2rem,5vw,3.6rem)] leading-[0.9]">Гардероб для города, который движется в своём темпе.</p><p className="mt-5 max-w-xs text-xs leading-5 text-[color:var(--ink)]/60">Выверенные силуэты, тактильные ткани и вещи, которые остаются с вами дольше одного сезона.</p></div></div>
      <Link href={hero.linkUrl} className={`editorial-banner home-hero-frame ${hero.imageUrl ? "bg-[color:var(--paper)]" : "lookbook-media"} cursor-pointer text-[color:var(--ink)]`}>
        <BannerBackground imageUrl={hero.imageUrl} />
        <div className="home-hero-title"><p className="font-mono-price text-[0.62rem] tracking-[0.16em] text-[color:var(--accent)]">НОВАЯ ГЛАВА</p><h1 className="font-brand mt-5 max-w-4xl text-[clamp(3.8rem,10vw,9.5rem)] leading-[0.8]">{hero.title}</h1>{hero.subtitle ? <p className="mt-6 max-w-sm text-sm leading-6 text-[color:var(--ink)]/70">{hero.subtitle}</p> : null}<span className="home-hero-link">СМОТРЕТЬ КОЛЛЕКЦИЮ <span aria-hidden="true">↗</span></span></div>
      </Link>
    </section>

    {resolvedSections.slice(0, 1).map(({ section, products }) => <section key={section.id} className="home-collection-section"><div className="home-section-heading"><div><p className="font-mono-price text-[0.6rem] tracking-[0.14em] text-[color:var(--accent)]">ОТБОР СТУДИИ / 01</p><h2 className="font-display mt-3 text-[clamp(2.9rem,7vw,5.5rem)] leading-[0.82]">{section.title}</h2></div><Link href={section.type === "sale" ? "/catalog?sale=true" : section.type === "category" ? `/catalog?category=${encodeURIComponent(section.categoryValue ?? "")}` : "/catalog"} className="home-section-link">ВСЯ ВЫБОРКА <span aria-hidden="true">→</span></Link></div><HomeProductMarquee products={products} /></section>)}

    <section className="home-category-composition">
      <div className="home-category-copy"><p className="font-mono-price text-[0.6rem] tracking-[0.14em] text-[color:var(--accent)]">ГАРДЕРОБ / ПО ЧАСТЯМ</p><h2 className="font-display mt-5 text-[clamp(3.2rem,8vw,6.4rem)] leading-[0.8]">Форма следует за вашим днём.</h2><p className="mt-7 max-w-sm text-sm leading-6 text-[color:var(--ink)]/65">Собирайте гардероб постепенно: начните с слоя, который нужен сейчас, и соедините его с привычными вещами.</p></div>
      <div className="home-category-frames">
        <Link href={categoryOne.linkUrl} className={`editorial-banner home-category-frame home-category-frame--tall ${categoryOne.imageUrl ? "bg-[color:var(--paper)]" : "lookbook-media"} cursor-pointer text-[color:var(--ink)]`}><BannerBackground imageUrl={categoryOne.imageUrl} /><div><p className="font-mono-price text-[0.6rem] tracking-[0.14em] text-[color:var(--accent)]">{categoryOne.subtitle ?? "ВЫБОРКА / 01"}</p><h3 className="font-display mt-3 text-[clamp(2.7rem,6vw,5rem)] leading-[0.85]">{categoryOne.title}</h3></div></Link>
        <Link href={categoryTwo.linkUrl} className={`editorial-banner home-category-frame home-category-frame--short ${categoryTwo.imageUrl ? "bg-[color:var(--paper)]" : "lookbook-media lookbook-media--gold"} cursor-pointer text-[color:var(--ink)]`}><BannerBackground imageUrl={categoryTwo.imageUrl} /><div><p className="font-mono-price text-[0.6rem] tracking-[0.14em] text-[color:var(--accent)]">{categoryTwo.subtitle ?? "ВЫБОРКА / 02"}</p><h3 className="font-display mt-3 text-[clamp(2.5rem,5vw,4.4rem)] leading-[0.85]">{categoryTwo.title}</h3></div></Link>
      </div>
    </section>

    {resolvedSections.slice(1).map(({ section, products }, index) => <section key={section.id} className="home-collection-section home-collection-section--secondary"><div className="home-section-heading"><div><p className="font-mono-price text-[0.6rem] tracking-[0.14em] text-[color:var(--accent)]">ОТБОР СТУДИИ / {String(index + 2).padStart(2, "0")}</p><h2 className="font-display mt-3 text-[clamp(2.9rem,7vw,5.5rem)] leading-[0.82]">{section.title}</h2></div><Link href={section.type === "sale" ? "/catalog?sale=true" : section.type === "category" ? `/catalog?category=${encodeURIComponent(section.categoryValue ?? "")}` : "/catalog"} className="home-section-link">ВСЯ ВЫБОРКА <span aria-hidden="true">→</span></Link></div><HomeProductMarquee products={products} /></section>)}
    <RecentlyViewed allProducts={products} />
  </main>;
}
