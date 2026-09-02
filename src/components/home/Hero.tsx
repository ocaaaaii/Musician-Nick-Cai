"use client";

import Image from "next/image";
import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { useTranslations } from "next-intl";
import type { ProfileConfig } from "@prisma/client";

export function Hero({ profile }: { profile: ProfileConfig }) {
  const rootRef = useRef<HTMLElement>(null);
  const t = useTranslations("hero");

  useLayoutEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReducedMotion || !rootRef.current) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.from("[data-reveal='kicker']", { opacity: 0, y: 12, duration: 0.5 })
        .from(
          "[data-reveal='headline']",
          { opacity: 0, y: 28, duration: 0.8 },
          "-=0.25"
        )
        .from(
          "[data-reveal='subtitle']",
          { opacity: 0, y: 20, duration: 0.6 },
          "-=0.45"
        )
        .from(
          "[data-reveal='photo']",
          { opacity: 0, scale: 1.04, duration: 1 },
          "-=0.7"
        );
    }, rootRef);

    return () => ctx.revert();
  }, []);

  return (
    <div className="bg-paper">
      <section
        ref={rootRef}
        className="relative mx-auto max-w-6xl px-6 pb-16 pt-16 sm:pt-24"
      >
      <div
        data-reveal="kicker"
        className="mb-8 flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.2em] text-ink/50"
      >
        <span>{t("kicker")}</span>
        <span className="hidden sm:inline">{t("location")}</span>
      </div>

      <div className="grid gap-10 md:grid-cols-2 md:items-center md:gap-6">
        <div className="order-2 md:order-1">
          <h1
            data-reveal="headline"
            className="text-balance font-display text-4xl font-semibold leading-[1.1] text-ink sm:text-5xl md:text-6xl"
          >
            {profile.heroTitle}
          </h1>
          <p
            data-reveal="subtitle"
            className="mt-5 max-w-md font-body text-lg text-ink/70"
          >
            {profile.heroSubtitle}
          </p>
        </div>

        <div
          data-reveal="photo"
          className="relative order-1 aspect-[4/5] w-full overflow-hidden md:order-2"
        >
          <Image
            src="/images/nick-cai.png"
            alt={profile.heroTitle}
            fill
            priority
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-cover object-top saturate-[0.8] contrast-[1.03]"
          />
          <div className="absolute inset-0 bg-ink/15 mix-blend-multiply" />
          <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-ink/40 to-transparent" />
        </div>
      </div>

      <div className="mt-14 flex items-center justify-end gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-ink/50">
        <span>{t("scroll")}</span>
        <span aria-hidden>↓</span>
      </div>
      </section>
    </div>
  );
}
