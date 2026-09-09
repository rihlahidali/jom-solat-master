import { test } from "@japa/runner";
import { assertCompleteMonth } from "../../domain/ingest/complete_month";
import {
  parseKheuTsv,
  prayerDayFromLegacyRow,
  toIsoDate,
} from "../../domain/ingest/parse_kheu_table";
import { daysInMonth } from "../../domain/prayer/calendar";
import type { PrayerDay } from "../../domain/prayer/prayer";

test.group("parseKheuTsv", () => {
  test("parses a KHEU tab row into 24h times", ({ assert }) => {
    const tsv =
      "1/1/2021\t17 Jamadilawal 1442\t4:55\t5:05\t6:28\t6:53\t12:25\t3:47\t6:19\t7:34";
    const [day] = parseKheuTsv(tsv);
    assert.equal(day.gregorian, "2021-01-01");
    assert.equal(day.hijri, "17 Jamadilawal 1442");
    assert.equal(day.subuh, "05:05");
    assert.equal(day.asar, "15:47");
  });

  test("rejects short rows", ({ assert }) => {
    assert.throws(() => parseKheuTsv("1/1/2021\t17 Jamadilawal"), /expected 10/);
  });
});

test.group("toIsoDate", () => {
  test("reads TSV dates as day/month/year", ({ assert }) => {
    assert.equal(toIsoDate("2/1/2021"), "2021-01-02");
  });

  test("reads SharePoint DateTime as month/day/year", ({ assert }) => {
    assert.equal(toIsoDate("1/2/2024", "mdy"), "2024-01-02");
    assert.equal(toIsoDate("1/31/2024", "mdy"), "2024-01-31");
    assert.throws(() => toIsoDate("1/31/2024"), /Invalid date/);
  });
});

test.group("assertCompleteMonth", () => {
  test("accepts a full January", ({ assert }) => {
    const days = Array.from({ length: 31 }, (_, index) =>
      fakeDay(2021, 1, index + 1)
    );
    assert.doesNotThrow(() => assertCompleteMonth(days, 2021, 1));
  });

  test("rejects February with 31 days", ({ assert }) => {
    const days = Array.from({ length: 31 }, (_, index) =>
      fakeDay(2021, 2, Math.min(index + 1, 28))
    );
    assert.throws(() => assertCompleteMonth(days, 2021, 2), /expected 28/);
    assert.equal(daysInMonth(2021, 2), 28);
  });

  test("legacy fixture row maps through the same parser", ({ assert }) => {
    const day = prayerDayFromLegacyRow({
      Date: "1/1/2021",
      Tarikh: "17 Jamadilawal 1442",
      Imsak: "4.55",
      Subuh: "5.05",
      Syuruk: "6.28",
      Duha: "6.53",
      Zuhur: "12.25",
      Asar: "3.47",
      Maghrib: "6.19",
      Isya: "7.34",
    });
    assert.equal(day.imsak, "04:55");
  });
});

function fakeDay(year: number, month: number, day: number): PrayerDay {
  const mm = month < 10 ? `0${month}` : String(month);
  const dd = day < 10 ? `0${day}` : String(day);
  return {
    gregorian: `${year}-${mm}-${dd}`,
    hijri: `${day} Dummy 1442`,
    imsak: "04:55",
    subuh: "05:05",
    syuruk: "06:28",
    duha: "06:53",
    zuhur: "12:25",
    asar: "15:47",
    maghrib: "18:19",
    isya: "19:34",
  };
}
