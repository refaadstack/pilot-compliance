import { Inject, Injectable, Logger } from '@nestjs/common';
import { isValidIsoDate } from '../common/date.util';
import { TodayService } from '../common/today.service';
import { DocumentsResponse } from '../shared/api-types';
import { buildDocumentItem, sortDocuments, summarizeDocuments } from './documents.logic';
import { DOCUMENTS_REPOSITORY, DocumentsRepository } from './documents.repository';

@Injectable()
export class DocumentsService {
  private readonly logger = new Logger(DocumentsService.name);

  constructor(
    @Inject(DOCUMENTS_REPOSITORY) private readonly repository: DocumentsRepository,
    private readonly todayService: TodayService,
  ) {}

  async getDocuments(todayOverride?: string): Promise<DocumentsResponse> {
    const today = this.todayService.resolve(todayOverride);
    const [records, warningDays] = await Promise.all([
      this.repository.findAll(),
      this.repository.getWarningDays(),
    ]);

    const valid = records.filter((record) => {
      const ok = isValidIsoDate(record.expiryDate);
      if (!ok) {
        this.logger.warn(`Skipping document "${record.id}": invalid expiryDate "${record.expiryDate}"`);
      }
      return ok;
    });

    const documents = sortDocuments(valid.map((r) => buildDocumentItem(r, today, warningDays)));
    return {
      today,
      thresholds: { warningDays },
      summary: summarizeDocuments(documents),
      documents,
    };
  }
}
