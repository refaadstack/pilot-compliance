import { Inject, Injectable, Logger } from '@nestjs/common';
import { isValidIsoDate, monthBounds } from '../common/date.util';
import { TodayService } from '../common/today.service';
import { SchedulesResponse } from '../shared/api-types';
import { indexLegend, normalizeSchedule } from './schedules.logic';
import { SCHEDULES_REPOSITORY, SchedulesRepository } from './schedules.repository';

@Injectable()
export class SchedulesService {
  private readonly logger = new Logger(SchedulesService.name);

  constructor(
    @Inject(SCHEDULES_REPOSITORY) private readonly repository: SchedulesRepository,
    private readonly todayService: TodayService,
  ) {}

  async getSchedules(month?: string, todayOverride?: string): Promise<SchedulesResponse> {
    const today = this.todayService.resolve(todayOverride);
    const targetMonth = month ?? today.slice(0, 7);
    const { start, end } = monthBounds(targetMonth);

    const [records, legend] = await Promise.all([
      this.repository.findByDateRange(start, end),
      this.repository.getLegend(),
    ]);
    const legendByCode = indexLegend(legend);

    const schedules = records
      .filter((record) => {
        const ok = isValidIsoDate(record.duty_date);
        if (!ok) this.logger.warn(`Skipping schedule "${record.id}": invalid duty_date "${record.duty_date}"`);
        return ok;
      })
      .map((record) => normalizeSchedule(record, legendByCode))
      .sort((a, b) => a.dutyDate.localeCompare(b.dutyDate) || a.id.localeCompare(b.id));

    return { today, month: targetMonth, legend, schedules };
  }
}
