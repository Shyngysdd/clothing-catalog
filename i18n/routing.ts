import {defineRouting} from "next-intl/routing";

export const routing = defineRouting({
  locales: ["ru", "en", "kz"],
  defaultLocale: "ru",
  localePrefix: "always",
  localeDetection: false
});

export type AppLocale = (typeof routing.locales)[number];
