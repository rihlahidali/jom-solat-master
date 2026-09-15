import { assertCompleteMonth } from "#domain/ingest/complete_month";
import { parseKheuHtml } from "#domain/ingest/parse_kheu_html";
import { parseKheuSharePointRows } from "#domain/ingest/parse_kheu_sharepoint";
import { fetchKheuMonth } from "../utils/kheu_html";
import {
  getTimetable,
  replaceMonth,
  replaceTimetable,
} from "../utils/timetable_store";

export default defineEventHandler(async (event) => {
  if (!process.env.INGEST_SECRET) {
    setResponseStatus(event, 500);
    return { error: "Server misconfigured: INGEST_SECRET is not set" };
  }

  const secret = getRequestHeader(event, "authorization")?.replace("Bearer ", "");
  if (secret !== process.env.INGEST_SECRET) {
    setResponseStatus(event, 401);
    return { error: "Unauthorized" };
  }

  const timetable = await getTimetable();
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const monthsToFetch = [currentMonth];
  const daysInCurrent = new Date(currentYear, currentMonth, 0).getDate();
  if (now.getDate() > daysInCurrent - 7) {
    const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1;
    const nextYear = currentMonth === 12 ? currentYear + 1 : currentYear;
    monthsToFetch.push(nextMonth);
  }

  let changed = false;
  let errors: string[] = [];

  for (const month of monthsToFetch) {
    const year =
      month === currentMonth ? currentYear : currentMonth === 12 ? currentYear + 1 : currentYear;
    try {
      const html = await fetchKheuMonth(year, month);
      let days;
      if (html.includes("ms-listviewtable")) {
        days = parseKheuHtml(html);
      } else {
        const { extractSharePointListRows } = await import(
          "#domain/ingest/parse_kheu_sharepoint"
        );
        const rows = extractSharePointListRows(html);
        days = parseKheuSharePointRows(rows);
      }

      assertCompleteMonth(days, year, month);

      const updated = replaceMonth(timetable, month, days);
      if (updated.version > timetable.version) {
        Object.assign(timetable, updated);
        changed = true;
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      errors.push(`${year}-${month}: ${message}`);
    }
  }

  if (changed) {
    await replaceTimetable(timetable);
  }

  if (errors.length > 0) {
    setResponseStatus(event, 207);
    return { version: timetable.version, errors };
  }

  return { version: timetable.version };
});
