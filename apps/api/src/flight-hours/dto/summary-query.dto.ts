import { TodayQueryDto } from '../../common/dto/today-query.dto';

/** GET /api/flight-hours/summary accepts only the shared `today` override. */
export class SummaryQueryDto extends TodayQueryDto {}
