import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional } from 'class-validator';
import { TodayQueryDto } from '../../common/dto/today-query.dto';
import { ChartRange } from '../../shared/api-types';

export const CHART_RANGES: readonly ChartRange[] = ['1w', '1m', '3m', '6m', '1y'];

export class ChartQueryDto extends TodayQueryDto {
  @ApiPropertyOptional({ enum: CHART_RANGES, default: '1w', description: 'Chart range' })
  @IsOptional()
  @IsIn(CHART_RANGES, { message: `range must be one of: ${CHART_RANGES.join(', ')}` })
  range?: ChartRange;
}
