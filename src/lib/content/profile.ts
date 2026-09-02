import { prisma } from "@/lib/prisma";
import type { ProfileConfig } from "@prisma/client";

export type Locale = "zh-TW" | "en" | "ja" | "ko";

export type LocalizedText = Partial<Record<Locale, string>>;
export type LocalizedStringArray = Partial<Record<Locale, string[]>>;

// Flattened, locale-resolved shape the front-end components consume - see
// openspec/changes/profile-i18n-content/design.md, Decision 2. Components
// stay unaware that heroTitle/heroSubtitle/aboutBio/styleTags are stored as
// per-locale JSON in the database.
export type ResolvedProfileConfig = Omit<
  ProfileConfig,
  "heroTitle" | "heroSubtitle" | "aboutBio" | "styleTags"
> & {
  heroTitle: string;
  heroSubtitle: string;
  aboutBio: string;
  styleTags: string[];
};

function resolveText(value: unknown, locale: Locale): string {
  const dict = (value ?? {}) as LocalizedText;
  return dict[locale] || dict["zh-TW"] || "";
}

function resolveStringArray(value: unknown, locale: Locale): string[] {
  const dict = (value ?? {}) as LocalizedStringArray;
  return dict[locale]?.length ? dict[locale]! : dict["zh-TW"] || [];
}

export async function getProfileConfig(
  locale: Locale
): Promise<ResolvedProfileConfig> {
  const profile = await prisma.profileConfig.findUniqueOrThrow({
    where: { id: "site-config" },
  });

  return {
    ...profile,
    heroTitle: resolveText(profile.heroTitle, locale),
    heroSubtitle: resolveText(profile.heroSubtitle, locale),
    aboutBio: resolveText(profile.aboutBio, locale),
    styleTags: resolveStringArray(profile.styleTags, locale),
  };
}
