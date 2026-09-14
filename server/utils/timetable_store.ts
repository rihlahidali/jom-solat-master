import { readFileSync, writeFileSync } from "node:fs";
import type { MonthDays, TimetableYear } from "../../shared/types/timetable";

const DATA_PATH = "server/data/timetable.json";
const BLOB_PATH = "timetable.json";

const hasBlobEnv =
  process.env.NETLIFY_BLOBS_SITE_ID &&
  process.env.NETLIFY_BLOBS_TOKEN;

let blobsClient: unknown | null = null;

async function getBlobs() {
  if (!blobsClient && hasBlobEnv) {
    const { getStore } = await import("@netlify/blobs");
    blobsClient = getStore({
      name: process.env.NETLIFY_BLOBS_CONTAINER ?? "timetable",
      siteID: process.env.NETLIFY_BLOBS_SITE_ID!,
      token: process.env.NETLIFY_BLOBS_TOKEN!,
    });
  }
  return blobsClient as {
    get: (key: string, opts?: { type?: string }) => Promise<string | undefined>;
    setJSON: (key: string, value: unknown) => Promise<void>;
  } | null;
}

export async function getTimetable(): Promise<TimetableYear> {
  if (hasBlobEnv) {
    const blobs = await getBlobs();
    const blob = await blobs?.get(BLOB_PATH, { type: "text" });
    if (blob) {
      return JSON.parse(blob) as TimetableYear;
    }
  }

  const raw = readFileSync(DATA_PATH, "utf-8");
  return JSON.parse(raw) as TimetableYear;
}

export async function replaceTimetable(year: TimetableYear): Promise<void> {
  const payload = `${JSON.stringify(year, null, 2)}\n`;

  if (hasBlobEnv) {
    const blobs = await getBlobs();
    await blobs?.setJSON(BLOB_PATH, JSON.parse(payload));
  }

  writeFileSync(DATA_PATH, payload, "utf-8");
}

export function replaceMonth(
  current: TimetableYear,
  month: number,
  days: MonthDays
): TimetableYear {
  const key = String(month);
  const existing = current.months[key];
  const identical =
    Array.isArray(existing) &&
    existing.length === days.length &&
    existing.every((d, i) => d.gregorian === days[i]!.gregorian);

  if (identical) {
    return current;
  }

  return {
    ...current,
    months: { ...current.months, [key]: days },
    version: current.version + 1,
    ingestedAt: new Date().toISOString(),
  };
}
