import { LegendItem, ScheduleItem } from '../shared/api-types';
import { ScheduleRecord } from './schedules.repository';

export function indexLegend(legend: readonly LegendItem[]): Map<string, LegendItem> {
  return new Map(legend.map((item) => [item.code, item]));
}

const sameColor = (a: string, b: string): boolean => a.trim().toLowerCase() === b.trim().toLowerCase();

/**
 * Maps a raw row to the API shape.
 *  - The legend is the source of truth for colour: legend colour wins over base_color.
 *  - colorMismatch flags rows where base_color disagrees with the legend.
 *  - A duty_type missing from the legend cannot be normalised: keep base_color, do not crash.
 *  - isComplete is strictly count_logbooks === count_schedules (status is NOT consulted).
 */
export function normalizeSchedule(
  record: ScheduleRecord,
  legendByCode: ReadonlyMap<string, LegendItem>,
): ScheduleItem {
  const legendEntry = legendByCode.get(record.duty_type);
  const color = legendEntry?.color ?? record.base_color;

  return {
    id: record.id,
    dutyDate: record.duty_date,
    status: record.status === 2 ? 2 : 1,
    dutyType: record.duty_type,
    baseName: record.base_name,
    color,
    rawColor: record.base_color,
    colorMismatch: legendEntry !== undefined && !sameColor(legendEntry.color, record.base_color),
    countSchedules: record.count_schedules,
    countLogbooks: record.count_logbooks,
    isComplete: record.count_logbooks === record.count_schedules,
  };
}
