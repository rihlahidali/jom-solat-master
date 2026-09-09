import { test } from "@japa/runner";
import {
  countdownCopy,
  getPrayerClock,
  isBeforeZuhur,
  isIsyaBeforeMidnight,
} from "../../domain/prayer/current_prayer";
import { buildThreeDayWindow } from "../../domain/prayer/day_schedule";
import { at, january2021 } from "./helpers";

function windowAt(now: Date, district: "brunei" | "tutong" | "belait" = "brunei") {
  const days = january2021();
  const daysByIso: Record<string, (typeof days)[0]> = {
    "2021-01-01": days[0],
    "2021-01-02": days[1],
    "2021-01-03": days[2],
  };
  return buildThreeDayWindow(daysByIso, now, district);
}

test.group("prayer clock", () => {
  test("before Imsak the current prayer is last night's Isya", ({ assert }) => {
    const now = at(2021, 1, 1, 0, 0);
    const today = windowAt(now)[0];
    const clock = getPrayerClock(today.prayers, now);
    assert.equal(clock.currentPrayer, "Isya");
    assert.equal(clock.currentPrayerIndex, 7);
    assert.equal(clock.nextPrayer.name, "Imsak");
    assert.equal(clock.nextPrayer.index, 0);
    assert.isFalse(clock.isIn);
    assert.include(clock.countdown, "jam");
    assert.include(countdownCopy(clock), "Imsak");
  });

  test("matches the Cypress midnight countdown wording", ({ assert }) => {
    const now = at(2021, 1, 1, 0, 0);
    const clock = getPrayerClock(windowAt(now)[0].prayers, now);
    assert.include(clock.countdown, "5 jam");
  });

  test("Zuhur is current at 12:30", ({ assert }) => {
    const now = at(2021, 1, 1, 12, 30);
    const clock = getPrayerClock(windowAt(now)[0].prayers, now);
    assert.equal(clock.currentPrayer, "Zuhur");
    assert.equal(clock.nextPrayer.name, "Asar");
    assert.isFalse(isBeforeZuhur(clock));
  });

  test("marks isIn on the prayer's exact minute", ({ assert }) => {
    const now = at(2021, 1, 1, 12, 25);
    const clock = getPrayerClock(windowAt(now)[0].prayers, now);
    assert.equal(clock.currentPrayer, "Zuhur");
    assert.isTrue(clock.isIn);
    assert.equal(countdownCopy(clock), "Sudah masuk waktu Zuhur");
  });

  test("warns in the last 15 minutes before the next prayer", ({ assert }) => {
    const now = at(2021, 1, 1, 4, 41);
    const clock = getPrayerClock(windowAt(now)[0].prayers, now);
    assert.equal(clock.nextPrayer.name, "Imsak");
    assert.isTrue(clock.isWarning);
  });

  test("after Isya next prayer is tomorrow's Imsak", ({ assert }) => {
    const now = at(2021, 1, 1, 20, 0);
    const today = windowAt(now)[0];
    assert.equal(today.prayers.length, 10);
    assert.equal(today.prayers[8].name, "Imsak");
    assert.equal(today.prayers[8].time.getDate(), 2);
    const clock = getPrayerClock(today.prayers, now);
    assert.equal(clock.currentPrayer, "Isya");
    assert.equal(clock.nextPrayer.name, "Imsak");
    assert.equal(clock.nextPrayer.index, 8);
    assert.isTrue(isIsyaBeforeMidnight(clock, now));
  });

  test("applies Belait +3 to Imsak", ({ assert }) => {
    const now = at(2021, 1, 1, 0, 0);
    const today = windowAt(now, "belait")[0];
    assert.equal(today.prayers[0].time.getMinutes(), 58);
  });
});
