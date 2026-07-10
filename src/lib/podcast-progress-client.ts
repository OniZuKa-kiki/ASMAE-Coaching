const STORAGE_PREFIX = "asmae-podcast-progress:";

export type StoredPodcastProgress = {
  positionSeconds: number;
  durationSeconds: number;
};

export function getLocalPodcastProgress(
  slug: string
): StoredPodcastProgress | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${slug}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredPodcastProgress;
    if (
      !Number.isFinite(parsed.positionSeconds) ||
      !Number.isFinite(parsed.durationSeconds)
    ) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function setLocalPodcastProgress(
  slug: string,
  progress: StoredPodcastProgress
) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(`${STORAGE_PREFIX}${slug}`, JSON.stringify(progress));
  } catch {
    // ignore quota errors
  }
}

export function clearLocalPodcastProgress(slug: string) {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(`${STORAGE_PREFIX}${slug}`);
  } catch {
    // ignore
  }
}

export function formatListenTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds <= 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}
