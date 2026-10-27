import { Controller, Get, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { DocumentsQueryDto } from './dto/documents-query.dto';
import { DocumentsResponse } from '../shared/api-types';
import { DocumentsService } from './documents.service';

@ApiTags('documents')
@Controller('documents')
export class DocumentsController {
  constructor(private readonly service: DocumentsService) {}

  @Get()
  @ApiOperation({
    summary: 'Document expiry tracker',
    description:
      'Returns every document with daysRemaining and status (expired | soon | safe), sorted by urgency. ' +
      'daysRemaining <= 0 is expired, <= warningDays (30) is soon, otherwise safe.',
  })
  @ApiOkResponse({ description: 'DocumentsResponse (see apps/api/src/shared/api-types.ts)' })
  findAll(@Query() query: DocumentsQueryDto): Promise<DocumentsResponse> {
    return this.service.getDocuments(query.today);
  }
}
