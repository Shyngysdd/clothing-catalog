"use client";

import {useLocale, useTranslations} from "next-intl";
import {useSearchParams} from "next/navigation";
import {usePathname, useRouter} from "@/i18n/navigation";
import {routing, type AppLocale} from "@/i18n/routing";

export function LocaleSwitcher() {
  const locale = useLocale() as AppLocale;
  const t = useTranslations("Language");
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  function switchLocale(nextLocale: AppLocale) {
    const query = searchParams.toString();
    router.replace(`${pathname}${query ? `?${query}` : ""}`, {locale: nextLocale});
  }

  return (
    <div className="flex items-center gap-0 border-l border-[color:var(--border)] pl-1 sm:gap-1 sm:pl-2" aria-label={t("label")}>
      {routing.locales.map((item) => (
        <button key={item} type="button" onClick={() => switchLocale(item)} aria-pressed={item === locale} className={`px-1 py-2 font-mono-price text-[0.58rem] transition-colors hover:text-[color:var(--accent)] ${item === locale ? "text-[color:var(--accent)]" : "text-[color:var(--ink)]/50"}`}>
          {t(item)}
        </button>
      ))}
    </div>
  );
}
