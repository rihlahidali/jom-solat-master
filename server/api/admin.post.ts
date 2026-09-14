import { assertCompleteMonth } from "#domain/ingest/complete_month";
import { parseKheuHtml } from "#domain/ingest/parse_kheu_html";
import { parseKheuTsv } from "#domain/ingest/parse_kheu_table";
import { getTimetable, replaceMonth, replaceTimetable } from "../utils/timetable_store";

export default defineEventHandler(async (event) => {
  const secret = getRequestHeader(event, "authorization")?.replace("Bearer ", "");
  if (secret !== process.env.ADMIN_SECRET) {
    setResponseStatus(event, 401);
    return { error: "Unauthorized" };
  }

  const body = await readBody(event);
  const text = typeof body === "string" ? body : body?.text ?? body?.html ?? "";
  if (!text || typeof text !== "string") {
    setResponseStatus(event, 400);
    return { error: "Expected TSV or HTML body" };
  }

  let days;
  let month = 0;
  let year = 0;

  if (text.trim().startsWith("<")) {
    days = parseKheuHtml(text);
    const first = days[0];
    if (!first) {
      setResponseStatus(event, 400);
      return { error: "No days parsed from HTML" };
    }
    const [y, m] = first.gregorian.split("-").map(Number);
    year = y ?? 0;
    month = m ?? 0;
  } else {
    days = parseKheuTsv(text);
    const first = days[0];
    if (!first) {
      setResponseStatus(event, 400);
      return { error: "No days parsed from TSV" };
    }
    const [y, m] = first.gregorian.split("-").map(Number);
    year = y ?? 0;
    month = m ?? 0;
  }

  assertCompleteMonth(days, year, month);

  const timetable = await getTimetable();
  const updated = replaceMonth(timetable, month, days);
  if (updated.version > timetable.version) {
    await replaceTimetable(updated);
    return { version: updated.version, month, year };
  }

  return { version: timetable.version, month, year, unchanged: true };
});
