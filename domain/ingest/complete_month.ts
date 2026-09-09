import { daysInMonth } from "../prayer/calendar";
import type { PrayerDay } from "../prayer/prayer";

const HHMM = /^\d{2}:\d{2}$/;

export function assertCompleteMonth(
  days: PrayerDay[],
  year: number,
  month: number
): void {
  const expected = daysInMonth(year, month);
  if (days.length !== expected) {
    throw new Error(
      `Month ${year}-${month} has ${days.length} days, expected ${expected}`
    );
  }

  days.forEach((day, index) => {
    const expectedIso = isoOn(year, month, index + 1);
    if (day.gregorian !== expectedIso) {
      throw new Error(
        `Day ${index + 1} gregorian is ${day.gregorian}, expected ${expectedIso}`
      );
    }
    if (!day.hijri.trim()) {
      throw new Error(`Day ${expectedIso} is missing hijri`);
    }
    for (const key of [
      "imsak",
      "subuh",
      "syuruk",
      "duha",
      "zuhur",
      "asar",
      "maghrib",
      "isya",
    ] as const) {
      if (!HHMM.test(day[key])) {
        throw new Error(`Day ${expectedIso} ${key} is not HH:mm: ${day[key]}`);
      }
    }
  });
}

function isoOn(year: number, month: number, day: number): string {
  const mm = month < 10 ? `0${month}` : String(month);
  const dd = day < 10 ? `0${day}` : String(day);
  return `${year}-${mm}-${dd}`;
}
