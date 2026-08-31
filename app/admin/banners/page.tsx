import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { BannerForm } from "./banner-form";

const slotMeta = [
  { slot: "hero", label: "Главный баннер", hint: "Крупный баннер в начале главной страницы." },
  { slot: "category-1", label: "Категория 01", hint: "Первый компактный баннер под лентой рекомендаций." },
  { slot: "category-2", label: "Категория 02", hint: "Второй компактный баннер под лентой рекомендаций." },
];

export default async function AdminBannersPage({ searchParams }: { searchParams: Promise<{ error?: string; saved?: string }> }) {
  const [banners, params] = await Promise.all([prisma.banner.findMany({ where: { slot: { in: slotMeta.map((item) => item.slot) } } }), searchParams]);
  const bannersBySlot = new Map(banners.map((banner) => [banner.slot, banner]));
  return <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-16 lg:px-10"><Link href="/admin" className="font-mono-price text-xs tracking-[0.1em] text-[color:var(--accent)]">← ОБЗОР</Link><h1 className="font-display mt-5 text-[clamp(2.6rem,8vw,4.5rem)] leading-[0.9] tracking-[-0.04em]">Баннеры</h1><p className="mt-4 max-w-xl leading-7 text-[color:var(--ink)]/65">Настройте тексты, переходы и изображения баннеров главной страницы без изменения кода.</p>{params.error ? <p className="mt-6 border border-[color:var(--accent)]/35 bg-[color:var(--accent)]/5 p-3 text-sm text-[color:var(--accent)]">{params.error}</p> : null}{params.saved ? <p className="mt-6 border border-[color:var(--gold)]/60 bg-[color:var(--gold)]/10 p-3 text-sm">Изменения сохранены.</p> : null}<div className="mt-10 space-y-8">{slotMeta.map((meta) => { const banner = bannersBySlot.get(meta.slot); return banner ? <BannerForm key={meta.slot} banner={banner} label={meta.label} hint={meta.hint} /> : null; })}</div></main>;
}
