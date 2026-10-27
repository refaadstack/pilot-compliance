export interface DocumentRecord {
  id: string;
  label: string;
  expiryDate: string;
}

export interface DocumentsRepository {
  findAll(): Promise<DocumentRecord[]>;
  getWarningDays(): Promise<number>;
}

export const DOCUMENTS_REPOSITORY = Symbol('DOCUMENTS_REPOSITORY');
