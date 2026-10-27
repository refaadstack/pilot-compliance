const dateFormat = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
const shortDateFormat = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' });
const monthFormat = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' });
const longDateFormat = new Intl.DateTimeFormat('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });

const asUtc = (iso: string): Date => new Date(`${iso}T00:00:00Z`);

export const formatDate = (iso: string): string => dateFormat.format(asUtc(iso));
export const formatShortDate = (iso: string): string => shortDateFormat.format(asUtc(iso));
export const formatLongDate = (iso: string): string => longDateFormat.format(asUtc(iso));
export const formatMonth = (month: string): string => monthFormat.format(asUtc(`${month}-01`));

export const formatHours = (hours: number): string =>
  `${hours.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} h`;

const plural = (n: number, unit: string): string => `${n} ${unit}${n === 1 ? '' : 's'}`;

/** "Expired 2 days ago" | "Expired today" | "11 days left" */
export function describeExpiry(daysRemaining: number): string {
  if (daysRemaining < 0) return `Expired ${plural(-daysRemaining, 'day')} ago`;
  if (daysRemaining === 0) return 'Expired today';
  return `${plural(daysRemaining, 'day')} left`;
}
