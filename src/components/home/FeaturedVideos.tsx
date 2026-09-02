import Image from "next/image";
import { Play } from "lucide-react";
import { useTranslations } from "next-intl";
import type { FeaturedVideo } from "@prisma/client";
import { getYoutubeThumbnail } from "@/lib/youtube";

export function FeaturedVideos({ videos }: { videos: FeaturedVideo[] }) {
  const t = useTranslations("featuredVideos");
  if (videos.length === 0) return null;

  const sorted = [...videos].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <section className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
      <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-ink/50">
        {t("title")}
      </h2>
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {sorted.map((video) => {
          const thumbnail = getYoutubeThumbnail(video.youtubeUrl);
          return (
            <a
              key={video.id}
              href={video.youtubeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group block"
            >
              <div className="relative aspect-video overflow-hidden border border-ink/10 bg-taupe/20">
                {thumbnail && (
                  <Image
                    src={thumbnail}
                    alt={video.title}
                    fill
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover grayscale transition-[filter,transform] duration-500 ease-out group-hover:scale-105 group-hover:grayscale-0 motion-reduce:transition-none"
                  />
                )}
                <div className="absolute inset-0 flex items-center justify-center bg-ink/25 opacity-0 transition-opacity duration-300 group-hover:opacity-100 motion-reduce:transition-none">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-cream text-ink">
                    <Play className="h-4 w-4 translate-x-[1px]" fill="currentColor" />
                  </span>
                </div>
              </div>
              <p className="relative mt-3 inline-block font-body text-sm text-ink/80">
                {video.title}
                <span
                  aria-hidden
                  className="absolute -bottom-0.5 left-0 h-px w-full origin-left scale-x-0 bg-ink/60 transition-transform duration-300 ease-out group-hover:scale-x-100 motion-reduce:transition-none"
                />
              </p>
            </a>
          );
        })}
      </div>
    </section>
  );
}
