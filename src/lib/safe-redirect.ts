import { siteConfig } from "@/lib/constants";

/**
 * Valide une URL de redirection interne (évite les open redirects).
 * Préfère les chemins relatifs (/dashboard) aux URLs complètes.
 */
export function getSafeRedirectUrl(
  redirectUrl: string | undefined | null,
  fallback = "/dashboard"
): string {
  if (!redirectUrl?.trim()) return fallback;

  const trimmed = redirectUrl.trim();

  if (trimmed.startsWith("/") && !trimmed.startsWith("//")) {
    return trimmed;
  }

  try {
    const base = siteConfig.url.replace(/\/$/, "");
    const parsed = new URL(trimmed, base);

    const allowedOrigin = new URL(base).origin;
    if (parsed.origin !== allowedOrigin) {
      if (
        process.env.NODE_ENV === "development" &&
        (parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1")
      ) {
        return `${parsed.pathname}${parsed.search}${parsed.hash}`;
      }
      return fallback;
    }

    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return fallback;
  }
}
