import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, Matches } from 'class-validator';
import { TodayQueryDto } from '../../common/dto/today-query.dto';

export class SchedulesQueryDto extends TodayQueryDto {
  @ApiPropertyOptional({
    description: 'Month to return, YYYY-MM. Defaults to the month of "today".',
    example: '2026-05',
  })
  @IsOptional()
  @Matches(/^\d{4}-(0[1-9]|1[0-2])$/, { message: 'month must be in YYYY-MM format, e.g. 2026-05' })
  month?: string;
}
