import { addDays, formatGregorianLabel, toIsoDate, weekdayName } from "./calendar";
import { districtOffsetMinutes } from "./district";
import {
  addMinutes,
  applyClockToDate,
  parseHHmm,
} from "./parse_time";
import {
  PRAYER_NAMES,
  PRAYER_PERIOD,
  type DaySchedule,
  type DistrictId,
  type PrayerDay,
  type PrayerName,
  type TimedPrayer,
  prayerDayClock,
} from "./prayer";

export function scheduleDay(
  day: PrayerDay,
  onDate: Date,
  district: DistrictId
): DaySchedule {
  const offset = districtOffsetMinutes(district);
  const prayers: TimedPrayer[] = PRAYER_NAMES.map((name) =>
    timedPrayer(name, day, onDate, offset)
  );

  return {
    weekday: weekdayName(onDate.getDay()),
    gregorianLabel: formatGregorianLabel(onDate),
    hijri: day.hijri,
    prayers,
  };
}

export function timedPrayer(
  name: PrayerName,
  day: PrayerDay,
  onDate: Date,
  offsetMinutes: number
): TimedPrayer {
  const { hours, minutes } = parseHHmm(prayerDayClock(day, name));
  return {
    name,
    period: PRAYER_PERIOD[name],
    time: addMinutes(applyClockToDate(onDate, hours, minutes), offsetMinutes),
  };
}

export function attachNextImsakSubuh(
  today: DaySchedule,
  tomorrow: DaySchedule
): DaySchedule {
  return {
    ...today,
    prayers: [...today.prayers, tomorrow.prayers[0]!, tomorrow.prayers[1]!],
  };
}

export function buildThreeDayWindow(
  daysByIso: Record<string, PrayerDay>,
  now: Date,
  district: DistrictId
): DaySchedule[] {
  const schedules: DaySchedule[] = [];

  for (let offset = 0; offset < 3; offset += 1) {
    const date = addDays(now, offset);
    const iso = toIsoDate(date);
    const day = daysByIso[iso];
    if (!day) {
      throw new Error(`Missing prayer day ${iso}`);
    }
    schedules.push(scheduleDay(day, date, district));
  }

  schedules[0] = attachNextImsakSubuh(schedules[0]!, schedules[1]!);
  return schedules;
}
