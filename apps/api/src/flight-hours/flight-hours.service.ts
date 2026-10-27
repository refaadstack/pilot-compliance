import { Inject, Injectable } from '@nestjs/common';
import { addDays, toDayNumber } from '../common/date.util';
import { TodayService } from '../common/today.service';
import {
  ChartRange,
  FlightHoursChartResponse,
  FlightHoursSummaryResponse,
} from '../shared/api-types';
import {
  buildChartSeries,
  buildHoursIndex,
  buildUsage,
  earliestWindowStart,
  sumWindowTenths,
  tenthsToHours,
} from './flight-hours.logic';
import { FLIGHT_HOURS_REPOSITORY, FlightHoursRepository } from './flight-hours.repository';

const FAR_FUTURE = '9999-12-31';

@Injectable()
export class FlightHoursService {
  constructor(
    @Inject(FLIGHT_HOURS_REPOSITORY) private readonly repository: FlightHoursRepository,
    private readonly todayService: TodayService,
  ) {}

  async getSummary(todayOverride?: string): Promise<FlightHoursSummaryResponse> {
    const today = this.todayService.resolve(todayOverride);
    const [pilot, limits, entries, futureEntries] = await Promise.all([
      this.repository.getPilot(),
      this.repository.getLimits(),
      this.repository.findEntries(addDays(today, -364), today),
      this.repository.findEntries(addDays(today, 1), FAR_FUTURE),
    ]);

    const index = buildHoursIndex(entries);
    const todayDay = toDayNumber(today);
    const usageFor = (windowDays: number, limit: number) =>
      buildUsage(tenthsToHours(sumWindowTenths(index, todayDay, windowDays)), limit, windowDays);

    // Entries dated after `today` (only possible with a today override) are not yet "flown".
    const futureTenths = [...buildHoursIndex(futureEntries).values()].reduce((a, b) => a + b, 0);
    const totalFlightHours = tenthsToHours(Math.round(pilot.totalFlightHours * 10) - futureTenths);

    return {
      today,
      pilot: { name: pilot.name, totalFlightHours },
      limits,
      usage: {
        today: usageFor(1, limits.daily),
        last7Days: usageFor(7, limits.weekly),
        last30Days: usageFor(30, limits.monthly),
        last365Days: usageFor(365, limits.annual),
      },
    };
  }

  async getChart(range: ChartRange = '1w', todayOverride?: string): Promise<FlightHoursChartResponse> {
    const today = this.todayService.resolve(todayOverride);
    const bounds = (await this.repository.getChartBounds())[range];
    const from = earliestWindowStart(today, bounds.windowDays, bounds.halfSpanDays);

    const [entries, dataStart] = await Promise.all([
      this.repository.findEntries(from, today),
      this.repository.getEarliestEntryDate(),
    ]);

    return {
      today,
      range,
      limit: bounds.limit,
      max: bounds.max,
      windowDays: bounds.windowDays,
      halfSpanDays: bounds.halfSpanDays,
      series: buildChartSeries({
        index: buildHoursIndex(entries),
        today,
        windowDays: bounds.windowDays,
        halfSpanDays: bounds.halfSpanDays,
        dataStart,
      }),
    };
  }
}
