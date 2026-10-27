import { Injectable } from '@nestjs/common';
import mockDocuments from '../data/mock-documents.json';
import { DocumentRecord, DocumentsRepository } from './documents.repository';

interface MockDocumentsFile {
  thresholds: { warningDays: number };
  documents: DocumentRecord[];
}

@Injectable()
export class JsonDocumentsRepository implements DocumentsRepository {
  // The `today` field inside the mock file is deliberately ignored (see README).
  private readonly file: MockDocumentsFile = mockDocuments;

  async findAll(): Promise<DocumentRecord[]> {
    return this.file.documents;
  }

  async getWarningDays(): Promise<number> {
    return this.file.thresholds.warningDays;
  }
}
