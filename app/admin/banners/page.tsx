import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { updateBanner } from "./actions";

const slotMeta = [
  { slot: "hero", label: "Главный баннер", hint: "Крупный баннер в начале главной страницы." },
  { slot: "category-1", label: "Категория 01", hint: "Первый компактный баннер под лентой рекомендаций." },
  { slot: "category-2", label: "Категория 02", hint: "Второй компактный баннер под лентой рекомендаций." },
];

export default async function AdminBannersPage({ searchParams }: { searchParams: Promise<{ error?: string; saved?: string }> }) {
  const [banners, params] = await Promise.all([prisma.banner.findMany({ where: { slot: { in: slotMeta.map((item) => item.slot) } } }), searchParams]);
  const bannersBySlot = new Map(banners.map((banner) => [banner.slot, banner]));
  return <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-16 lg:px-10">
    <Link href="/admin" className="font-mono-price text-xs tracking-[0.1em] text-[color:var(--accent)]">← ОБЗОР</Link><h1 className="font-display mt-5 text-[clamp(2.6rem,8vw,4.5rem)] leading-[0.9] tracking-[-0.04em]">Баннеры</h1>
    <p className="mt-4 max-w-xl leading-7 text-[color:var(--ink)]/65">Настройте тексты, переходы и изображения баннеров главной страницы без изменения кода.</p>
    {params.error ? <p className="mt-6 border border-[color:var(--accent)]/35 bg-[color:var(--accent)]/5 p-3 text-sm text-[color:var(--accent)]">{params.error}</p> : null}{params.saved ? <p className="mt-6 border border-[color:var(--gold)]/60 bg-[color:var(--gold)]/10 p-3 text-sm">Изменения сохранены.</p> : null}
    <div className="mt-10 space-y-8">{slotMeta.map((meta) => {
      const banner = bannersBySlot.get(meta.slot);
      if (!banner) return null;
      return <form key={meta.slot} action={updateBanner} className="grid gap-6 border border-[color:var(--ink)]/15 bg-[color:var(--white)] p-5 sm:p-7 lg:grid-cols-[12rem_1fr]">
        <input type="hidden" name="slot" value={banner.slot} />
        <div><div className="relative aspect-[3/4] overflow-hidden bg-[color:var(--ink)]">{banner.imageUrl ? <Image src={banner.imageUrl} alt={`Превью: ${banner.title}`} fill sizes="192px" className="object-cover" /> : <div className={meta.slot === "category-2" ? "lookbook-media lookbook-media--gold absolute inset-0" : "lookbook-media absolute inset-0"} />}</div><p className="font-mono-price mt-3 text-[10px] tracking-[0.12em] text-[color:var(--accent)]">{banner.slot.toUpperCase()}</p></div>
        <div><h2 className="font-section text-2xl leading-none">{meta.label}</h2><p className="mt-2 text-sm leading-6 text-[color:var(--ink)]/60">{meta.hint}</p><div className="mt-6 grid gap-4">
          <label className="text-sm font-medium">Заголовок<input name="title" required defaultValue={banner.title} className="mt-1 min-h-11 w-full border border-[color:var(--ink)]/25 bg-[color:var(--white)] px-3 outline-none focus:border-[color:var(--accent)]" /></label><label className="text-sm font-medium">Подзаголовок<input name="subtitle" defaultValue={banner.subtitle ?? ""} className="mt-1 min-h-11 w-full border border-[color:var(--ink)]/25 bg-[color:var(--white)] px-3 outline-none focus:border-[color:var(--accent)]" /></label><label className="text-sm font-medium">Ссылка<input name="linkUrl" required defaultValue={banner.linkUrl} className="mt-1 min-h-11 w-full border border-[color:var(--ink)]/25 bg-[color:var(--white)] px-3 outline-none focus:border-[color:var(--accent)]" /></label>
          <label className="text-sm font-medium">Изображение<input name="image" type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="mt-1 block min-h-11 w-full cursor-pointer border border-[color:var(--ink)]/25 bg-[color:var(--white)] px-3 py-2 text-sm" /><span className="mt-2 block text-xs font-normal text-[color:var(--ink)]/55">JPG, PNG, WebP или GIF, до 5 МБ.</span></label>{banner.imageUrl ? <label className="flex items-center gap-2 text-sm"><input name="removeImage" type="checkbox" className="size-4 accent-[color:var(--accent)]" />Удалить текущее изображение</label> : null}
        </div><button type="submit" className="mt-6 min-h-11 bg-[color:var(--ink)] px-4 text-sm font-medium text-[color:var(--white)] hover:bg-[color:var(--accent)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--accent)]">Сохранить баннер</button></div>
      </form>;
    })}</div>
  </main>;
}
