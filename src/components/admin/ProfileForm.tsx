"use client";

import { useState, type FormEvent } from "react";
import type { ProfileConfig } from "@prisma/client";
import { updateProfile } from "@/app/admin/(protected)/profile/actions";

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

export function ProfileForm({ profile }: { profile: ProfileConfig }) {
  const [heroTitle, setHeroTitle] = useState(profile.heroTitle);
  const [heroSubtitle, setHeroSubtitle] = useState(profile.heroSubtitle);
  const [aboutBio, setAboutBio] = useState(profile.aboutBio);
  const [styleTags, setStyleTags] = useState<string[]>(profile.styleTags);
  const [newTag, setNewTag] = useState("");
  const [instagramUrl, setInstagramUrl] = useState(profile.instagramUrl ?? "");
  const [youtubeUrl, setYoutubeUrl] = useState(profile.youtubeUrl ?? "");
  const [contactEmail, setContactEmail] = useState(profile.contactEmail ?? "");
  const [calendlyUrl, setCalendlyUrl] = useState(profile.calendlyUrl ?? "");

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">(
    "idle"
  );

  function addTag() {
    const value = newTag.trim();
    if (!value || styleTags.includes(value)) return;
    setStyleTags([...styleTags, value]);
    setNewTag("");
  }

  function removeTag(tag: string) {
    setStyleTags(styleTags.filter((t) => t !== tag));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("saving");
    setFieldErrors({});

    const result = await updateProfile({
      heroTitle,
      heroSubtitle,
      aboutBio,
      styleTags,
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
      {(["heroTitle", "heroSubtitle"] as const).map((field) => (
        <Field
          key={field}
          label={labelField(field)}
          error={fieldErrors[field]}
        >
          <input
            type="text"
            value={field === "heroTitle" ? heroTitle : heroSubtitle}
            onChange={(e) =>
              field === "heroTitle"
                ? setHeroTitle(e.target.value)
                : setHeroSubtitle(e.target.value)
            }
            className="mt-1.5 w-full border border-ink/20 bg-transparent px-3 py-2 font-body text-sm text-ink focus:border-brass focus:outline-none"
          />
        </Field>
      ))}

      <Field label={labelField("aboutBio")} error={fieldErrors.aboutBio}>
        <textarea
          value={aboutBio}
          onChange={(e) => setAboutBio(e.target.value)}
          rows={4}
          className="mt-1.5 w-full border border-ink/20 bg-transparent px-3 py-2 font-body text-sm text-ink focus:border-brass focus:outline-none"
        />
      </Field>

      <div>
        <label className="block font-mono text-xs uppercase tracking-[0.1em] text-ink/60">
          風格標籤
        </label>
        <ul className="mt-2 flex flex-wrap gap-2">
          {styleTags.map((tag) => (
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
