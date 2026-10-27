/**
 * Calendar-date helpers. Everything works on whole UTC days so that results never
 * depend on the server's time zone or DST.
 */
const MS_PER_DAY = 86_400_000;
const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;
const ISO_MONTH = /^(\d{4})-(0[1-9]|1[0-2])$/;

export function isValidIsoDate(value: string): boolean {
  const match = ISO_DATE.exec(value);
  if (!match) return false;
  const [year, month, day] = [Number(match[1]), Number(match[2]), Number(match[3])];
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
  );
}

export function isValidIsoMonth(value: string): boolean {
  return ISO_MONTH.test(value);
}

/** Days since 1970-01-01 for an ISO date. Throws on invalid input. */
export function toDayNumber(iso: string): number {
  if (!isValidIsoDate(iso)) throw new Error(`Invalid ISO date: "${iso}"`);
  const [year, month, day] = iso.split('-').map(Number);
  return Math.round(Date.UTC(year, month - 1, day) / MS_PER_DAY);
}

export function fromDayNumber(dayNumber: number): string {
  return new Date(dayNumber * MS_PER_DAY).toISOString().slice(0, 10);
}

export function addDays(iso: string, days: number): string {
  return fromDayNumber(toDayNumber(iso) + days);
}

/** a - b in whole calendar days */
export function diffInDays(a: string, b: string): number {
  return toDayNumber(a) - toDayNumber(b);
}

/** First and last ISO date of a YYYY-MM month. */
export function monthBounds(month: string): { start: string; end: string } {
  if (!isValidIsoMonth(month)) throw new Error(`Invalid month: "${month}"`);
  const [year, mon] = month.split('-').map(Number);
  const lastDay = new Date(Date.UTC(year, mon, 0)).getUTCDate();
  return { start: `${month}-01`, end: `${month}-${String(lastDay).padStart(2, '0')}` };
}
