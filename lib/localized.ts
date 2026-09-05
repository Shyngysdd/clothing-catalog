const localeSuffixes = {
  ru: "Ru",
  en: "En",
  kz: "Kz",
} as const;

export type ContentLocale = keyof typeof localeSuffixes;

export function getLocalizedField(item: object, field: string, locale: string): string {
  const values = item as Record<string, unknown>;
  const normalizedLocale = locale.toLowerCase().split("-")[0] as ContentLocale;
  const suffix = localeSuffixes[normalizedLocale] ?? localeSuffixes.ru;
  const localizedValue = values[`${field}${suffix}`];
  const russianValue = values[`${field}Ru`];

  if (typeof localizedValue === "string" && localizedValue.trim()) return localizedValue;
  return typeof russianValue === "string" ? russianValue : "";
}
