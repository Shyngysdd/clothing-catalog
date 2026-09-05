"use client";

import { ReactNode, useId, useState } from "react";

export type AdminLocale = "ru" | "en" | "kz";

export const OPTIONAL_TRANSLATION_PLACEHOLDER = "Не переведено — покажется русский текст";

const locales: { code: AdminLocale; label: string }[] = [
  { code: "ru", label: "RU" },
  { code: "en", label: "EN" },
  { code: "kz", label: "KZ" },
];

export function AdminLocaleTabs({ panels }: { panels: Record<AdminLocale, ReactNode> }) {
  const [activeLocale, setActiveLocale] = useState<AdminLocale>("ru");
  const id = useId();

  return (
    <div className="border border-[color:var(--border)]">
      <div className="flex border-b border-[color:var(--border)]" role="tablist" aria-label="Язык контента">
        {locales.map(({ code, label }) => (
          <button
            key={code}
            id={`${id}-${code}-tab`}
            type="button"
            role="tab"
            aria-selected={activeLocale === code}
            aria-controls={`${id}-${code}-panel`}
            onClick={() => setActiveLocale(code)}
            className={`min-h-11 min-w-20 border-r border-[color:var(--border)] px-5 text-xs font-medium tracking-[0.16em] transition-colors last:border-r-0 ${activeLocale === code ? "bg-[color:var(--ink)] text-[color:var(--white)]" : "hover:bg-[color:var(--paper)]"}`}
          >
            {label}
          </button>
        ))}
      </div>

      {locales.map(({ code }) => (
        <div
          key={code}
          id={`${id}-${code}-panel`}
          role="tabpanel"
          aria-labelledby={`${id}-${code}-tab`}
          hidden={activeLocale !== code}
          className="p-4 sm:p-5"
        >
          {panels[code]}
        </div>
      ))}
    </div>
  );
}
