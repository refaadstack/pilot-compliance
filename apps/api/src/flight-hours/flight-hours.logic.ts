import { addDays, fromDayNumber, toDayNumber } from '../common/date.util';
import { ChartPoint, UsageItem, UsageStatus } from '../shared/api-types';
import { FlightHourEntry } from './flight-hours.repository';

/**
 * Hours are summed as integer TENTHS of an hour (5.7h -> 57) so that long rolling sums never
 * accumulate floating point noise. The source data has a resolution of 0.1h.
 */
export type HoursIndex = ReadonlyMap<number, number>;

export function buildHoursIndex(entries: readonly FlightHourEntry[]): HoursIndex {
  const index = new Map<number, number>();
  for (const entry of entries) {
    const day = toDayNumber(entry.date);
    index.set(day, (index.get(day) ?? 0) + Math.round(entry.hours * 10));
  }
  return index;
}

/** Sum (in tenths) over the `windowDays` days that END on `endDay`, inclusive. Missing days = 0. */
export function sumWindowTenths(index: HoursIndex, endDay: number, windowDays: number): number {
  let total = 0;
  for (let day = endDay - windowDays + 1; day <= endDay; day += 1) {
    total += index.get(day) ?? 0;
  }
  return total;
}

export const tenthsToHours = (tenths: number): number => tenths / 10;

/** <80% normal, 80%..<100% warning, >=100% exceeded. Uses the unrounded ratio. */
export function computeUsageStatus(hours: number, limit: number): UsageStatus {
  const ratio = hours / limit;
  if (ratio >= 1) return 'exceeded';
  if (ratio >= 0.8) return 'warning';
  return 'normal';
}

export function buildUsage(hours: number, limit: number, windowDays: number): UsageItem {
  return {
    hours,
    limit,
    windowDays,
    percentage: Math.round((hours / limit) * 1000) / 10,
    status: computeUsageStatus(hours, limit),
  };
}

export interface SeriesOptions {
  index: HoursIndex;
  today: string;
  windowDays: number;
  /** X axis spans `today ± halfSpanDays`, one point per day (7 -> 15 points, today in the centre) */
  halfSpanDays: number;
  /** earliest date with data, null when there is none */
  dataStart: string | null;
}

/**
 * One point per calendar day over `today ± halfSpanDays` (7 -> 15 points, today always in the
 * middle). The value on date D is the rolling sum of the `windowDays` days ENDING on D
 * (1w=7d, 1m=30d, 3m=90d, 6m=180d, 1y=365d), so future dates are covered by the window that ends
 * on them — future days contribute 0 h because no data exists for them yet. `partial` marks a
 * window that starts before `dataStart`.
 */
export function buildChartSeries(options: SeriesOptions): ChartPoint[] {
  const { index, today, windowDays, halfSpanDays, dataStart } = options;
  if (!Number.isInteger(windowDays) || windowDays < 1) throw new Error('windowDays must be a positive integer');
  if (!Number.isInteger(halfSpanDays) || halfSpanDays < 0) {
    throw new Error('halfSpanDays must be a non-negative integer');
  }

  const todayDay = toDayNumber(today);
  const dataStartDay = dataStart === null ? Number.POSITIVE_INFINITY : toDayNumber(dataStart);

  const points: ChartPoint[] = [];
  for (let endDay = todayDay - halfSpanDays; endDay <= todayDay + halfSpanDays; endDay += 1) {
    points.push({
      date: fromDayNumber(endDay),
      hours: tenthsToHours(sumWindowTenths(index, endDay, windowDays)),
      partial: endDay - windowDays + 1 < dataStartDay,
    });
  }
  return points;
}

/** Earliest ISO date any chart/summary window for `today` can reach. */
export function earliestWindowStart(today: string, windowDays: number, halfSpanDays: number): string {
  return addDays(today, -halfSpanDays - windowDays + 1);
}
