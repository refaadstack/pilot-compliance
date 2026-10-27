import { toDayNumber } from '../common/date.util';
import {
  buildChartSeries,
  buildHoursIndex,
  buildUsage,
  computeUsageStatus,
  sumWindowTenths,
} from './flight-hours.logic';

const index = buildHoursIndex([
  { date: '2026-05-24', hours: 5 }, // 7 days before 05-31 -> OUTSIDE a 7-day window ending 05-31
  { date: '2026-05-25', hours: 2.5 }, // first day inside (window = 05-25 .. 05-31)
  { date: '2026-05-28', hours: 3.3 },
  { date: '2026-05-31', hours: 4.3 },
]);

describe('sumWindowTenths (rolling window)', () => {
  const end = toDayNumber('2026-05-31');

  it('includes both ends of the window (windowDays days ending on the end date)', () => {
    expect(sumWindowTenths(index, end, 7)).toBe(25 + 33 + 43); // 05-25 .. 05-31
    expect(sumWindowTenths(index, end, 6)).toBe(33 + 43); // 05-25 now falls outside
    expect(sumWindowTenths(index, end, 1)).toBe(43);
  });

  it('treats days without data as 0 hours', () => {
    expect(sumWindowTenths(index, toDayNumber('2026-05-30'), 1)).toBe(0);
    expect(sumWindowTenths(new Map(), end, 30)).toBe(0);
  });

  it('does not accumulate floating point noise', () => {
    const noisy = buildHoursIndex([0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7].map((hours, i) => ({ date: `2026-05-0${i + 1}`, hours })));
    expect(sumWindowTenths(noisy, toDayNumber('2026-05-07'), 7) / 10).toBe(2.8);
  });
});

describe('buildChartSeries', () => {
  it('returns one point per day over today +/- halfSpanDays, today in the centre', () => {
    const series = buildChartSeries({ index, today: '2026-05-31', windowDays: 14, halfSpanDays: 7, dataStart: '2026-01-01' });
    expect(series).toHaveLength(15);
    expect(series[0].date).toBe('2026-05-24');
    expect(series[7].date).toBe('2026-05-31'); // today = middle index
    expect(series[14].date).toBe('2026-06-07');
  });

  it('computes each point as the rolling sum ending on that date', () => {
    const series = buildChartSeries({ index, today: '2026-05-31', windowDays: 7, halfSpanDays: 0, dataStart: '2026-01-01' });
    expect(series).toEqual([{ date: '2026-05-31', hours: 10.1, partial: false }]);
  });

  it('counts days with no data as 0 and never skips a date', () => {
    const series = buildChartSeries({ index, today: '2026-05-31', windowDays: 1, halfSpanDays: 7, dataStart: '2026-01-01' });
    expect(series).toHaveLength(15);
    expect(series.map((p) => p.date)).toEqual([
      '2026-05-24', '2026-05-25', '2026-05-26', '2026-05-27', '2026-05-28',
      '2026-05-29', '2026-05-30', '2026-05-31', '2026-06-01', '2026-06-02',
      '2026-06-03', '2026-06-04', '2026-06-05', '2026-06-06', '2026-06-07',
    ]);
    expect(series.map((p) => p.hours)).toEqual([5, 2.5, 0, 0, 3.3, 0, 0, 4.3, 0, 0, 0, 0, 0, 0, 0]);
  });

  it('gives future dates the value of the trailing window (future days add 0)', () => {
    const series = buildChartSeries({ index, today: '2026-05-31', windowDays: 7, halfSpanDays: 7, dataStart: '2026-01-01' });
    const today = series[7];
    const tomorrow = series[8];
    // 06-01 window = 05-26..06-01 -> drops 05-25 (2.5 h), so it decreases by exactly that
    expect(tomorrow.hours).toBe(Math.round((today.hours - 2.5) * 10) / 10);
    expect(series.slice(8).every((p) => p.hours >= 0)).toBe(true);
  });

  it('marks points whose window starts before the first day of data as partial', () => {
    const series = buildChartSeries({ index, today: '2026-05-31', windowDays: 7, halfSpanDays: 1, dataStart: '2026-05-25' });
    expect(series.map((p) => p.partial)).toEqual([true, false, false]);
  });

  it('rejects invalid configuration', () => {
    expect(() => buildChartSeries({ index, today: '2026-05-31', windowDays: 7, halfSpanDays: -1, dataStart: null })).toThrow();
    expect(() => buildChartSeries({ index, today: '2026-05-31', windowDays: 0, halfSpanDays: 7, dataStart: null })).toThrow();
  });
});

describe('usage status', () => {
  it.each([
    [0, 'normal'],
    [79.9, 'normal'],
    [80, 'warning'], // exact boundary
    [99.9, 'warning'],
    [100, 'exceeded'], // exact boundary
    [120, 'exceeded'],
  ] as const)('%d%% of the limit -> %s', (percent, expected) => {
    expect(computeUsageStatus(percent, 100)).toBe(expected);
  });

  it('builds percentage with one decimal', () => {
    expect(buildUsage(99.3, 100, 30)).toEqual({ hours: 99.3, limit: 100, windowDays: 30, percentage: 99.3, status: 'warning' });
  });
});
