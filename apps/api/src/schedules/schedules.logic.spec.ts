import { LegendItem } from '../shared/api-types';
import { indexLegend, normalizeSchedule } from './schedules.logic';
import { ScheduleRecord } from './schedules.repository';

const legend: LegendItem[] = [
  { code: 'DTY', label: 'On Duty', color: '#10B981' },
  { code: 'TRD', label: 'Travel Day', color: '#FBA577' },
  { code: 'TRX', label: 'Training', color: '#F59E0B' },
];
const byCode = indexLegend(legend);

const record = (overrides: Partial<ScheduleRecord> = {}): ScheduleRecord => ({
  id: '1',
  duty_date: '2026-06-04',
  status: 1,
  base_name: 'CJN',
  base_color: '#F59E0B',
  duty_type: 'TRX',
  count_schedules: 1,
  count_logbooks: 0,
  ...overrides,
});

describe('normalizeSchedule colour handling', () => {
  it('keeps the colour and does not flag a row that matches the legend', () => {
    const item = normalizeSchedule(record(), byCode);
    expect(item.color).toBe('#F59E0B');
    expect(item.colorMismatch).toBe(false);
  });

  it('prefers the legend colour and flags the mismatch (id 97041: TRX painted as TRD)', () => {
    const item = normalizeSchedule(record({ id: '97041', base_color: '#FBA577' }), byCode);
    expect(item.color).toBe('#F59E0B');
    expect(item.rawColor).toBe('#FBA577');
    expect(item.colorMismatch).toBe(true);
  });

  it('compares colours case-insensitively', () => {
    expect(normalizeSchedule(record({ base_color: '#f59e0b' }), byCode).colorMismatch).toBe(false);
  });

  it('does not crash on a duty_type missing from the legend and keeps the raw colour', () => {
    const item = normalizeSchedule(record({ duty_type: 'XYZ', base_color: '#123456' }), byCode);
    expect(item.color).toBe('#123456');
    expect(item.colorMismatch).toBe(false);
  });
});

describe('normalizeSchedule completeness', () => {
  it('is complete only when logbooks === schedules', () => {
    expect(normalizeSchedule(record({ count_schedules: 4, count_logbooks: 4 }), byCode).isComplete).toBe(true);
    expect(normalizeSchedule(record({ count_schedules: 4, count_logbooks: 0 }), byCode).isComplete).toBe(false);
  });

  it('ignores status: completed rows with missing logbooks are NOT complete (ids 97005, 97010)', () => {
    const item = normalizeSchedule(record({ id: '97005', status: 2, count_schedules: 4, count_logbooks: 2 }), byCode);
    expect(item.status).toBe(2);
    expect(item.isComplete).toBe(false);
  });

  it('maps unknown status codes to pending instead of crashing', () => {
    expect(normalizeSchedule(record({ status: 99 }), byCode).status).toBe(1);
  });
});
