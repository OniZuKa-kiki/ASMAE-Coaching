export type MediaDurationKind = "audio" | "video";

export function minutesFromSeconds(seconds: number): number {
  if (!Number.isFinite(seconds) || seconds <= 0) return 0;
  return Math.max(1, Math.ceil(seconds / 60));
}

export function probeMediaDurationMinutes(
  url: string,
  kind: MediaDurationKind
): Promise<number | null> {
  const trimmed = url.trim();
  if (!trimmed) return Promise.resolve(null);

  return new Promise((resolve) => {
    const element = document.createElement(kind);
    let settled = false;

    const finish = (value: number | null) => {
      if (settled) return;
      settled = true;
      element.removeAttribute("src");
      element.load();
      resolve(value);
    };

    const timeout = window.setTimeout(() => finish(null), 12_000);

    element.preload = "metadata";
    element.crossOrigin = "anonymous";

    element.onloadedmetadata = () => {
      window.clearTimeout(timeout);
      finish(minutesFromSeconds(element.duration));
    };

    element.onerror = () => {
      window.clearTimeout(timeout);
      finish(null);
    };

    element.src = trimmed;
    element.load();
  });
}
