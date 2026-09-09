import type { DayPeriod } from "./prayer";

function pad2(value: number): string {
  return value < 10 ? `0${value}` : String(value);
}

export function formatHHmm(hours: number, minutes: number): string {
  return `${pad2(hours)}:${pad2(minutes)}`;
}

/**
 * Port of `$prasePrayerTime`: KHEU strings like `4.55` / `12.25` with an am/pm column.
 */
export function parseKheuClock(
  raw: string,
  period: DayPeriod
): { hours: number; minutes: number } {
  let clock = raw.trim().replace(":", ".");
  if (clock.length < 5) {
    clock = `0${clock}`;
  }

  let hours = Number(clock.substring(0, 2));
  const minutes = Number(clock.substring(3, 5));

  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    throw new Error(`Invalid prayer clock: ${raw}`);
  }

  if (period === "pm" && hours < 12) {
    hours += 12;
  }

  return { hours, minutes };
}

export function parseKheuToHHmm(raw: string, period: DayPeriod): string {
  const { hours, minutes } = parseKheuClock(raw, period);
  return formatHHmm(hours, minutes);
}

export function parseHHmm(value: string): { hours: number; minutes: number } {
  const match = /^(\d{2}):(\d{2})$/.exec(value);
  if (!match) {
    throw new Error(`Expected HH:mm, got: ${value}`);
  }
  return { hours: Number(match[1]), minutes: Number(match[2]) };
}

export function applyClockToDate(
  day: Date,
  hours: number,
  minutes: number
): Date {
  const next = new Date(day.getTime());
  next.setHours(hours, minutes, 0, 0);
  return next;
}

export function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60 * 1000);
}

export function formatDisplay12h(time: Date, period: DayPeriod): string {
  let hour = time.getHours();
  const minute = time.getMinutes();

  if (hour > 12) {
    hour -= 12;
  }

  return `${pad2(hour)}:${pad2(minute)} ${period}`;
}
