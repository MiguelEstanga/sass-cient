export const i18nConfig = {
  locales: ["en", "es"] as const,
  defaultLocale: "es" as const,
} as const;

export type Locale = (typeof i18nConfig.locales)[number];