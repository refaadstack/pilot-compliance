import type { DocumentStatus, UsageStatus } from '~/types';

export type Tone = 'danger' | 'warning' | 'success';

export const documentTone: Record<DocumentStatus, Tone> = { expired: 'danger', soon: 'warning', safe: 'success' };
export const documentLabel: Record<DocumentStatus, string> = { expired: 'Expired', soon: 'Expiring soon', safe: 'Valid' };

export const usageTone: Record<UsageStatus, Tone> = { normal: 'success', warning: 'warning', exceeded: 'danger' };
export const usageLabel: Record<UsageStatus, string> = { normal: 'Normal', warning: 'Warning', exceeded: 'Exceeded' };
