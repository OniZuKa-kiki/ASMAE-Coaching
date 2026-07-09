/** Chemin interne Next.js (dossier src/app/admin) — ne pas exposer dans les URLs publiques */
export const ADMIN_INTERNAL_PATH = "/admin";

export function getAdminBasePath(): string {
  const raw = process.env.NEXT_PUBLIC_ADMIN_PATH?.trim();
  if (!raw) return ADMIN_INTERNAL_PATH;
  const path = raw.startsWith("/") ? raw : `/${raw}`;
  return path.replace(/\/$/, "") || ADMIN_INTERNAL_PATH;
}

export function adminUrl(subpath = ""): string {
  const base = getAdminBasePath();
  if (!subpath) return base;
  const normalized = subpath.startsWith("/") ? subpath : `/${subpath}`;
  return `${base}${normalized}`;
}

export function usesCustomAdminPath(): boolean {
  return getAdminBasePath() !== ADMIN_INTERNAL_PATH;
}

export function isAdminPublicPath(pathname: string): boolean {
  const base = getAdminBasePath();
  return pathname === base || pathname.startsWith(`${base}/`);
}

export function isAdminInternalPath(pathname: string): boolean {
  return (
    pathname === ADMIN_INTERNAL_PATH ||
    pathname.startsWith(`${ADMIN_INTERNAL_PATH}/`)
  );
}

export function toInternalAdminPath(publicPathname: string): string {
  const base = getAdminBasePath();
  if (!usesCustomAdminPath()) return publicPathname;
  if (publicPathname === base) return ADMIN_INTERNAL_PATH;
  if (publicPathname.startsWith(`${base}/`)) {
    return `${ADMIN_INTERNAL_PATH}${publicPathname.slice(base.length)}`;
  }
  return publicPathname;
}
