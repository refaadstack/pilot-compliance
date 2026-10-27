import { DocumentItem, DocumentStatus } from '../shared/api-types';
import { diffInDays } from '../common/date.util';
import { DocumentRecord } from './documents.repository';

/** expiryDate - today in whole calendar days. */
export function computeDaysRemaining(expiryDate: string, today: string): number {
  return diffInDays(expiryDate, today);
}

/**
 *  daysRemaining <= 0                    -> expired
 *  0 < daysRemaining <= warningDays      -> soon
 *  otherwise                             -> safe
 * (so 0 days is already expired, and exactly `warningDays` days is still "soon")
 */
export function computeDocumentStatus(daysRemaining: number, warningDays: number): DocumentStatus {
  if (daysRemaining <= 0) return 'expired';
  if (daysRemaining <= warningDays) return 'soon';
  return 'safe';
}

const STATUS_ORDER: Record<DocumentStatus, number> = { expired: 0, soon: 1, safe: 2 };

/** Group order expired -> soon -> safe; inside a group the smallest daysRemaining (most urgent) first. */
export function sortDocuments(items: readonly DocumentItem[]): DocumentItem[] {
  return [...items].sort(
    (a, b) =>
      STATUS_ORDER[a.status] - STATUS_ORDER[b.status] ||
      a.daysRemaining - b.daysRemaining ||
      a.label.localeCompare(b.label),
  );
}

export function buildDocumentItem(
  record: DocumentRecord,
  today: string,
  warningDays: number,
): DocumentItem {
  const daysRemaining = computeDaysRemaining(record.expiryDate, today);
  return {
    id: record.id,
    label: record.label,
    expiryDate: record.expiryDate,
    daysRemaining,
    status: computeDocumentStatus(daysRemaining, warningDays),
  };
}

export function summarizeDocuments(items: readonly DocumentItem[]): Record<DocumentStatus, number> {
  const summary: Record<DocumentStatus, number> = { expired: 0, soon: 0, safe: 0 };
  for (const item of items) summary[item.status] += 1;
  return summary;
}
