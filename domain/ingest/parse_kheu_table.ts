import { PRAYER_PERIOD, type PrayerDay, type PrayerName } from "../prayer/prayer";
import { parseKheuToHHmm } from "../prayer/parse_time";

const COLUMN_ALIASES: Record<string, keyof PrayerDay | "unused"> = {
  date: "gregorian",
  "tarikh masehi": "gregorian",
  tarikh: "hijri",
  "tarikh hijrah": "hijri",
  imsak: "imsak",
  subuh: "subuh",
  suboh: "subuh",
  syuruk: "syuruk",
  duha: "duha",
  doha: "duha",
  zuhur: "zuhur",
  zohor: "zuhur",
  asar: "asar",
  maghrib: "maghrib",
  isya: "isya",
  isyak: "isya",
  title: "unused",
  month: "unused",
  year: "unused",
};

const PRAYER_FIELDS: PrayerName[] = [
  "Imsak",
  "Subuh",
  "Syuruk",
  "Duha",
  "Zuhur",
  "Asar",
  "Maghrib",
  "Isya",
];

export function parseKheuTsv(text: string): PrayerDay[] {
  const lines = text.split(/\r?\n/).filter((line) => line.trim() !== "");
  return lines.map((line, index) => parseTsvRow(line, index));
}

function parseTsvRow(line: string, index: number): PrayerDay {
  const cells = line.split("\t").map((cell) => cell.trim());
  if (cells.length < 10) {
    throw new Error(`Row ${index + 1} has ${cells.length} columns, expected 10`);
  }

  return prayerDayFromCells({
    gregorian: cells[0]!,
    hijri: cells[1]!,
    imsak: cells[2]!,
    subuh: cells[3]!,
    syuruk: cells[4]!,
    duha: cells[5]!,
    zuhur: cells[6]!,
    asar: cells[7]!,
    maghrib: cells[8]!,
    isya: cells[9]!,
  });
}

const CELL_FIELDS = [
  "gregorian",
  "hijri",
  "imsak",
  "subuh",
  "syuruk",
  "duha",
  "zuhur",
  "asar",
  "maghrib",
  "isya",
] as const;

export type DateOrder = "dmy" | "mdy";

export type PrayerDayCells = {
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

/** Admin TSV paste is day/month/year. SharePoint DateTime cells are month/day/year. */
export type ParseKheuOptions = {
  dateOrder?: DateOrder;
};

export function prayerDayFromLegacyRow(row: Record<string, string>): PrayerDay {
  return prayerDayFromNamedRecord(row);
}

export function prayerDayFromNamedRecord(
  row: Record<string, string>,
  options: ParseKheuOptions = {}
): PrayerDay {
  const cells: Partial<PrayerDayCells> = {};
  for (const [key, value] of Object.entries(row)) {
    const field = normalizeHeader(key);
    if (!field || field === "unused") {
      continue;
    }
    cells[field] = value;
  }

  for (const field of CELL_FIELDS) {
    if (!cells[field]?.trim()) {
      throw new Error(`Missing ${field}`);
    }
  }

  return prayerDayFromCells(cells as PrayerDayCells, options);
}

export function prayerDayFromCells(
  raw: PrayerDayCells,
  options: ParseKheuOptions = {}
): PrayerDay {
  return {
    gregorian: toIsoDate(raw.gregorian, options.dateOrder ?? "dmy"),
    hijri: raw.hijri.trim(),
    imsak: parseKheuToHHmm(raw.imsak, PRAYER_PERIOD.Imsak),
    subuh: parseKheuToHHmm(raw.subuh, PRAYER_PERIOD.Subuh),
    syuruk: parseKheuToHHmm(raw.syuruk, PRAYER_PERIOD.Syuruk),
    duha: parseKheuToHHmm(raw.duha, PRAYER_PERIOD.Duha),
    zuhur: parseKheuToHHmm(raw.zuhur, PRAYER_PERIOD.Zuhur),
    asar: parseKheuToHHmm(raw.asar, PRAYER_PERIOD.Asar),
    maghrib: parseKheuToHHmm(raw.maghrib, PRAYER_PERIOD.Maghrib),
    isya: parseKheuToHHmm(raw.isya, PRAYER_PERIOD.Isya),
  };
}

export function normalizeHeader(header: string): keyof PrayerDay | "unused" | undefined {
  return COLUMN_ALIASES[header.trim().toLowerCase()];
}

export function toIsoDate(raw: string, order: DateOrder = "dmy"): string {
  const trimmed = raw.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed;
  }

  const match = /^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})$/.exec(trimmed);
  if (!match) {
    throw new Error(`Invalid date: ${raw}`);
  }

  const first = Number(match[1]);
  const second = Number(match[2]);
  const year = Number(match[3]);
  const day = order === "dmy" ? first : second;
  const month = order === "dmy" ? second : first;

  if (month < 1 || month > 12 || day < 1 || day > 31) {
    throw new Error(`Invalid date: ${raw}`);
  }

  const mm = month < 10 ? `0${month}` : String(month);
  const dd = day < 10 ? `0${day}` : String(day);
  return `${year}-${mm}-${dd}`;
}

export { PRAYER_FIELDS };
