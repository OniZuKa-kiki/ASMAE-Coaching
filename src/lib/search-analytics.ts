import "server-only";

import { SearchScope, type PrismaClient } from "@prisma/client";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/db";
import { normalizeSearchQuery } from "@/lib/search-utils";

export const SEARCH_POPULAR_LIMIT = 5;
export const SEARCH_SUGGESTIONS_MAX = 10;

export type SearchSuggestionsScope = "public" | "dashboard";

function toPrismaScope(scope: SearchSuggestionsScope): SearchScope {
  return scope === "dashboard" ? SearchScope.DASHBOARD : SearchScope.PUBLIC;
}

export async function getDefaultSearchQueries(
  scope: SearchSuggestionsScope
): Promise<string[]> {
  const t = await getTranslations("search");
  return scope === "dashboard"
    ? (t.raw("dashboardStaticQueries") as string[])
    : (t.raw("staticQueries") as string[]);
}

export async function recordSearchQuery(
  scope: SearchSuggestionsScope,
  rawQuery: string,
  userId?: string | null
): Promise<void> {
  const query = rawQuery.trim();
  const queryKey = normalizeSearchQuery(query);
  if (queryKey.length < 2) return;
  if (!isSearchAnalyticsReady()) return;

  try {
    await prisma.searchQueryStat.upsert({
    where: {
      scope_queryKey: {
        scope: toPrismaScope(scope),
        queryKey,
      },
    },
    create: {
      scope: toPrismaScope(scope),
      queryKey,
      query,
      userId: userId ?? null,
    },
    update: {
      query,
      searchCount: { increment: 1 },
      lastSearchedAt: new Date(),
      ...(userId ? { userId } : {}),
    },
  });
  } catch {
    // Client Prisma obsolète ou table absente — ignorer silencieusement
  }
}

export function isSearchAnalyticsReady(
  client: PrismaClient = prisma
): boolean {
  return typeof (client as PrismaClient & { searchQueryStat?: unknown })
    .searchQueryStat !== "undefined";
}

export async function getPopularSearchQueries(
  scope: SearchSuggestionsScope,
  limit = SEARCH_POPULAR_LIMIT
): Promise<string[]> {
  if (!isSearchAnalyticsReady()) return [];

  try {
    const rows = await prisma.searchQueryStat.findMany({
      where: { scope: toPrismaScope(scope) },
      orderBy: [{ searchCount: "desc" }, { lastSearchedAt: "desc" }],
      take: limit,
      select: { query: true, queryKey: true },
    });

    return rows.map((row) => row.query);
  } catch {
    return [];
  }
}

export type SearchAnalyticsRow = {
  query: string;
  searchCount: number;
  lastSearchedAt: Date;
};

export async function getSearchAnalyticsForAdmin(
  scope: SearchSuggestionsScope,
  limit = 20
): Promise<SearchAnalyticsRow[]> {
  if (!isSearchAnalyticsReady()) return [];

  try {
    return await prisma.searchQueryStat.findMany({
      where: { scope: toPrismaScope(scope) },
      orderBy: [{ searchCount: "desc" }, { lastSearchedAt: "desc" }],
      take: limit,
      select: {
        query: true,
        searchCount: true,
        lastSearchedAt: true,
      },
    });
  } catch {
    return [];
  }
}

export async function getSearchAnalyticsTotals(): Promise<{
  publicTotal: number;
  dashboardTotal: number;
}> {
  if (!isSearchAnalyticsReady()) {
    return { publicTotal: 0, dashboardTotal: 0 };
  }

  try {
    const [publicTotal, dashboardTotal] = await Promise.all([
      prisma.searchQueryStat.count({ where: { scope: SearchScope.PUBLIC } }),
      prisma.searchQueryStat.count({ where: { scope: SearchScope.DASHBOARD } }),
    ]);
    return { publicTotal, dashboardTotal };
  } catch {
    return { publicTotal: 0, dashboardTotal: 0 };
  }
}

export async function getMergedSearchSuggestions(
  scope: SearchSuggestionsScope
): Promise<{ queries: string[]; hasPopular: boolean }> {
  const defaults = await getDefaultSearchQueries(scope);
  const popular = await getPopularSearchQueries(scope);
  const seen = new Set(defaults.map((query) => normalizeSearchQuery(query)));
  const merged = [...defaults];
  let addedPopular = 0;

  for (const query of popular) {
    const key = normalizeSearchQuery(query);
    if (seen.has(key)) continue;
    merged.push(query);
    seen.add(key);
    addedPopular += 1;
    if (merged.length >= SEARCH_SUGGESTIONS_MAX) break;
  }

  return { queries: merged, hasPopular: addedPopular > 0 };
}
