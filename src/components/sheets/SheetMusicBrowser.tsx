"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Search } from "lucide-react";
import { SheetMusicCard } from "./SheetMusicCard";
import type { SerializedSheetMusic } from "@/lib/content/sheet-music";

const ALL = "__all__";

export function SheetMusicBrowser({
  sheets,
}: {
  sheets: SerializedSheetMusic[];
}) {
  const t = useTranslations("sheets");
  const [query, setQuery] = useState("");
  const [difficulty, setDifficulty] = useState(ALL);
  const [genre, setGenre] = useState(ALL);

  const difficulties = useMemo(
    () => Array.from(new Set(sheets.map((s) => s.difficulty))),
    [sheets]
  );
  const genres = useMemo(
    () => Array.from(new Set(sheets.map((s) => s.genre))),
    [sheets]
  );

  const filtered = sheets.filter((sheet) => {
    const matchesQuery = sheet.title
      .toLowerCase()
      .includes(query.trim().toLowerCase());
    const matchesDifficulty =
      difficulty === ALL || sheet.difficulty === difficulty;
    const matchesGenre = genre === ALL || sheet.genre === genre;
    return matchesQuery && matchesDifficulty && matchesGenre;
  });

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold text-ink sm:text-4xl">
        {t("title")}
      </h1>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/40"
            strokeWidth={1.5}
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("searchPlaceholder")}
            className="w-full border border-ink/20 bg-transparent py-2 pl-9 pr-3 font-body text-sm text-ink placeholder:text-ink/40 focus:border-brass focus:outline-none"
          />
        </div>

        <select
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
          className="border border-ink/20 bg-paper px-3 py-2 font-mono text-xs uppercase tracking-[0.08em] text-ink focus:border-brass focus:outline-none"
        >
          <option value={ALL}>{t("allDifficulties")}</option>
          {difficulties.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>

        <select
          value={genre}
          onChange={(e) => setGenre(e.target.value)}
          className="border border-ink/20 bg-paper px-3 py-2 font-mono text-xs uppercase tracking-[0.08em] text-ink focus:border-brass focus:outline-none"
        >
          <option value={ALL}>{t("allGenres")}</option>
          {genres.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <p className="mt-16 font-body text-sm text-ink/50">{t("empty")}</p>
      ) : (
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((sheet) => (
            <SheetMusicCard key={sheet.id} sheet={sheet} />
          ))}
        </div>
      )}
    </div>
  );
}
