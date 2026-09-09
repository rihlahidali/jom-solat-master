import type { PrayerDay } from "../prayer/prayer";
import { prayerDayFromNamedRecord } from "./parse_kheu_table";

const LIST_DATA_RE = /var WPQ\dListData\s*=\s*/;

export function parseKheuSharePointRows(
  rows: Array<Record<string, string>>
): PrayerDay[] {
  const days = rows.map((row) =>
    prayerDayFromNamedRecord(row, { dateOrder: "mdy" })
  );
  return [...days].sort((left, right) =>
    left.gregorian.localeCompare(right.gregorian)
  );
}

export function extractSharePointListRows(
  html: string
): Array<Record<string, string>> {
  const marker = LIST_DATA_RE.exec(html);
  if (!marker || marker.index === undefined) {
    throw new Error("KHEU All Items HTML is missing WPQ ListData");
  }

  const start = skipWhitespace(html, marker.index + marker[0].length);
  const jsonText = sliceJsonObject(html, start);
  const data = JSON.parse(jsonText) as { Row?: Array<Record<string, string>> };
  if (!Array.isArray(data.Row)) {
    throw new Error("KHEU ListData JSON has no Row array");
  }
  return data.Row;
}

function skipWhitespace(source: string, index: number): number {
  let cursor = index;
  while (cursor < source.length && /\s/.test(source[cursor] ?? "")) {
    cursor += 1;
  }
  return cursor;
}

function sliceJsonObject(source: string, start: number): string {
  if (source[start] !== "{") {
    throw new Error("KHEU ListData JSON does not start with {");
  }

  let depth = 0;
  let inString = false;
  let escape = false;

  for (let index = start; index < source.length; index += 1) {
    const char = source[index];
    if (inString) {
      if (escape) {
        escape = false;
        continue;
      }
      if (char === "\\") {
        escape = true;
        continue;
      }
      if (char === '"') {
        inString = false;
      }
      continue;
    }
    if (char === '"') {
      inString = true;
      continue;
    }
    if (char === "{") {
      depth += 1;
    } else if (char === "}") {
      depth -= 1;
      if (depth === 0) {
        return source.slice(start, index + 1);
      }
    }
  }

  throw new Error("Unterminated KHEU ListData JSON");
}
