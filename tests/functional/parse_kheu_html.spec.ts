import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "@japa/runner";
import { assertCompleteMonth } from "../../domain/ingest/complete_month";
import {
  kheuAllItemsUrl,
  KHEU_HTML_FORM,
  KHEU_HTML_PAGE,
} from "../../domain/ingest/kheu_source";
import { parseKheuHtml } from "../../domain/ingest/parse_kheu_html";
import {
  extractSharePointListRows,
  parseKheuSharePointRows,
} from "../../domain/ingest/parse_kheu_sharepoint";

const fixtures = join(dirname(fileURLToPath(import.meta.url)), "fixtures");

function readFixture(name: string): string {
  return readFileSync(join(fixtures, name), "utf8");
}

test.group("kheu fetch contract", () => {
  test("locks the HTML page and ASP.NET form fields", ({ assert }) => {
    assert.equal(
      KHEU_HTML_PAGE,
      "https://www.mora.gov.bn/lists/waktusolat/waktusolat.aspx"
    );
    assert.equal(KHEU_HTML_FORM.month, "ctl00$PlaceHolderMain$Dropmonth");
    assert.equal(KHEU_HTML_FORM.year, "ctl00$PlaceHolderMain$Dropyear");
    assert.equal(KHEU_HTML_FORM.submitValue, "Cari");
  });

  test("locks the All Items month filter URL", ({ assert }) => {
    assert.equal(
      kheuAllItemsUrl(2026, 1),
      "https://www.mora.gov.bn/lists/waktusolat/allitems.aspx?FilterField1=Month&FilterValue1=Jan&FilterField2=Year&FilterValue2=2026"
    );
  });
});

test.group("parseKheuHtml", () => {
  test("parses the saved January 2024 list view", ({ assert }) => {
    const days = parseKheuHtml(readFixture("kheu-january-2024.table.html"));
    assertCompleteMonth(days, 2024, 1);
    assert.equal(days[0]?.gregorian, "2024-01-01");
    assert.equal(days[0]?.hijri, "19 Jamadilakhir 1445");
    assert.equal(days[0]?.imsak, "04:55");
    assert.equal(days[0]?.subuh, "05:05");
    assert.equal(days[0]?.isya, "19:33");
    assert.equal(days[1]?.gregorian, "2024-01-02");
    assert.equal(days[30]?.gregorian, "2024-01-31");
    assert.equal(days[30]?.hijri, "19 Rajab 1445");
  });

  test("parses the saved February 2024 leap month", ({ assert }) => {
    const days = parseKheuHtml(readFixture("kheu-february-2024.table.html"));
    assertCompleteMonth(days, 2024, 2);
    assert.equal(days[0]?.gregorian, "2024-02-01");
    assert.equal(days[28]?.gregorian, "2024-02-29");
  });
});

test.group("parseKheuSharePointRows", () => {
  test("parses the saved January 2026 All Items rows newest-first", ({
    assert,
  }) => {
    const rows = JSON.parse(
      readFixture("kheu-january-2026.rows.json")
    ) as Array<Record<string, string>>;
    const days = parseKheuSharePointRows(rows);
    assertCompleteMonth(days, 2026, 1);
    assert.equal(days[0]?.gregorian, "2026-01-01");
    assert.equal(days[0]?.hijri, "11 Rejab 1447");
    assert.equal(days[0]?.imsak, "04:55");
    assert.equal(days[0]?.subuh, "05:05");
    assert.equal(days[0]?.isya, "19:34");
    assert.equal(days[30]?.gregorian, "2026-01-31");
    assert.equal(days[30]?.imsak, "05:06");
  });

  test("extracts WPQ ListData from All Items HTML", ({ assert }) => {
    const html = `var WPQ2ListData = { "Row" : [{
"Date": "1\\u002f02\\u002f2026",
"Tarikh": "12 Rejab 1447",
"Imsak": "4.55",
"Suboh": "5.05",
"Syuruk": "6.29",
"Doha": "6.53",
"Zohor": "12.25",
"Asar": "3.47",
"Maghrib": "6.19",
"Isyak": "7.34",
"Month": "Jan",
"Year": "2026"
}] };`;
    const rows = extractSharePointListRows(html);
    const [day] = parseKheuSharePointRows(rows);
    assert.equal(day?.gregorian, "2026-01-02");
  });
});
