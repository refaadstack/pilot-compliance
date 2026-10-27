/**
 * Single source of truth for API response shapes.
 * TYPE-ONLY file: it must never contain runtime code, because the web app
 * imports it through the `@shared` alias (`import type { ... } from '@shared/api-types'`).
 */

/* ---------- Documents ---------- */
export type DocumentStatus = 'expired' | 'soon' | 'safe';

export interface DocumentItem {
  id: string;
  label: string;
  /** ISO calendar date, YYYY-MM-DD */
  expiryDate: string;
  /** expiryDate - today, in calendar days (negative = already expired) */
  daysRemaining: number;
  status: DocumentStatus;
}

export interface DocumentsResponse {
  today: string;
  thresholds: { warningDays: number };
  summary: Record<DocumentStatus, number>;
  /** Sorted: expired, soon, safe; most urgent first inside each group */
  documents: DocumentItem[];
}

/* ---------- Schedules ---------- */
export interface LegendItem {
  code: string;
  label: string;
  color: string;
}

export interface ScheduleItem {
  id: string;
  /** ISO calendar date, YYYY-MM-DD */
  dutyDate: string;
  /** 1 = pending, 2 = completed */
  status: 1 | 2;
  dutyType: string;
  baseName: string;
  /** Normalised colour: legend colour wins over the raw base_color */
  color: string;
  /** Colour as delivered by the source data */
  rawColor: string;
  /** true when rawColor disagrees with the legend colour of dutyType */
  colorMismatch: boolean;
  countSchedules: number;
  countLogbooks: number;
  /** countLogbooks === countSchedules */
  isComplete: boolean;
}

export interface SchedulesResponse {
  today: string;
  /** YYYY-MM */
  month: string;
  legend: LegendItem[];
  schedules: ScheduleItem[];
}

/* ---------- Flight hours ---------- */
export type UsageStatus = 'normal' | 'warning' | 'exceeded';
export type ChartRange = '1w' | '1m' | '3m' | '6m' | '1y';

export interface FlightLimits {
  daily: number;
  weekly: number;
  monthly: number;
  annual: number;
}

export interface UsageItem {
  /** Hours flown inside the window that ends today */
  hours: number;
  limit: number;
  windowDays: number;
  /** hours / limit * 100, one decimal */
  percentage: number;
  status: UsageStatus;
}

export interface FlightHoursSummaryResponse {
  today: string;
  pilot: { name: string; totalFlightHours: number };
  limits: FlightLimits;
  usage: {
    today: UsageItem;
    last7Days: UsageItem;
    last30Days: UsageItem;
    last365Days: UsageItem;
  };
}

export interface ChartPoint {
  /** ISO calendar date the rolling window ends on */
  date: string;
  /** Rolling sum of the previous `windowDays` days (inclusive of `date`) */
  hours: number;
  /** true when the window reaches back before the first day we have data for */
  partial: boolean;
}

export interface FlightHoursChartResponse {
  today: string;
  range: ChartRange;
  limit: number;
  max: number;
  windowDays: number;
  /** X axis spans `today ± halfSpanDays`, one point per day, today in the centre */
  halfSpanDays: number;
  /** Ascending by date */
  series: ChartPoint[];
}

/* ---------- Pilot ---------- */
export interface PilotResponse {
  name: string;
  totalFlightHours: number;
  /** URL of a profile picture the web app can render directly */
  avatarUrl: string;
}

/* ---------- Auth ---------- */
export interface LoginResponse {
  token: string;
}

/* ---------- Errors ---------- */
export interface ApiErrorBody {
  statusCode: number;
  message: string | string[];
  error?: string;
}
