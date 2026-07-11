export const journalMoods = [
  { id: "happy", emoji: "😊" },
  { id: "neutral", emoji: "😐" },
  { id: "low", emoji: "😔" },
] as const;

export type JournalMoodId = (typeof journalMoods)[number]["id"];

export function isJournalMoodId(value: string): value is JournalMoodId {
  return journalMoods.some((mood) => mood.id === value);
}

export function normalizeJournalMood(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  if (isJournalMoodId(trimmed)) return trimmed;
  return trimmed;
}
