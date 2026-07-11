"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { JournalMoodBadge } from "@/components/dashboard/journal-mood-badge";
import { ContentFilterBar } from "@/components/content/content-filter-bar";
import { Card } from "@/components/ui/card";
import {
  ListScrollHint,
  ScrollableItemList,
} from "@/components/ui/scalable-list";
import type { AppLocale } from "@/i18n/routing";
import { getJournalMoodDisplay, getJournalMoodOptions } from "@/lib/journal-moods-i18n";
import { matchesArabicSearch } from "@/lib/search-utils";
import { formatDate } from "@/lib/utils";

export type JournalEntryItem = {
  id: string;
  content: string;
  mood: string | null;
  createdAt: string;
};

type JournalEntryListProps = {
  entries: JournalEntryItem[];
};

export function JournalEntryList({ entries }: JournalEntryListProps) {
  const locale = useLocale() as AppLocale;
  const t = useTranslations("dashboard.journal");
  const moodOptions = getJournalMoodOptions(locale);
  const [search, setSearch] = useState("");
  const [mood, setMood] = useState("all");
  const [sort, setSort] = useState("recent");

  const query = search.trim();

  const filteredEntries = useMemo(() => {
    let items = entries.filter((entry) => {
      if (mood === "none" && entry.mood) return false;
      if (mood !== "all" && mood !== "none" && entry.mood !== mood) return false;

      if (!query) return true;
      const moodDisplay = getJournalMoodDisplay(entry.mood, locale);
      const haystack = `${entry.content} ${moodDisplay?.label ?? ""}`;
      return matchesArabicSearch(haystack, query);
    });

    const sorted = [...items];
    switch (sort) {
      case "oldest":
        return sorted.sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      default:
        return sorted.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    }
  }, [entries, locale, mood, query, sort]);

  const resultsLabel =
    filteredEntries.length === 1
      ? t("resultsOne")
      : t("resultsMany", { count: filteredEntries.length });

  return (
    <>
      <ContentFilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder={t("searchPlaceholder")}
        filters={[
          {
            id: "mood",
            label: t("moodLabel"),
            value: mood,
            onChange: setMood,
            options: [
              { value: "all", label: t("moodAll") },
              { value: "none", label: t("moodNone") },
              ...moodOptions.map((item) => ({
                value: item.id,
                label: `${item.emoji} ${item.label}`,
              })),
            ],
          },
          {
            id: "sort",
            label: t("sortLabel"),
            value: sort,
            onChange: setSort,
            options: [
              { value: "recent", label: t("sortRecent") },
              { value: "oldest", label: t("sortOldest") },
            ],
          },
        ]}
        resultsCount={filteredEntries.length}
        resultsLabel={resultsLabel}
      />

      <ListScrollHint
        count={filteredEntries.length}
        className="mb-3 text-end sm:text-start"
      />

      {filteredEntries.length === 0 ? (
        <Card className="py-12 text-center">
          <p className="text-text/70">{t("noResults")}</p>
        </Card>
      ) : (
        <ScrollableItemList
          count={filteredEntries.length}
          stackGapClassName="space-y-4"
          maxHeightClassName="max-h-96 sm:max-h-[28rem]"
        >
          {filteredEntries.map((entry) => (
            <Card key={entry.id}>
              <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs text-text/60">
                  {formatDate(new Date(entry.createdAt), locale)}
                </p>
                <JournalMoodBadge mood={entry.mood} />
              </div>
              <p className="text-text whitespace-pre-wrap leading-relaxed">
                {entry.content}
              </p>
              <div className="mt-4">
                <Link
                  href={`/dashboard/journal/${entry.id}/edit`}
                  className="inline-flex rounded-full border border-border px-4 py-2 text-sm font-semibold text-heading hover:border-primary hover:text-primary transition-colors"
                >
                  {t("edit")}
                </Link>
              </div>
            </Card>
          ))}
        </ScrollableItemList>
      )}
    </>
  );
}
