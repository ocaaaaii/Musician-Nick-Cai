import type { ProfileConfig } from "@prisma/client";

// Placeholder implementation while P1 (Supabase connection) is pending -
// see openspec/changes/homepage-brand-section/design.md, Decision 2.
// The `locale` branch is a demo-only convenience for i18n-setup - see
// openspec/changes/i18n-setup/design.md, Decision 3 and Non-Goals. It does
// not represent a decided approach for localizing real database content.
// Swap this body for `prisma.profileConfig.findUnique(...)` once the
// database is live; callers already treat this as async.

const base = {
  id: "site-config",
  heroVideoUrl: null,
  instagramUrl: "https://instagram.com/example",
  youtubeUrl: "https://youtube.com/@example",
  contactEmail: "contact@example.com",
  calendlyUrl: null,
  updatedAt: new Date(),
} satisfies Partial<ProfileConfig>;

const localizedProfiles: Record<
  string,
  Pick<ProfileConfig, "heroTitle" | "heroSubtitle" | "aboutBio" | "styleTags">
> = {
  "zh-TW": {
    heroTitle: "鋼琴家 Nick Cai",
    heroSubtitle: "編曲・採譜・鋼琴教學",
    aboutBio:
      "以流行改編與即興編曲見長的鋼琴演奏家，擅長將原曲重新詮釋為適合演出與教學的鋼琴版本，同時提供客製化採譜與一對一教學服務。",
    styleTags: ["流行改編", "爵士即興", "J-POP Cover", "R&B", "即興伴奏"],
  },
  en: {
    heroTitle: "Nick Cai, Pianist",
    heroSubtitle: "Arranging · Transcription · Piano Lessons",
    aboutBio:
      "A pianist known for pop reinterpretations and improvised arrangements, turning familiar songs into piano pieces fit for performance and teaching, alongside custom transcription and one-on-one lessons.",
    styleTags: ["Pop Arrangement", "Jazz Improv", "J-POP Cover", "R&B", "Improvised Accompaniment"],
  },
  ja: {
    heroTitle: "ピアニスト Nick Cai",
    heroSubtitle: "編曲・採譜・ピアノレッスン",
    aboutBio:
      "ポップスの再解釈と即興編曲を得意とするピアニスト。原曲を演奏や指導に適したピアノ版へと再構築し、採譜依頼やマンツーマンレッスンにも対応。",
    styleTags: ["ポップアレンジ", "ジャズ即興", "J-POPカバー", "R&B", "即興伴奏"],
  },
  ko: {
    heroTitle: "피아니스트 Nick Cai",
    heroSubtitle: "편곡・채보・피아노 레슨",
    aboutBio:
      "팝 편곡과 즉흥 연주에 강점을 지닌 피아니스트로, 원곡을 공연과 레슨에 어울리는 피아노 버전으로 재해석합니다. 맞춤 채보와 1:1 레슨도 진행합니다.",
    styleTags: ["팝 편곡", "재즈 즉흥연주", "J-POP 커버", "R&B", "즉흥 반주"],
  },
};

export async function getProfileConfig(locale: string): Promise<ProfileConfig> {
  const localized = localizedProfiles[locale] ?? localizedProfiles["zh-TW"];
  return { ...base, ...localized };
}
