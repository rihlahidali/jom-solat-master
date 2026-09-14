import {
  KHEU_HTML_FORM,
  KHEU_HTML_PAGE,
  KHEU_MONTH_CODES,
  KHEU_ORIGIN,
  KHEU_ALL_ITEMS_PAGE,
  kheuAllItemsUrl,
  type KheuMonthCode,
} from "#domain/ingest/kheu_source";

export async function fetchKheuMonth(
  year: number,
  month: number
): Promise<string> {
  const monthCode = KHEU_MONTH_CODES[month - 1] as KheuMonthCode;
  if (!monthCode) {
    throw new Error(`Month must be 1-12, got ${month}`);
  }

  const html = await fetchKheuHtml(year, monthCode);
  if (html.includes("ms-listviewtable")) {
    return html;
  }

  return fetchKheuAllItems(year, month);
}

async function fetchKheuHtml(year: number, monthCode: string): Promise<string> {
  const get = (await $fetch(KHEU_HTML_PAGE, { method: "GET" })) as unknown as string;
  const viewstate = extractInput(get, "__VIEWSTATE");
  const viewstateGenerator = extractInput(get, "__VIEWSTATEGENERATOR");
  const eventValidation = extractInput(get, "__EVENTVALIDATION");

  const body = new URLSearchParams();
  body.set(KHEU_HTML_FORM.month, monthCode);
  body.set(KHEU_HTML_FORM.year, String(year));
  body.set(KHEU_HTML_FORM.submit, KHEU_HTML_FORM.submitValue);

  return (await $fetch(KHEU_HTML_PAGE, {
    method: "POST",
    body,
    headers: {
      "content-type": "application/x-www-form-urlencoded",
      origin: KHEU_ORIGIN,
      referer: KHEU_HTML_PAGE,
    },
  })) as unknown as string;
}

async function fetchKheuAllItems(year: number, month: number): Promise<string> {
  const url = kheuAllItemsUrl(year, month);
  return ($fetch(url, { headers: { referer: KHEU_HTML_PAGE } })) as unknown as string;
}

function extractInput(html: string, name: string): string {
  const re = new RegExp(`<input[^>]*name="${name}"[^>]*value="([^"]*)"`, "i");
  const match = re.exec(html);
  if (!match) {
    throw new Error(`Missing ${name} in KHEU page`);
  }
  return decodeHtml(match[1]!);
}

function decodeHtml(value: string): string {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) =>
      String.fromCharCode(parseInt(hex, 16))
    )
    .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(parseInt(dec, 10)));
}
