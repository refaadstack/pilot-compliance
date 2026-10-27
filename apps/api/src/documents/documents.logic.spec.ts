import { DocumentItem } from '../shared/api-types';
import {
  buildDocumentItem,
  computeDaysRemaining,
  computeDocumentStatus,
  sortDocuments,
} from './documents.logic';

describe('computeDocumentStatus (warningDays = 30)', () => {
  it.each([
    [-30, 'expired'],
    [-1, 'expired'],
    [0, 'expired'], // exact boundary: expiring today counts as expired
    [1, 'soon'],
    [30, 'soon'], // exact boundary: 30 days is still "soon"
    [31, 'safe'],
    [172, 'safe'],
  ] as const)('%d days remaining -> %s', (days, expected) => {
    expect(computeDocumentStatus(days, 30)).toBe(expected);
  });

  it('respects a different threshold', () => {
    expect(computeDocumentStatus(45, 60)).toBe('soon');
    expect(computeDocumentStatus(61, 60)).toBe('safe');
  });
});

describe('computeDaysRemaining', () => {
  it('counts whole calendar days', () => {
    expect(computeDaysRemaining('2026-06-11', '2026-05-31')).toBe(11);
    expect(computeDaysRemaining('2026-05-29', '2026-05-31')).toBe(-2);
    expect(computeDaysRemaining('2026-05-31', '2026-05-31')).toBe(0);
  });

  it('is not affected by month lengths or leap years', () => {
    expect(computeDaysRemaining('2028-03-01', '2028-02-28')).toBe(2); // 2028 is a leap year
    expect(computeDaysRemaining('2027-03-01', '2027-02-28')).toBe(1);
  });
});

describe('sortDocuments', () => {
  const doc = (label: string, daysRemaining: number): DocumentItem => ({
    id: label,
    label,
    expiryDate: '2026-01-01',
    daysRemaining,
    status: computeDocumentStatus(daysRemaining, 30),
  });

  it('orders expired, soon, safe and the most urgent first inside each group', () => {
    const sorted = sortDocuments([doc('safe-far', 200), doc('soon', 11), doc('exp-recent', -2), doc('safe-near', 40), doc('exp-old', -30)]);
    expect(sorted.map((d) => d.label)).toEqual(['exp-old', 'exp-recent', 'soon', 'safe-near', 'safe-far']);
  });

  it('does not mutate its input', () => {
    const input = [doc('b', 5), doc('a', -5)];
    sortDocuments(input);
    expect(input.map((d) => d.label)).toEqual(['b', 'a']);
  });
});

describe('buildDocumentItem', () => {
  it('builds the expected item for the mock data at 2026-05-31', () => {
    expect(
      buildDocumentItem({ id: 'doc_medical', label: 'Indonesian Medical Exp. Date', expiryDate: '2026-06-11' }, '2026-05-31', 30),
    ).toEqual({
      id: 'doc_medical',
      label: 'Indonesian Medical Exp. Date',
      expiryDate: '2026-06-11',
      daysRemaining: 11,
      status: 'soon',
    });
  });
});
