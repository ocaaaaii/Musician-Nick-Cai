"use client";

import { useState, type FormEvent } from "react";
import { updateProfile } from "@/app/admin/(protected)/profile/actions";

const LOCALES = ["zh-TW", "en", "ja", "ko"] as const;
type Locale = (typeof LOCALES)[number];

const LOCALE_LABELS: Record<Locale, string> = {
  "zh-TW": "中文",
  en: "EN",
  ja: "日本語",
  ko: "한국어",
};

type LocalizedFields = {
  heroTitle: string;
  heroSubtitle: string;
  aboutBio: string;
  styleTags: string[];
};

// Prisma's Json columns come across the Server -> Client boundary as loosely
// typed values - this narrows them into the per-locale shape the form
// edits, defaulting missing locales to empty so every tab always renders.
type IncomingProfile = {
  heroTitle: unknown;
  heroSubtitle: unknown;
  aboutBio: unknown;
  styleTags: unknown;
  instagramUrl: string | null;
  youtubeUrl: string | null;
  contactEmail: string | null;
  calendlyUrl: string | null;
};

function toLocalizedRecord(profile: IncomingProfile): Record<Locale, LocalizedFields> {
  const heroTitle = (profile.heroTitle ?? {}) as Record<string, string>;
  const heroSubtitle = (profile.heroSubtitle ?? {}) as Record<string, string>;
  const aboutBio = (profile.aboutBio ?? {}) as Record<string, string>;
  const styleTags = (profile.styleTags ?? {}) as Record<string, string[]>;

  return Object.fromEntries(
    LOCALES.map((locale) => [
      locale,
      {
        heroTitle: heroTitle[locale] ?? "",
        heroSubtitle: heroSubtitle[locale] ?? "",
        aboutBio: aboutBio[locale] ?? "",
        styleTags: styleTags[locale] ?? [],
      },
    ])
  ) as Record<Locale, LocalizedFields>;
}

const FIELD_LABELS: Record<string, string> = {
  heroTitle: "Hero 標題",
  heroSubtitle: "Hero 副標題",
  aboutBio: "關於我簡介",
  instagramUrl: "Instagram 連結",
  youtubeUrl: "YouTube 連結",
  contactEmail: "聯絡 Email",
  calendlyUrl: "Calendly 連結",
};

function labelField(field: string) {
  return FIELD_LABELS[field] ?? field;
}

export function ProfileForm({ profile }: { profile: IncomingProfile }) {
  const [activeLocale, setActiveLocale] = useState<Locale>("zh-TW");
  const [localized, setLocalized] = useState(() => toLocalizedRecord(profile));
  const [newTag, setNewTag] = useState("");

  const [instagramUrl, setInstagramUrl] = useState(profile.instagramUrl ?? "");
  const [youtubeUrl, setYoutubeUrl] = useState(profile.youtubeUrl ?? "");
  const [contactEmail, setContactEmail] = useState(profile.contactEmail ?? "");
  const [calendlyUrl, setCalendlyUrl] = useState(profile.calendlyUrl ?? "");

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">(
    "idle"
  );

  const current = localized[activeLocale];

  function updateCurrentLocale(patch: Partial<LocalizedFields>) {
    setLocalized((prev) => ({
      ...prev,
      [activeLocale]: { ...prev[activeLocale], ...patch },
    }));
  }

  function addTag() {
    const value = newTag.trim();
    if (!value || current.styleTags.includes(value)) return;
    updateCurrentLocale({ styleTags: [...current.styleTags, value] });
    setNewTag("");
  }

  function removeTag(tag: string) {
    updateCurrentLocale({
      styleTags: current.styleTags.filter((t) => t !== tag),
    });
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("saving");
    setFieldErrors({});

    const result = await updateProfile({
      heroTitle: mapLocales((l) => localized[l].heroTitle),
      heroSubtitle: mapLocales((l) => localized[l].heroSubtitle),
      aboutBio: mapLocales((l) => localized[l].aboutBio),
      styleTags: mapLocales((l) => localized[l].styleTags),
      instagramUrl,
      youtubeUrl,
      contactEmail,
      calendlyUrl,
    });

    if (result.ok) {
      setStatus("saved");
    } else {
      setFieldErrors(result.fieldErrors ?? {});
      setStatus("error");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="flex gap-1 border-b border-ink/15">
        {LOCALES.map((locale) => (
          <button
            key={locale}
            type="button"
            onClick={() => setActiveLocale(locale)}
            className={`px-3 py-2 font-mono text-xs uppercase tracking-[0.1em] transition-colors ${
              activeLocale === locale
                ? "border-b-2 border-brass text-ink"
                : "text-ink/40 hover:text-ink"
            }`}
          >
            {LOCALE_LABELS[locale]}
          </button>
        ))}
      </div>

      <Field
        label={labelField("heroTitle")}
        error={activeLocale === "zh-TW" ? fieldErrors.heroTitle : undefined}
      >
        <input
          type="text"
          value={current.heroTitle}
          onChange={(e) => updateCurrentLocale({ heroTitle: e.target.value })}
          className="mt-1.5 w-full border border-ink/20 bg-transparent px-3 py-2 font-body text-sm text-ink focus:border-brass focus:outline-none"
        />
      </Field>

      <Field
        label={labelField("heroSubtitle")}
        error={activeLocale === "zh-TW" ? fieldErrors.heroSubtitle : undefined}
      >
        <input
          type="text"
          value={current.heroSubtitle}
          onChange={(e) =>
            updateCurrentLocale({ heroSubtitle: e.target.value })
          }
          className="mt-1.5 w-full border border-ink/20 bg-transparent px-3 py-2 font-body text-sm text-ink focus:border-brass focus:outline-none"
        />
      </Field>

      <Field
        label={labelField("aboutBio")}
        error={activeLocale === "zh-TW" ? fieldErrors.aboutBio : undefined}
      >
        <textarea
          value={current.aboutBio}
          onChange={(e) => updateCurrentLocale({ aboutBio: e.target.value })}
          rows={4}
          className="mt-1.5 w-full border border-ink/20 bg-transparent px-3 py-2 font-body text-sm text-ink focus:border-brass focus:outline-none"
        />
      </Field>

      <div>
        <label className="block font-mono text-xs uppercase tracking-[0.1em] text-ink/60">
          風格標籤
        </label>
        <ul className="mt-2 flex flex-wrap gap-2">
          {current.styleTags.map((tag) => (
            <li key={tag}>
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="inline-flex items-center gap-1.5 border border-ink/25 px-3 py-1 font-mono text-xs text-ink/70 transition-colors hover:border-red-700 hover:text-red-700"
              >
                {tag}
                <span aria-hidden>×</span>
              </button>
            </li>
          ))}
        </ul>
        <div className="mt-2 flex gap-2">
          <input
            type="text"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addTag();
              }
            }}
            placeholder="新增標籤"
            className="w-full max-w-[200px] border border-ink/20 bg-transparent px-3 py-1.5 font-body text-sm text-ink focus:border-brass focus:outline-none"
          />
          <button
            type="button"
            onClick={addTag}
            className="border border-ink/30 px-3 py-1.5 font-mono text-xs uppercase tracking-[0.1em] text-ink transition-colors hover:border-brass hover:text-brass"
          >
            新增
          </button>
        </div>
      </div>

      <p className="font-mono text-[11px] text-ink/40">
        以上四個欄位依語言分別儲存；中文為必填（其他語系缺漏時前台會顯示中文版）。以下聯絡資訊不分語言。
      </p>

      {(
        [
          ["instagramUrl", instagramUrl, setInstagramUrl],
          ["youtubeUrl", youtubeUrl, setYoutubeUrl],
          ["contactEmail", contactEmail, setContactEmail],
          ["calendlyUrl", calendlyUrl, setCalendlyUrl],
        ] as const
      ).map(([field, value, setValue]) => (
        <Field key={field} label={labelField(field)} error={fieldErrors[field]}>
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="mt-1.5 w-full border border-ink/20 bg-transparent px-3 py-2 font-body text-sm text-ink focus:border-brass focus:outline-none"
          />
        </Field>
      ))}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={status === "saving"}
          className="inline-flex items-center gap-2 border border-ink/30 px-5 py-2.5 font-mono text-xs uppercase tracking-[0.15em] text-ink transition-colors hover:border-brass hover:text-brass disabled:cursor-not-allowed disabled:opacity-50"
        >
          {status === "saving" ? "儲存中…" : "儲存"}
        </button>
        {status === "saved" && (
          <span className="font-mono text-[11px] text-ink/50">已儲存</span>
        )}
        {status === "error" && !Object.keys(fieldErrors).length && (
          <span className="font-mono text-[11px] text-red-700">
            儲存失敗，請稍後再試
          </span>
        )}
      </div>
    </form>
  );
}

function mapLocales<T>(fn: (locale: Locale) => T): { "zh-TW": T } & Partial<Record<Exclude<Locale, "zh-TW">, T>> {
  const result = {} as Record<Locale, T>;
  for (const locale of LOCALES) {
    result[locale] = fn(locale);
  }
  return result as { "zh-TW": T } & Partial<Record<Exclude<Locale, "zh-TW">, T>>;
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block font-mono text-xs uppercase tracking-[0.1em] text-ink/60">
        {label}
      </label>
      {children}
      {error && (
        <p className="mt-1 font-mono text-[11px] text-red-700">
          {error === "required" ? "此欄位必填" : "格式不正確"}
        </p>
      )}
    </div>
  );
}
