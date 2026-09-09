export const WEEKDAYS = [
  "Ahad",
  "Isnin",
  "Selasa",
  "Rabu",
  "Khamis",
  "Jumaat",
  "Sabtu",
] as const;

export const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

export function weekdayName(jsDay: number): string {
  return WEEKDAYS[jsDay];
}

export function monthDisplayName(jsMonth: number): string {
  return MONTH_NAMES[jsMonth];
}

export function monthKey(jsMonth: number): string {
  return MONTH_NAMES[jsMonth].toLowerCase();
}

export function formatGregorianLabel(date: Date): string {
  return `${date.getDate()} ${monthDisplayName(date.getMonth())} ${date.getFullYear()}`;
}

export function toIsoDate(date: Date): string {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const mm = month < 10 ? `0${month}` : String(month);
  const dd = day < 10 ? `0${day}` : String(day);
  return `${date.getFullYear()}-${mm}-${dd}`;
}

export function addDays(date: Date, days: number): Date {
  const next = new Date(date.getTime());
  next.setDate(next.getDate() + days);
  return next;
}

export function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}
