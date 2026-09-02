"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play, Volume2, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useAudioPlayerStore } from "@/lib/store/audio-player";

export function GlobalAudioPlayer() {
  const { currentTrackUrl, trackTitle, isPlaying, togglePlay, close } =
    useAudioPlayerStore();
  const t = useTranslations("audioPlayer");
  const audioRef = useRef<HTMLAudioElement>(null);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  }, [isPlaying, currentTrackUrl]);

  if (!currentTrackUrl) return null;

  const formatTime = (seconds: number) => {
    if (!Number.isFinite(seconds)) return "0:00";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60)
      .toString()
      .padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-ink/10 bg-ink text-cream">
      <audio
        ref={audioRef}
        src={currentTrackUrl}
        onTimeUpdate={(e) => setProgress(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
      />
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3 sm:px-6">
        <button
          type="button"
          aria-label={isPlaying ? t("pause") : t("play")}
          onClick={togglePlay}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brass text-ink"
        >
          {isPlaying ? (
            <Pause className="h-4 w-4" fill="currentColor" />
          ) : (
            <Play className="h-4 w-4 translate-x-[1px]" fill="currentColor" />
          )}
        </button>

        <div className="min-w-0 flex-1">
          <p className="truncate font-body text-sm text-cream">
            {trackTitle}
          </p>
          <div className="mt-1 hidden items-center gap-2 sm:flex">
            <span className="font-mono text-xs text-cream/60">
              {formatTime(progress)}
            </span>
            <input
              type="range"
              min={0}
              max={duration || 0}
              value={progress}
              onChange={(e) => {
                if (audioRef.current) {
                  audioRef.current.currentTime = Number(e.target.value);
                }
              }}
              className="h-1 flex-1 accent-brass"
            />
            <span className="font-mono text-xs text-cream/60">
              {formatTime(duration)}
            </span>
          </div>
        </div>

        <Volume2
          className="hidden h-4 w-4 shrink-0 text-cream/60 sm:block"
          strokeWidth={1.5}
        />

        <button
          type="button"
          aria-label={t("close")}
          onClick={close}
          className="shrink-0 text-cream/60 transition-colors hover:text-cream"
        >
          <X className="h-4 w-4" strokeWidth={1.5} />
        </button>
      </div>
    </div>
  );
}
