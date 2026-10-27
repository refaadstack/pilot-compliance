import { ChartRange, FlightLimits } from '../shared/api-types';

export interface FlightHourEntry {
  /** ISO calendar date */
  date: string;
  hours: number;
}

export interface ChartBounds {
  limit: number;
  max: number;
  windowDays: number;
  halfSpanDays: number;
}

export interface PilotRecord {
  name: string;
  totalFlightHours: number;
}

export interface FlightHoursRepository {
  getPilot(): Promise<PilotRecord>;
  getLimits(): Promise<FlightLimits>;
  getChartBounds(): Promise<Record<ChartRange, ChartBounds>>;
  /** Inclusive range of ISO dates, ascending. Days without a flight may be absent. */
  findEntries(from: string, to: string): Promise<FlightHourEntry[]>;
  /** Earliest date we hold data for, or null when empty. */
  getEarliestEntryDate(): Promise<string | null>;
}

export const FLIGHT_HOURS_REPOSITORY = Symbol('FLIGHT_HOURS_REPOSITORY');
