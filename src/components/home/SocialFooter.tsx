import { AtSign, Mail, Video } from "lucide-react";
import { useTranslations } from "next-intl";
import type { ProfileConfig } from "@prisma/client";

export function SocialFooter({ profile }: { profile: ProfileConfig }) {
  const t = useTranslations("footer");

  return (
    <footer className="mt-8">
      <svg
        viewBox="0 0 400 24"
        preserveAspectRatio="none"
        className="h-6 w-full text-brass/40"
        aria-hidden
      >
        {[4, 9, 14, 19, 24].map((y) => (
          <line
            key={y}
            x1="0"
            y1={y - 0.5}
            x2="400"
            y2={y - 0.5}
            stroke="currentColor"
            strokeWidth="0.5"
          />
        ))}
      </svg>

      <div className="bg-ink px-6 py-14 text-cream">
        <div className="mx-auto flex max-w-6xl flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-display text-lg">{profile.heroTitle}</p>
          <div className="flex flex-wrap items-center gap-6">
            {profile.instagramUrl && (
              <a
                href={profile.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="group flex items-center gap-2 font-mono text-xs uppercase tracking-[0.12em] text-cream/70 transition-colors duration-200 hover:text-brass"
              >
                <AtSign
                  className="h-4 w-4 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  strokeWidth={1.5}
                />
                {t("instagram")}
              </a>
            )}
            {profile.youtubeUrl && (
              <a
                href={profile.youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
                className="group flex items-center gap-2 font-mono text-xs uppercase tracking-[0.12em] text-cream/70 transition-colors duration-200 hover:text-brass"
              >
                <Video
                  className="h-4 w-4 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  strokeWidth={1.5}
                />
                {t("youtube")}
              </a>
            )}
            {profile.contactEmail && (
              <a
                href={`mailto:${profile.contactEmail}`}
                aria-label="Email"
                className="group flex items-center gap-2 font-mono text-xs uppercase tracking-[0.12em] text-cream/70 transition-colors duration-200 hover:text-brass"
              >
                <Mail
                  className="h-4 w-4 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  strokeWidth={1.5}
                />
                {profile.contactEmail}
              </a>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
