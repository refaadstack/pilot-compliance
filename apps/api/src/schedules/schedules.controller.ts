import { Controller, Get, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SchedulesResponse } from '../shared/api-types';
import { SchedulesQueryDto } from './dto/schedules-query.dto';
import { SchedulesService } from './schedules.service';

@ApiTags('schedules')
@Controller('schedules')
export class SchedulesController {
  constructor(private readonly service: SchedulesService) {}

  @Get()
  @ApiOperation({
    summary: 'Monthly duty schedule',
    description:
      'Duties for one month plus the colour legend. Colours are normalised to the legend ' +
      '(colorMismatch=true marks rows whose source colour disagreed).',
  })
  @ApiOkResponse({ description: 'SchedulesResponse (see apps/api/src/shared/api-types.ts)' })
  findByMonth(@Query() query: SchedulesQueryDto): Promise<SchedulesResponse> {
    return this.service.getSchedules(query.month, query.today);
  }
}
