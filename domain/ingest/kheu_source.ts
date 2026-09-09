/**
 * Locked KHEU fetch contract from the 2026-09-05 HTML spike.
 * Domain must not HTTP-fetch; the ingest server uses these URLs in phase 4.
 */

export const KHEU_ORIGIN = "https://www.mora.gov.bn";
export const KHEU_LIST_ID = "887e0cb0-49cd-4ab9-8901-0a0cd671d0e2";
export const KHEU_VIEW_ID = "D3CE6905-C0B0-4B5B-996B-6E615D69A73E";

export const KHEU_HTML_PAGE = `${KHEU_ORIGIN}/lists/waktusolat/waktusolat.aspx`;
export const KHEU_ALL_ITEMS_PAGE = `${KHEU_ORIGIN}/lists/waktusolat/allitems.aspx`;

export const KHEU_MONTH_CODES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

export type KheuMonthCode = (typeof KHEU_MONTH_CODES)[number];

/** ASP.NET fields on waktusolat.aspx. POST after reading hidden viewstate from GET. */
export const KHEU_HTML_FORM = {
  month: "ctl00$PlaceHolderMain$Dropmonth",
  year: "ctl00$PlaceHolderMain$Dropyear",
  submit: "ctl00$PlaceHolderMain$btncari",
  submitValue: "Cari",
} as const;

export function kheuMonthCode(month: number): KheuMonthCode {
  const code = KHEU_MONTH_CODES[month - 1];
  if (!code) {
    throw new Error(`Month must be 1-12, got ${month}`);
  }
  return code;
}

/**
 * All Items view filtered by Month + Year.
 * Works for years the HTML dropdown does not list (2026+ as of the spike).
 * SharePoint REST (`/_api`, ListData.svc, owssvr XMLDATA) returned 401.
 */
export function kheuAllItemsUrl(year: number, month: number): string {
  const params = new URLSearchParams();
  params.set("FilterField1", "Month");
  params.set("FilterValue1", kheuMonthCode(month));
  params.set("FilterField2", "Year");
  params.set("FilterValue2", String(year));
  return `${KHEU_ALL_ITEMS_PAGE}?${params.toString()}`;
}
