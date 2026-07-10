import { getJournalMoodDisplay } from "@/lib/journal-moods";

export function JournalMoodBadge({ mood }: { mood: string | null }) {
  const display = getJournalMoodDisplay(mood);
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
