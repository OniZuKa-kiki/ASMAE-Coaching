"use client";

import { useLocale } from "next-intl";
import { getJournalMoodDisplay } from "@/lib/journal-moods-i18n";
import type { AppLocale } from "@/i18n/routing";

export function JournalMoodBadge({ mood }: { mood: string | null }) {
  const locale = useLocale() as AppLocale;
  const display = getJournalMoodDisplay(mood, locale);
  if (!display) return null;

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
      {display.emoji ? (
        <span aria-hidden>{display.emoji}</span>
      ) : null}
      <span>{display.label}</span>
    </span>
  );
}
