import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { parseKheuSharePointRows } from "../domain/ingest/parse_kheu_sharepoint";
import type { TimetableYear } from "../shared/types/timetable";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const rows = JSON.parse(
  readFileSync(
    join(root, "tests/functional/fixtures/kheu-january-2026.rows.json"),
    "utf8"
  )
) as Array<Record<string, string>>;

const days = parseKheuSharePointRows(rows);
const timetable: TimetableYear = {
  year: 2026,
  version: 1,
  ingestedAt: "2026-09-06T00:00:00.000Z",
  source: "kheu",
  months: { "1": days },
};

mkdirSync(join(root, "server/data"), { recursive: true });
writeFileSync(
  join(root, "server/data/timetable.json"),
  `${JSON.stringify(timetable, null, 2)}\n`
);
