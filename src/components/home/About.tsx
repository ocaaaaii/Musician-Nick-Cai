import { useTranslations } from "next-intl";
import type { ProfileConfig } from "@prisma/client";
import { FadeDivider } from "@/components/ui/FadeDivider";

export function About({ profile }: { profile: ProfileConfig }) {
  const t = useTranslations("about");
  return (
    <div id="about" className="scroll-mt-20 bg-bone">
      <FadeDivider />
      <section className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
        <div className="grid gap-8 md:grid-cols-[auto_1fr] md:gap-16">
          <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-ink/50">
            {t("title")}
          </h2>
          <div className="max-w-2xl">
            <p className="font-display text-xl italic leading-relaxed text-ink sm:text-2xl">
              {profile.aboutBio}
            </p>
            <ul className="mt-8 flex flex-wrap gap-3">
              {profile.styleTags.map((tag) => (
                <li key={tag}>
                  <span className="inline-block cursor-default border border-ink/25 px-4 py-1.5 font-mono text-xs uppercase tracking-[0.08em] text-ink/70 transition-colors duration-200 hover:border-brass hover:bg-brass hover:text-cream">
                    {tag}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
