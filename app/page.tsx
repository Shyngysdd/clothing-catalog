import Image from "next/image";
import Link from "next/link";
import { HomeProductMarquee } from "@/components/home-product-marquee";
import { RecentlyViewed } from "@/components/recently-viewed";
import { prisma } from "@/lib/prisma";
import { getHomeBestsellers, resolveSectionProducts } from "@/lib/home-sections";
import { BRAND_CONFIG } from "@/lib/brand-config";

export const revalidate = 60;

const bannerFallbacks = {
  hero: { title: BRAND_CONFIG.name, subtitle: "Новая глава городского гардероба — строгая, тактильная, личная.", linkUrl: "/catalog?category=новинки", imageUrl: null },
  "category-1": { title: "Мужское", subtitle: "ОТДЕЛ / 01", linkUrl: "/catalog?department=men", imageUrl: null },
  "category-2": { title: "Женское", subtitle: "ОТДЕЛ / 02", linkUrl: "/catalog?department=women", imageUrl: null },
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
    getHomeBestsellers(),
  ]);
  const banners = new Map(dbBanners.map((banner) => [banner.slot, banner]));
  const hero = banners.get("hero") ?? bannerFallbacks.hero;
  const categoryOne = { ...(banners.get("category-1") ?? bannerFallbacks["category-1"]), title: "Мужское", linkUrl: "/catalog?department=men" };
  const categoryTwo = { ...(banners.get("category-2") ?? bannerFallbacks["category-2"]), title: "Женское", linkUrl: "/catalog?department=women" };
  const resolvedSections = homeSections.map((section) => ({ section, products: resolveSectionProducts(section, products, groupedOrderItems) })).filter((item) => item.products.length > 0);
  const arrivalsIndex = resolvedSections.findIndex(({ section }) => section.type === "newest");
  const arrivalsSection = resolvedSections[arrivalsIndex >= 0 ? arrivalsIndex : 0];
  const supportingSections = resolvedSections.filter((_, index) => index !== (arrivalsIndex >= 0 ? arrivalsIndex : 0));

  return <main className="w-full overflow-x-clip">
    <section className="home-editorial-hero">
      <div className="home-hero-intro"><p className="font-mono-price text-[0.62rem] tracking-[0.16em] text-[color:var(--accent)]">КОЛЛЕКЦИЯ / 2026</p><p className="home-hero-index">01 — 01</p><div className="mt-auto"><p className="font-display max-w-xs text-[clamp(2rem,5vw,3.6rem)] leading-[0.9]">Гардероб для города, который движется в своём темпе.</p><p className="mt-5 max-w-xs text-xs leading-5 text-[color:var(--ink)]/60">Выверенные силуэты, тактильные ткани и вещи, которые остаются с вами дольше одного сезона.</p></div></div>
      <Link href={hero.linkUrl} className={`editorial-banner home-hero-frame ${hero.imageUrl ? "bg-[color:var(--paper)]" : "lookbook-media"} cursor-pointer ${hero.imageUrl ? "text-[color:var(--paper)]" : "text-[color:var(--ink)]"}`}>
        <BannerBackground imageUrl={hero.imageUrl} />
        <div className="home-hero-title"><p className="font-mono-price text-[0.62rem] tracking-[0.16em] text-[color:var(--accent)]">НОВАЯ ГЛАВА</p><h1 className="font-brand mt-5 max-w-4xl text-[clamp(3.8rem,10vw,9.5rem)] leading-[0.8]">{hero.title}</h1>{hero.subtitle ? <p className="mt-6 max-w-sm text-sm leading-6 text-current/70">{hero.subtitle}</p> : null}<span className="home-hero-link">СМОТРЕТЬ КОЛЛЕКЦИЮ <span aria-hidden="true">↗</span></span></div>
      </Link>
    </section>

    <section className="home-look-rows" aria-label="Образы сезона">
      <article className="home-look-row">
        <Link href={categoryOne.linkUrl} aria-label={`Открыть образ ${categoryOne.title}`} className={`editorial-banner home-look-media ${categoryOne.imageUrl ? "bg-[color:var(--surface)]" : "lookbook-media"}`}><BannerBackground imageUrl={categoryOne.imageUrl} /></Link>
        <div className="home-look-copy"><p className="font-mono-price text-[0.65rem] tracking-[0.16em] text-[color:var(--accent)]">ОТДЕЛ 01</p><h2 className="font-display mt-5 text-[clamp(3.2rem,7vw,6rem)] leading-[0.82]">{categoryOne.title}</h2><p className="mt-7 text-sm leading-6 text-[color:var(--ink)]/65">Одежда, обувь и аксессуары для мужского гардероба.</p><Link href={categoryOne.linkUrl} className="home-section-link">ПЕРЕЙТИ В РАЗДЕЛ <span aria-hidden="true">↗</span></Link></div>
      </article>
      <article className="home-look-row home-look-row--reverse">
        <Link href={categoryTwo.linkUrl} aria-label={`Открыть образ ${categoryTwo.title}`} className={`editorial-banner home-look-media ${categoryTwo.imageUrl ? "bg-[color:var(--surface)]" : "lookbook-media lookbook-media--gold"}`}><BannerBackground imageUrl={categoryTwo.imageUrl} /></Link>
        <div className="home-look-copy"><p className="font-mono-price text-[0.65rem] tracking-[0.16em] text-[color:var(--accent)]">ОТДЕЛ 02</p><h2 className="font-display mt-5 text-[clamp(3.2rem,7vw,6rem)] leading-[0.82]">{categoryTwo.title}</h2><p className="mt-7 text-sm leading-6 text-[color:var(--ink)]/65">Одежда, обувь и аксессуары для женского гардероба.</p><Link href={categoryTwo.linkUrl} className="home-section-link">ПЕРЕЙТИ В РАЗДЕЛ <span aria-hidden="true">↗</span></Link></div>
      </article>
    </section>

    {supportingSections.map(({ section, products }, index) => <section key={section.id} className="home-collection-section"><div className="home-section-heading"><div><p className="font-mono-price text-[0.6rem] tracking-[0.14em] text-[color:var(--accent)]">ОТБОР СТУДИИ / {String(index + 1).padStart(2, "0")}</p><h2 className="font-display mt-3 text-[clamp(2.9rem,7vw,5.5rem)] leading-[0.82]">{section.title}</h2></div><Link href={section.type === "sale" ? "/catalog?sale=true" : section.type === "category" ? `/catalog?category=${encodeURIComponent(section.categoryValue ?? "")}` : "/catalog"} className="home-section-link">ВСЯ ВЫБОРКА <span aria-hidden="true">→</span></Link></div><HomeProductMarquee products={products} /></section>)}
    {arrivalsSection ? <section className="home-collection-section home-arrivals-feed"><div className="home-section-heading"><div><p className="font-mono-price text-[0.6rem] tracking-[0.14em] text-[color:var(--accent)]">LES NOUVEAUTÉS / НОВИНКИ</p><h2 className="font-display mt-3 text-[clamp(2.9rem,7vw,5.5rem)] leading-[0.82]">{arrivalsSection.section.title}</h2></div><Link href="/catalog" className="home-section-link">ВСЕ НОВИНКИ <span aria-hidden="true">→</span></Link></div><HomeProductMarquee products={arrivalsSection.products} /></section> : null}
    <RecentlyViewed allProducts={products} />
  </main>;
}
