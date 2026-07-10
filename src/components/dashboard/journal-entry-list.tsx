"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { JournalMoodBadge } from "@/components/dashboard/journal-mood-badge";
import { ContentFilterBar } from "@/components/content/content-filter-bar";
import { Card } from "@/components/ui/card";
import { dashboardContent } from "@/lib/constants";
import { getJournalMoodDisplay, journalMoods } from "@/lib/journal-moods";
import { formatDate } from "@/lib/utils";

const content = dashboardContent.journal;

export type JournalEntryItem = {
  id: string;
  content: string;
  mood: string | null;
  createdAt: string;
};

type JournalEntryListProps = {
  entries: JournalEntryItem[];
};

function normalizeSearch(value: string) {
  return value.trim().toLowerCase();
}

export function JournalEntryList({ entries }: JournalEntryListProps) {
  const [search, setSearch] = useState("");
  const [mood, setMood] = useState("all");
  const [sort, setSort] = useState("recent");

  const query = normalizeSearch(search);

  const filteredEntries = useMemo(() => {
    let items = entries.filter((entry) => {
      if (mood === "none" && entry.mood) return false;
      if (mood !== "all" && mood !== "none" && entry.mood !== mood) return false;

      if (!query) return true;
      const moodDisplay = getJournalMoodDisplay(entry.mood);
      const haystack = `${entry.content} ${moodDisplay?.label ?? ""}`.toLowerCase();
      return haystack.includes(query);
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
  }, [entries, mood, query, sort]);

  return (
    <>
      <ContentFilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder={content.searchPlaceholder}
        filters={[
          {
            id: "mood",
            label: content.moodLabel,
            value: mood,
            onChange: setMood,
            options: [
              { value: "all", label: content.moodAll },
              { value: "none", label: content.moodNone },
              ...journalMoods.map((item) => ({
                value: item.id,
                label: `${item.emoji} ${item.label}`,
              })),
            ],
          },
          {
            id: "sort",
            label: content.sortLabel,
            value: sort,
            onChange: setSort,
            options: [
              { value: "recent", label: content.sortRecent },
              { value: "oldest", label: content.sortOldest },
            ],
          },
        ]}
        resultsCount={filteredEntries.length}
        resultsLabel={content.resultsCount(filteredEntries.length)}
      />

      {filteredEntries.length === 0 ? (
        <Card className="py-12 text-center">
          <p className="text-text/70">{content.noResults}</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredEntries.map((entry) => (
            <Card key={entry.id}>
              <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs text-text/60">
                  {formatDate(new Date(entry.createdAt))}
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
                  {content.edit}
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
