import arMessages from "../../messages/ar.json";
import frMessages from "../../messages/fr.json";
import type { AppLocale } from "@/i18n/routing";
import {
  journalMoods,
  isJournalMoodId,
  type JournalMoodId,
} from "@/lib/journal-moods";

type MoodOptionsCopy = typeof arMessages.dashboard.mood.options;

function moodOptionsCopy(locale: AppLocale): MoodOptionsCopy {
  return locale === "fr"
    ? frMessages.dashboard.mood.options
    : arMessages.dashboard.mood.options;
}

export function getJournalMoodLabel(
  moodId: JournalMoodId,
  locale: AppLocale
): string {
  return moodOptionsCopy(locale)[moodId];
}

export function getJournalMoodDisplay(
  mood: string | null | undefined,
  locale: AppLocale
): { emoji: string | null; label: string } | null {
  if (!mood?.trim()) return null;
  if (isJournalMoodId(mood)) {
    const item = journalMoods.find((entry) => entry.id === mood);
    if (!item) return null;
    return { emoji: item.emoji, label: getJournalMoodLabel(mood, locale) };
  }
  return { emoji: null, label: mood };
}

export function getJournalMoodOptions(locale: AppLocale) {
  const copy = moodOptionsCopy(locale);
  return journalMoods.map((mood) => ({
    id: mood.id,
    emoji: mood.emoji,
    label: copy[mood.id],
  }));
}
