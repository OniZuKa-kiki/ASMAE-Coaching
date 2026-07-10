"use client";

import * as React from "react";
import { Pause, Play } from "lucide-react";
import {
  clearLocalPodcastProgress,
  formatListenTime,
  getLocalPodcastProgress,
  setLocalPodcastProgress,
} from "@/lib/podcast-progress-client";
import { podcastsPageContent } from "@/lib/constants";

type AudioPlayerProps = {
  src: string;
  title: string;
  podcastSlug?: string;
  initialPosition?: number;
  persistProgress?: boolean;
};

export function AudioPlayer({
  src,
  title,
  podcastSlug,
  initialPosition = 0,
  persistProgress = false,
}: AudioPlayerProps) {
  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  const lastSavedAt = React.useRef(0);
  const resumeApplied = React.useRef(false);
  const [ready, setReady] = React.useState(false);
  const [playing, setPlaying] = React.useState(false);
  const [current, setCurrent] = React.useState(0);
  const [duration, setDuration] = React.useState(0);
  const [resumeLabel, setResumeLabel] = React.useState<string | null>(null);
  const [loadError, setLoadError] = React.useState<string | null>(null);

  const saveProgress = React.useCallback(
    async (positionSeconds: number, durationSeconds: number) => {
      if (!persistProgress || !podcastSlug || durationSeconds <= 0) return;

      setLocalPodcastProgress(podcastSlug, {
        positionSeconds,
        durationSeconds,
      });

      try {
        await fetch(`/api/podcasts/${podcastSlug}/progress`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ positionSeconds, durationSeconds }),
        });
      } catch {
        // offline or guest — localStorage already updated
      }
    },
    [persistProgress, podcastSlug]
  );

  React.useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !src) return;

    resumeApplied.current = false;
    setReady(false);
    setCurrent(0);
    setDuration(0);
    setResumeLabel(null);
    setLoadError(null);

    const applyLoadedState = () => {
      const audioDuration = Number.isFinite(audio.duration) ? audio.duration : 0;
      setDuration(audioDuration);

      if (!resumeApplied.current) {
        const local =
          podcastSlug && persistProgress
            ? getLocalPodcastProgress(podcastSlug)
            : null;
        const resumeAt = Math.max(
          initialPosition,
          local?.positionSeconds ?? 0
        );

        if (resumeAt > 8 && audioDuration > 0 && resumeAt < audioDuration * 0.95) {
          audio.currentTime = resumeAt;
          setCurrent(resumeAt);
          setResumeLabel(
            podcastsPageContent.continueListening.resumeFrom(
              formatListenTime(resumeAt)
            )
          );
        }
        resumeApplied.current = true;
      }

      setReady(true);
    };

    const onLoaded = () => applyLoadedState();

    const onError = () => {
      setReady(false);
      setLoadError("تعذّر تحميل الملف الصوتي. تحققي من الرابط أو أعيدي المحاولة لاحقًا.");
    };

    const onTime = () => {
      const position = audio.currentTime || 0;
      setCurrent(position);

      if (!persistProgress || !podcastSlug) return;
      const now = Date.now();
      if (now - lastSavedAt.current < 5000) return;
      lastSavedAt.current = now;

      const audioDuration = Number.isFinite(audio.duration) ? audio.duration : 0;
      if (audioDuration > 0) {
        void saveProgress(position, audioDuration);
      }
    };

    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onEnded = () => {
      setPlaying(false);
      if (podcastSlug) clearLocalPodcastProgress(podcastSlug);
      if (persistProgress && podcastSlug && Number.isFinite(audio.duration)) {
        void saveProgress(audio.duration, audio.duration);
      }
    };

    audio.src = src;
    audio.load();

    audio.addEventListener("loadedmetadata", onLoaded);
    audio.addEventListener("durationchange", onLoaded);
    audio.addEventListener("error", onError);
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("ended", onEnded);

    if (audio.readyState >= HTMLMediaElement.HAVE_METADATA) {
      applyLoadedState();
    }

    return () => {
      audio.removeEventListener("loadedmetadata", onLoaded);
      audio.removeEventListener("durationchange", onLoaded);
      audio.removeEventListener("error", onError);
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("ended", onEnded);
    };
  }, [src, podcastSlug, initialPosition, persistProgress, saveProgress]);

  React.useEffect(() => {
    return () => {
      const audio = audioRef.current;
      if (!audio || !persistProgress || !podcastSlug) return;
      const audioDuration = Number.isFinite(audio.duration) ? audio.duration : 0;
      if (audioDuration > 0) {
        void saveProgress(audio.currentTime || 0, audioDuration);
      }
    };
  }, [persistProgress, podcastSlug, saveProgress]);

  const toggle = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      try {
        await audio.play();
      } catch {
        // autoplay restrictions
      }
    } else {
      audio.pause();
    }
  };

  const onSeek = (value: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = value;
    setCurrent(value);
    setResumeLabel(null);
  };

  const progressPercent =
    duration > 0 ? Math.min(100, Math.round((current / duration) * 100)) : 0;

  return (
    <div className="rounded-[20px] bg-card border border-border/50 p-6 shadow-soft">
      <p className="text-sm font-semibold text-heading mb-1">{title}</p>
      {resumeLabel ? (
        <p className="mb-3 text-xs font-medium text-primary">{resumeLabel}</p>
      ) : (
        <p className="mb-4 text-xs text-text/60">استماع</p>
      )}

      {loadError ? (
        <p className="mb-4 text-xs font-medium text-red-600">{loadError}</p>
      ) : null}

      <audio ref={audioRef} preload="metadata" />

      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={toggle}
          disabled={!ready}
          className="h-11 w-11 rounded-full bg-primary text-white flex items-center justify-center hover:bg-primary-hover transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          aria-label={playing ? "إيقاف مؤقت" : "تشغيل"}
        >
          {playing ? (
            <Pause className="w-5 h-5" />
          ) : (
            <Play className="w-5 h-5 ml-0.5" />
          )}
        </button>

        <div className="flex-1">
          <input
            type="range"
            min={0}
            max={Math.max(1, duration)}
            step={0.1}
            value={Math.min(current, duration || 0)}
            onChange={(e) => onSeek(Number(e.target.value))}
            disabled={!ready}
            className="w-full accent-[color:var(--color-primary)]"
            aria-label="التقدم في الحلقة"
            aria-valuenow={progressPercent}
          />
          <div className="mt-2 flex items-center justify-between text-xs text-text/70 tabular-nums">
            <span>{formatListenTime(current)}</span>
            <span>{formatListenTime(duration)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
