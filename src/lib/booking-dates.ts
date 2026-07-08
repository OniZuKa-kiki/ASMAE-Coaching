import { addDays } from "date-fns";

/** Génère N jours ouvrables (lun-sam), sans doublons */
export function getBookableDates(count = 14): Date[] {
  const dates: Date[] = [];
  let cursor = addDays(new Date(), 1);

  while (dates.length < count) {
    if (cursor.getDay() !== 0) {
      dates.push(new Date(cursor));
    }
    cursor = addDays(cursor, 1);
  }

  return dates;
}
