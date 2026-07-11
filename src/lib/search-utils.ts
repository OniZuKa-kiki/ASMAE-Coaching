export type SearchResultType =
  | "SERVICE"
  | "COURSE"
  | "BLOG_POST"
  | "PODCAST"
  | "GOAL"
  | "JOURNAL"
  | "LESSON"
  | "BOOKING";

export type SearchResultItem = {
  id: string;
  type: SearchResultType;
  title: string;
  description: string | null;
  href: string;
  meta: string | null;
};

export type SearchResultsGroup = {
  type: SearchResultType;
  items: SearchResultItem[];
};

export const SEARCH_MIN_QUERY_LENGTH = 2;

/** Retire les voyelles courtes, tanwîn et autres signes diacritiques arabes. */
export function stripArabicDiacritics(value: string): string {
  return value.replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, "");
}

/** Normalise le texte arabe pour une recherche tolérante (ا/أ/إ/آ, ى/ي, ة/ه…). */
export function normalizeArabicForSearch(value: string): string {
  return stripArabicDiacritics(value)
    .replace(/[أإآٱ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/ئ/g, "ي")
    .replace(/ؤ/g, "و")
    .replace(/\u0640/g, "")
    .toLowerCase()
    .trim();
}

export function normalizeSearchQuery(value: string): string {
  return normalizeArabicForSearch(value.trim());
}

export function matchesArabicSearch(
  haystack: string,
  needle: string
): boolean {
  const normalizedNeedle = normalizeSearchQuery(needle);
  if (!normalizedNeedle) return true;
  return normalizeArabicForSearch(haystack).includes(normalizedNeedle);
}

export function filterByArabicSearch<T>(
  items: T[],
  query: string,
  getters: Array<(item: T) => string | null | undefined>
): T[] {
  const trimmed = query.trim();
  if (!trimmed) return items;
  return items.filter((item) =>
    getters.some((get) => matchesArabicSearch(get(item) ?? "", trimmed))
  );
}

export function isSearchQueryValid(query: string): boolean {
  return normalizeSearchQuery(query).length >= SEARCH_MIN_QUERY_LENGTH;
}

export function groupSearchResults(
  items: SearchResultItem[]
): SearchResultsGroup[] {
  const order: SearchResultType[] = [
    "SERVICE",
    "COURSE",
    "PODCAST",
    "BLOG_POST",
    "BOOKING",
    "GOAL",
    "JOURNAL",
    "LESSON",
  ];

  const grouped = new Map<SearchResultType, SearchResultItem[]>();
  for (const item of items) {
    const list = grouped.get(item.type) ?? [];
    list.push(item);
    grouped.set(item.type, list);
  }

  return order
    .filter((type) => grouped.has(type))
    .map((type) => ({ type, items: grouped.get(type)! }));
}
