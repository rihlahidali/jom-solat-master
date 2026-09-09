import type { PrayerDay } from "../prayer/prayer";
import {
  prayerDayFromNamedRecord,
  type DateOrder,
} from "./parse_kheu_table";

const TABLE_RE =
  /<table\b[^>]*\bms-listviewtable\b[^>]*>[\s\S]*?<\/table>/i;
const ROW_RE = /<tr\b[^>]*>([\s\S]*?)<\/tr>/gi;
const HEADER_CELL_RE = /<th\b[^>]*>([\s\S]*?)<\/th>/gi;
const DATA_CELL_RE = /<td\b[^>]*>([\s\S]*?)<\/td>/gi;
const DISPLAY_NAME_RE = /\bDisplayName="([^"]+)"/i;
const FIELD_NAME_RE = /\bname="([^"]+)"/i;

const SHAREPOINT_DATE_ORDER: DateOrder = "mdy";

export function parseKheuHtml(html: string): PrayerDay[] {
  const table = html.match(TABLE_RE)?.[0];
  if (!table) {
    throw new Error("KHEU HTML is missing table.ms-listviewtable");
  }

  const rows = [...table.matchAll(ROW_RE)].map((match) => match[1]);
  if (rows.length === 0) {
    throw new Error("KHEU HTML table has no rows");
  }

  let headers: string[] | undefined;
  const days: PrayerDay[] = [];

  for (const row of rows) {
    const headerCells = [...row.matchAll(HEADER_CELL_RE)].map((match) =>
      headerLabel(match[0], match[1])
    );
    if (headerCells.length > 0) {
      headers = headerCells;
      continue;
    }

    const values = [...row.matchAll(DATA_CELL_RE)].map((match) =>
      stripMarkup(match[1])
    );
    if (values.length < 10) {
      continue;
    }
    if (!headers) {
      throw new Error("KHEU HTML table is missing a header row");
    }

    const record: Record<string, string> = {};
    headers.forEach((header, index) => {
      record[header] = values[index] ?? "";
    });
    days.push(prayerDayFromNamedRecord(record, { dateOrder: SHAREPOINT_DATE_ORDER }));
  }

  if (days.length === 0) {
    throw new Error("KHEU HTML table has no timetable rows");
  }

  return sortByGregorian(days);
}

function headerLabel(fullCell: string, innerHtml: string): string {
  return (
    DISPLAY_NAME_RE.exec(fullCell)?.[1] ??
    FIELD_NAME_RE.exec(fullCell)?.[1] ??
    stripMarkup(innerHtml)
  );
}

function stripMarkup(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&#160;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function sortByGregorian(days: PrayerDay[]): PrayerDay[] {
  return [...days].sort((left, right) =>
    left.gregorian.localeCompare(right.gregorian)
  );
}
