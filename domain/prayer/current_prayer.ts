import {
  differenceInMinutes,
  differenceInSeconds,
  formatDistance,
  formatDistanceStrict,
  isAfter,
  isBefore,
  subSeconds,
} from "date-fns";
import ms from "date-fns/locale/ms";
import type { PrayerClock, TimedPrayer } from "./prayer";

const CORE_PRAYER_COUNT = 8;
const WARNING_MINUTES = 15;

export function getPrayerClock(
  prayers: TimedPrayer[],
  now: Date,
  warningMinutes: number = WARNING_MINUTES
): PrayerClock {
  if (prayers.length === 0) {
    return {
      currentPrayer: "Imsak",
      currentPrayerIndex: 0,
      nextPrayer: { name: "Subuh", index: 1 },
      isIn: false,
      isWarning: false,
      countdown: "—",
    };
  }

  let currentPrayer = prayers[0]!.name;
  let currentPrayerIndex = 0;
  let nextIndex = 1;
  let isIn = false;

  const core = prayers.slice(0, CORE_PRAYER_COUNT);

  for (let index = 0; index < core.length; index += 1) {
    const prayer = core[index]!;
    const started = isAfter(now, subSeconds(prayer.time, 1));
    const sameMinute =
      prayer.time.getMinutes() === now.getMinutes() &&
      prayer.time.getHours() === now.getHours();

    if (started) {
      currentPrayer = prayer.name;
      currentPrayerIndex = index;
      nextIndex = index + 1;
      isIn = sameMinute;
    }

    if (isBefore(now, core[0]!.time)) {
      currentPrayer = "Isya";
      currentPrayerIndex = 7;
      nextIndex = 0;
      isIn = false;
    }
  }

  const nextPrayer = prayers[nextIndex];
  const nextTime = nextPrayer?.time ?? core[0]!.time;
  const countdown = formatCountdown(now, nextTime);
  const isWarning =
    differenceInSeconds(nextTime, now) < warningMinutes * 60 &&
    differenceInSeconds(nextTime, now) >= 0;

  return {
    currentPrayer,
    currentPrayerIndex,
    nextPrayer: {
      name: nextPrayer?.name ?? "Imsak",
      index: nextPrayer ? nextIndex : 0,
    },
    isIn,
    isWarning,
    countdown,
  };
}

export function formatCountdown(now: Date, nextTime: Date): string {
  if (differenceInMinutes(nextTime, now) < 60) {
    return formatDistanceStrict(now, nextTime, {
      roundingMethod: "ceil",
      locale: ms,
    });
  }

  return formatDistance(now, nextTime, {
    locale: ms,
  });
}

export function countdownCopy(clock: PrayerClock): string {
  if (clock.isIn) {
    return `Sudah masuk waktu ${clock.currentPrayer}`;
  }

  return `${clock.countdown} lagi kn masuk waktu ${clock.nextPrayer.name}`;
}

export function isIsyaBeforeMidnight(clock: PrayerClock, now: Date): boolean {
  return isFirstHalfNight(now) && clock.currentPrayer === "Isya";
}

export function isFirstHalfNight(now: Date): boolean {
  const hour = now.getHours();
  const minute = now.getMinutes();
  const second = now.getSeconds();
  if (hour < 18) {
    return false;
  }
  if (hour > 23) {
    return false;
  }
  if (hour === 23 && minute === 59 && second > 59) {
    return false;
  }
  return hour >= 18;
}

export function isBeforeZuhur(clock: PrayerClock): boolean {
  return clock.currentPrayerIndex < 4;
}
