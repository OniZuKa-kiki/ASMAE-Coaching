import { prisma } from "@/lib/db";
import { getJournalMoodDisplay, isJournalMoodId } from "@/lib/journal-moods";
import { getOrCreateUser } from "@/lib/user";

export function getTodayCheckInDate(): Date {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

function getTodayBounds() {
  const dayStart = getTodayCheckInDate();
  const dayEnd = new Date(dayStart);
  dayEnd.setHours(23, 59, 59, 999);
  return { dayStart, dayEnd };
}

export type MoodCheckInView = {
  mood: string;
  note: string | null;
  emoji: string | null;
  label: string;
};

export async function getUserTodayMoodCheckIn(): Promise<MoodCheckInView | null> {
  const user = await getOrCreateUser();
  if (!user) return null;

  const entry = await prisma.moodCheckIn.findUnique({
    where: {
      userId_checkInDate: {
        userId: user.id,
        checkInDate: getTodayCheckInDate(),
      },
    },
  });

  if (!entry) return null;

  const display = getJournalMoodDisplay(entry.mood);
  if (!display) return null;

  return {
    mood: entry.mood,
    note: entry.note,
    emoji: display.emoji,
    label: display.label,
  };
}

export type AdminMoodCheckInItem = {
  userId: string;
  clientName: string;
  mood: string;
  note: string | null;
  emoji: string | null;
  label: string;
};

export async function getTodayMoodCheckIns(): Promise<AdminMoodCheckInItem[]> {
  const { dayStart, dayEnd } = getTodayBounds();

  const entries = await prisma.moodCheckIn.findMany({
    where: {
      checkInDate: { gte: dayStart, lte: dayEnd },
    },
    include: { user: true },
    orderBy: { updatedAt: "desc" },
  });

  return entries.map((entry) => {
    const display = getJournalMoodDisplay(entry.mood);
    return {
      userId: entry.userId,
      clientName:
        [entry.user.firstName, entry.user.lastName].filter(Boolean).join(" ") ||
        "عميلة",
      mood: entry.mood,
      note: entry.note,
      emoji: display?.emoji ?? null,
      label: display?.label ?? entry.mood,
    };
  });
}

export function parseMoodCheckInInput(moodRaw: string, noteRaw: string) {
  const mood = moodRaw.trim();
  const note = noteRaw.trim();
  if (!isJournalMoodId(mood)) {
    throw new Error("يرجى اختيار مزاج صالح.");
  }
  return {
    mood,
    note: note || null,
  };
}
