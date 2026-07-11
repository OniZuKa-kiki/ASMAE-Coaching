export type PodcastProgressSnapshot = {
  podcastId: string;
  slug: string;
  title: string;
  positionSeconds: number;
  durationSeconds: number;
  updatedAt: Date;
};

const MIN_RESUME_SECONDS = 8;
const COMPLETE_RATIO = 0.95;

export function isPodcastProgressResumable(
  positionSeconds: number,
  durationSeconds: number
): boolean {
  if (durationSeconds <= 0) return positionSeconds >= MIN_RESUME_SECONDS;
  const ratio = positionSeconds / durationSeconds;
  return positionSeconds >= MIN_RESUME_SECONDS && ratio < COMPLETE_RATIO;
}

export function formatListenTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds <= 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}
