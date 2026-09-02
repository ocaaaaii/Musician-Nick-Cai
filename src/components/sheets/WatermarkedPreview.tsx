"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

const WATERMARK_ROWS = 4;
const WATERMARK_COLS = 3;
const AUTO_ADVANCE_MS = 4500;

export function WatermarkedPreview({
  images,
  alt,
}: {
  images: string[];
  alt: string;
}) {
  const [failed, setFailed] = useState<Record<number, boolean>>({});
  const [active, setActive] = useState(0);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);
  const usable = images.filter((_, i) => !failed[i]);
  const hasMultiple = usable.length > 1;

  const goTo = (index: number) => {
    if (index === active) return;
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const current = slideRefs.current[active];
    const next = slideRefs.current[index];

    if (prefersReducedMotion || !current || !next) {
      setActive(index);
      return;
    }

    gsap.set(next, { opacity: 0, scale: 1.04, zIndex: 2 });
    const tl = gsap.timeline({
      onComplete: () => setActive(index),
    });
    tl.to(current, { opacity: 0, duration: 0.6, ease: "power2.inOut" }, 0)
      .to(next, { opacity: 1, scale: 1, duration: 0.9, ease: "power2.out" }, 0);
  };

  useEffect(() => {
    if (!hasMultiple) return;
    const id = setInterval(() => {
      goTo((active + 1) % images.length);
    }, AUTO_ADVANCE_MS);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, hasMultiple]);

  return (
    <div
      className="relative aspect-[3/4] w-full select-none overflow-hidden border border-ink/10 bg-taupe/20"
      onContextMenu={(e) => e.preventDefault()}
    >
      {images.map((src, index) =>
        failed[index] ? null : (
          <div
            key={src + index}
            ref={(el) => {
              slideRefs.current[index] = el;
            }}
            className="absolute inset-0"
            style={{ opacity: index === active ? 1 : 0, zIndex: index === active ? 1 : 0 }}
          >
            {/* Sample images come from admin-controlled storage (eventually
                Cloudflare R2) whose hostname isn't known ahead of time, so
                next/image's remotePatterns allowlist would hard-crash the
                page on any new host - a plain <img> lets onError degrade
                gracefully instead. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={alt}
              className="absolute inset-0 h-full w-full object-cover"
              draggable={false}
              onError={() =>
                setFailed((prev) => ({ ...prev, [index]: true }))
              }
            />
          </div>
        )
      )}

      <div className="pointer-events-none absolute inset-0 z-[3] grid grid-rows-4 opacity-25">
        {Array.from({ length: WATERMARK_ROWS }).map((_, row) => (
          <div
            key={row}
            className="grid grid-cols-3 items-center"
            style={{ transform: "rotate(-24deg)" }}
          >
            {Array.from({ length: WATERMARK_COLS }).map((_, col) => (
              <span
                key={col}
                className="whitespace-nowrap font-mono text-xs uppercase tracking-[0.15em] text-cream mix-blend-difference"
              >
                Nick Cai · Sample
              </span>
            ))}
          </div>
        ))}
      </div>

      {hasMultiple && (
        <div className="absolute inset-x-0 bottom-4 z-[4] flex justify-center gap-2">
          {images.map((_, index) =>
            failed[index] ? null : (
              <button
                key={index}
                type="button"
                aria-label={`Slide ${index + 1}`}
                onClick={() => goTo(index)}
                className={`h-1.5 w-1.5 rounded-full transition-colors ${
                  index === active ? "bg-cream" : "bg-cream/40"
                }`}
              />
            )
          )}
        </div>
      )}
    </div>
  );
}
