import { TodayQueryDto } from '../../common/dto/today-query.dto';

/** GET /api/documents accepts only the shared `today` override. */
export class DocumentsQueryDto extends TodayQueryDto {}
