import { Injectable } from '@nestjs/common';
import mockSchedules from '../data/mock-schedules.json';
import { LegendItem } from '../shared/api-types';
import { ScheduleRecord, SchedulesRepository } from './schedules.repository';

interface MockSchedulesFile {
  legend: LegendItem[];
  schedules: ScheduleRecord[];
}

@Injectable()
export class JsonSchedulesRepository implements SchedulesRepository {
  // The `today` field inside the mock file is deliberately ignored (see README).
  private readonly file: MockSchedulesFile = mockSchedules;

  async findByDateRange(from: string, to: string): Promise<ScheduleRecord[]> {
    // ISO dates sort lexicographically
    return this.file.schedules.filter((row) => row.duty_date >= from && row.duty_date <= to);
  }

  async getLegend(): Promise<LegendItem[]> {
    return this.file.legend;
  }
}
