import type { FeaturedVideo } from "@prisma/client";

// Placeholder implementation while P1 (Supabase connection) is pending -
// see openspec/changes/homepage-brand-section/design.md, Decision 2.
// See src/lib/content/profile.ts for a note on the `locale` param's status.

const localizedTitles: Record<string, [string, string, string]> = {
  "zh-TW": ["流行改編組曲 - 現場演奏", "爵士即興 Live Session", "動漫 OST 鋼琴改編"],
  en: ["Pop Medley — Live", "Jazz Improv Session", "Anime OST Piano Arrangement"],
  ja: ["ポップスメドレー - ライブ演奏", "ジャズ即興セッション", "アニメOSTピアノアレンジ"],
  ko: ["팝 메들리 - 라이브 연주", "재즈 즉흥 세션", "애니 OST 피아노 편곡"],
};

export async function getFeaturedVideos(locale: string): Promise<FeaturedVideo[]> {
  const titles = localizedTitles[locale] ?? localizedTitles["zh-TW"];

  return titles.map((title, index) => ({
    id: `sample-${index + 1}`,
    title,
    youtubeUrl: "https://example.com/placeholder-video",
    sortOrder: index,
    isPublished: true,
    createdAt: new Date(),
  }));
}
