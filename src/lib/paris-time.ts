const SITE_TZ = "Africa/Casablanca";

/** Date calendaire YYYY-MM-DD en fuseau Maroc (Casablanca). */
export function getParisYmd(date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: SITE_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function addDaysToYmd(ymd: string, days: number): string {
  const [year, month, day] = ymd.split("-").map(Number);
  const utc = new Date(Date.UTC(year, month - 1, day + days));
  return utc.toISOString().slice(0, 10);
}

export function getParisTomorrowYmd(date = new Date()): string {
  return addDaysToYmd(getParisYmd(date), 1);
}

export function getParisWeekStartYmd(date = new Date()): string {
  const ymd = getParisYmd(date);
  const [year, month, day] = ymd.split("-").map(Number);
  const utc = new Date(Date.UTC(year, month - 1, day));
  const weekday = utc.getUTCDay();
  const diffToMonday = weekday === 0 ? -6 : 1 - weekday;
  return addDaysToYmd(ymd, diffToMonday);
}
