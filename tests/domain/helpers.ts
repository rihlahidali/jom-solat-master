import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { prayerDayFromLegacyRow } from "../../domain/ingest/parse_kheu_table";
import type { PrayerDay } from "../../domain/prayer/prayer";

const here = dirname(fileURLToPath(import.meta.url));

export function january2021(): PrayerDay[] {
  const raw = JSON.parse(
    readFileSync(join(here, "fixtures/january_2021.json"), "utf8")
  ) as Record<string, string>[];
  return raw.map(prayerDayFromLegacyRow);
}

export function at(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  second = 0
): Date {
  return new Date(year, month - 1, day, hour, minute, second, 0);
}
