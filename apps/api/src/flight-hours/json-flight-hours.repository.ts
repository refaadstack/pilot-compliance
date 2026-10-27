import { Injectable, Logger } from '@nestjs/common';
import mockFlightHours from '../data/mock-flight-hours.json';
import { isValidIsoDate } from '../common/date.util';
import { ChartRange, FlightLimits } from '../shared/api-types';
import {
  ChartBounds,
  FlightHourEntry,
  FlightHoursRepository,
  PilotRecord,
} from './flight-hours.repository';

interface MockFlightHoursFile {
  pilot: PilotRecord;
  limits: FlightLimits;
  chartBounds: Record<ChartRange, ChartBounds>;
  flightHours: FlightHourEntry[];
}

@Injectable()
export class JsonFlightHoursRepository implements FlightHoursRepository {
  private readonly logger = new Logger(JsonFlightHoursRepository.name);
  private readonly file: MockFlightHoursFile = mockFlightHours;
  private readonly entries: FlightHourEntry[];

  constructor() {
    // Drop malformed rows once at load time instead of failing every request.
    this.entries = this.file.flightHours
      .filter((entry) => {
        const ok = isValidIsoDate(entry.date) && Number.isFinite(entry.hours) && entry.hours >= 0;
        if (!ok) this.logger.warn(`Skipping invalid flight-hour row ${JSON.stringify(entry)}`);
        return ok;
      })
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  async getPilot(): Promise<PilotRecord> {
    return this.file.pilot;
  }

  async getLimits(): Promise<FlightLimits> {
    return this.file.limits;
  }

  async getChartBounds(): Promise<Record<ChartRange, ChartBounds>> {
    return this.file.chartBounds;
  }

  async findEntries(from: string, to: string): Promise<FlightHourEntry[]> {
    return this.entries.filter((entry) => entry.date >= from && entry.date <= to);
  }

  async getEarliestEntryDate(): Promise<string | null> {
    return this.entries[0]?.date ?? null;
  }
}
