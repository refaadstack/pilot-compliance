import { Module } from '@nestjs/common';
import { DocumentsController } from './documents.controller';
import { DOCUMENTS_REPOSITORY } from './documents.repository';
import { DocumentsService } from './documents.service';
import { JsonDocumentsRepository } from './json-documents.repository';

@Module({
  controllers: [DocumentsController],
  providers: [
    DocumentsService,
    // Swap this line for a database-backed implementation later.
    { provide: DOCUMENTS_REPOSITORY, useClass: JsonDocumentsRepository },
  ],
})
export class DocumentsModule {}
