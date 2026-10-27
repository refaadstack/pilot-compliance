import { LegendItem } from '../shared/api-types';

/** Row as stored in the source data (snake_case, untrusted). */
export interface ScheduleRecord {
  id: string;
  duty_date: string;
  status: number;
  base_name: string;
  base_color: string;
  duty_type: string;
  count_schedules: number;
  count_logbooks: number;
}

export interface SchedulesRepository {
  /** Inclusive range of ISO dates */
  findByDateRange(from: string, to: string): Promise<ScheduleRecord[]>;
  getLegend(): Promise<LegendItem[]>;
}

export const SCHEDULES_REPOSITORY = Symbol('SCHEDULES_REPOSITORY');
