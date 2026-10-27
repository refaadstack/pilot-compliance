import { Controller, Get, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { FlightHoursChartResponse, FlightHoursSummaryResponse } from '../shared/api-types';
import { ChartQueryDto } from './dto/chart-query.dto';
import { SummaryQueryDto } from './dto/summary-query.dto';
import { FlightHoursService } from './flight-hours.service';

@ApiTags('flight-hours')
@Controller('flight-hours')
export class FlightHoursController {
  constructor(private readonly service: FlightHoursService) {}

  @Get('summary')
  @ApiOperation({
    summary: 'Pilot totals and current usage against the flight time limitations',
    description:
      'Usage windows end today (inclusive): 1 day, 7 days, 30 days and 365 days. ' +
      'Status: <80% normal, 80-99% warning, >=100% exceeded.',
  })
  @ApiOkResponse({ description: 'FlightHoursSummaryResponse (see apps/api/src/shared/api-types.ts)' })
  getSummary(@Query() query: SummaryQueryDto): Promise<FlightHoursSummaryResponse> {
    return this.service.getSummary(query.today);
  }

  @Get('chart')
    @ApiOperation({
      summary: 'Rolling flight-hour series for the chart',
      description:
        'One point per day over today +/- halfSpanDays (7 -> 15 points, today always in the middle). ' +
        'Each point is the rolling sum of the windowDays days ENDING on that date; days in the future ' +
        'contribute 0 h, so their totals equal the trailing window.',
    })
  @ApiOkResponse({ description: 'FlightHoursChartResponse (see apps/api/src/shared/api-types.ts)' })
  getChart(@Query() query: ChartQueryDto): Promise<FlightHoursChartResponse> {
    return this.service.getChart(query.range, query.today);
  }
}
