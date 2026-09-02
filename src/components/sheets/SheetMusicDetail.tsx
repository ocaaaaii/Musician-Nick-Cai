"use client";

import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { Play } from "lucide-react";
import { WatermarkedPreview } from "./WatermarkedPreview";
import { useAudioPlayerStore } from "@/lib/store/audio-player";
import type { SerializedSheetMusic } from "@/lib/content/sheet-music";

export function SheetMusicDetail({ sheet }: { sheet: SerializedSheetMusic }) {
  const t = useTranslations("sheets");
  const play = useAudioPlayerStore((state) => state.play);

  return (
    <div className="grid gap-10 md:grid-cols-2 md:gap-12">
      <WatermarkedPreview images={sheet.sampleImages} alt={sheet.title} />

      <div>
        <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink/50">
          {sheet.genre}
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-ink sm:text-4xl">
          {sheet.title}
        </h1>
        <p className="mt-3 font-mono text-lg text-ink">
          NT$ {sheet.price.toLocaleString()}
        </p>

        <dl className="mt-6 grid grid-cols-2 gap-4 border-y border-ink/10 py-6 font-mono text-xs uppercase tracking-[0.08em]">
          <div>
            <dt className="text-ink/50">{t("difficultyLabel")}</dt>
            <dd className="mt-1 text-ink">{sheet.difficulty}</dd>
          </div>
          <div>
            <dt className="text-ink/50">{t("genreLabel")}</dt>
            <dd className="mt-1 text-ink">{sheet.genre}</dd>
          </div>
          {sheet.key && (
            <div>
              <dt className="text-ink/50">{t("keyLabel")}</dt>
              <dd className="mt-1 text-ink">{sheet.key}</dd>
            </div>
          )}
        </dl>

        {sheet.description && (
          <p className="mt-6 font-body text-sm leading-relaxed text-ink/70">
            {sheet.description}
          </p>
        )}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={() => play(sheet.audioSampleUrl, sheet.title)}
            className="group inline-flex items-center gap-2 border border-ink/30 px-5 py-2.5 font-mono text-xs uppercase tracking-[0.15em] text-ink transition-colors hover:border-brass hover:text-brass"
          >
            <Play className="h-3.5 w-3.5" strokeWidth={1.5} />
            {t("listen")}
          </button>

          <Link
            href={`/checkout/${sheet.id}`}
            className="inline-flex items-center gap-2 bg-ink px-5 py-2.5 font-mono text-xs uppercase tracking-[0.15em] text-cream transition-colors hover:bg-brass"
          >
            {t("buyNow")}
          </Link>
        </div>
      </div>
    </div>
  );
}
