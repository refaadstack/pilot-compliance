import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { IsIsoDate } from '../validators/is-iso-date';

export class TodayQueryDto {
  @ApiPropertyOptional({
    description: 'Overrides APP_TODAY for this request (testing). Format YYYY-MM-DD.',
    example: '2026-05-31',
  })
  @IsOptional()
  @IsIsoDate()
  today?: string;
}
