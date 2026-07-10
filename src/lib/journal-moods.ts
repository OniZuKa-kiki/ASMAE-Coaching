export const journalMoods = [
  { id: "happy", emoji: "😊", label: "بخير" },
  { id: "neutral", emoji: "😐", label: "محايدة" },
  { id: "low", emoji: "😔", label: "متعبة" },
] as const;

export type JournalMoodId = (typeof journalMoods)[number]["id"];

const moodById = Object.fromEntries(
  journalMoods.map((mood) => [mood.id, mood])
) as Record<JournalMoodId, (typeof journalMoods)[number]>;

export function isJournalMoodId(value: string): value is JournalMoodId {
  return journalMoods.some((mood) => mood.id === value);
}

export function normalizeJournalMood(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  if (isJournalMoodId(trimmed)) return trimmed;
  return trimmed;
}

export function getJournalMoodDisplay(mood: string | null | undefined): {
  emoji: string | null;
  label: string;
} | null {
  if (!mood?.trim()) return null;
  if (isJournalMoodId(mood)) {
    const item = moodById[mood];
    return { emoji: item.emoji, label: item.label };
  }
  return { emoji: null, label: mood };
}
