export const PRAYER_NAMES = [
  "Imsak",
  "Subuh",
  "Syuruk",
  "Duha",
  "Zuhur",
  "Asar",
  "Maghrib",
  "Isya",
] as const;

export type PrayerName = (typeof PRAYER_NAMES)[number];

export type DayPeriod = "am" | "pm";

export const PRAYER_PERIOD: Record<PrayerName, DayPeriod> = {
  Imsak: "am",
  Subuh: "am",
  Syuruk: "am",
  Duha: "am",
  Zuhur: "pm",
  Asar: "pm",
  Maghrib: "pm",
  Isya: "pm",
};

export type DistrictId = "brunei" | "tutong" | "belait";

export type PrayerDay = {
  gregorian: string;
  hijri: string;
  imsak: string;
  subuh: string;
  syuruk: string;
  duha: string;
  zuhur: string;
  asar: string;
  maghrib: string;
  isya: string;
};

export type TimedPrayer = {
  name: PrayerName;
  period: DayPeriod;
  time: Date;
};

export type DaySchedule = {
  weekday: string;
  gregorianLabel: string;
  hijri: string;
  prayers: TimedPrayer[];
};

export type NextPrayer = {
  name: PrayerName;
  index: number;
};

export type PrayerClock = {
  currentPrayer: PrayerName;
  currentPrayerIndex: number;
  nextPrayer: NextPrayer;
  isIn: boolean;
  isWarning: boolean;
  countdown: string;
};

export function prayerDayClock(day: PrayerDay, name: PrayerName): string {
  switch (name) {
    case "Imsak":
      return day.imsak;
    case "Subuh":
      return day.subuh;
    case "Syuruk":
      return day.syuruk;
    case "Duha":
      return day.duha;
    case "Zuhur":
      return day.zuhur;
    case "Asar":
      return day.asar;
    case "Maghrib":
      return day.maghrib;
    case "Isya":
      return day.isya;
  }
}
