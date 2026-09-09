import { isFirstHalfNight } from "./current_prayer";

export function displayHijri(
  hijri: string,
  currentPrayerIndex: number,
  now: Date
): string {
  if (!(currentPrayerIndex > 5 && isFirstHalfNight(now))) {
    return hijri;
  }

  const match = hijri.match(/[0-9]+/m);
  if (!match) {
    return hijri;
  }

  const nextDay = Number(match[0]) + 1;
  const nextDate = hijri.replace(/[0-9]+/m, String(nextDay));
  return nextDay < 10 ? `0${nextDate}` : nextDate;
}
