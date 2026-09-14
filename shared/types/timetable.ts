import type { PrayerDay } from "../../domain/prayer/prayer";

export type TimetableSource = "kheu" | "admin";

export type TimetableYear = {
  year: number;
  version: number;
  ingestedAt: string | null;
  source: TimetableSource | null;
  months: Partial<Record<string, PrayerDay[]>>;
};

export type MonthDays = PrayerDay[];
