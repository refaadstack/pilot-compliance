import { ConfigService } from '@nestjs/config';
import { TodayService } from './common/today.service';
import { EnvVars, validateEnv } from './config/env';
import { DocumentsService } from './documents/documents.service';
import { JsonDocumentsRepository } from './documents/json-documents.repository';
import { FlightHoursService } from './flight-hours/flight-hours.service';
import { JsonFlightHoursRepository } from './flight-hours/json-flight-hours.repository';
import { JsonSchedulesRepository } from './schedules/json-schedules.repository';
import { SchedulesService } from './schedules/schedules.service';

const today = new TodayService({ get: () => '2026-05-31' } as unknown as ConfigService<EnvVars, true>);

describe('services against the bundled mock data (today = 2026-05-31)', () => {
  it('documents match the expected statuses and order', async () => {
    const res = await new DocumentsService(new JsonDocumentsRepository(), today).getDocuments();
    expect(res.documents.map((d) => [d.id, d.daysRemaining, d.status])).toEqual([
      ['doc_security', -30, 'expired'],
      ['doc_license', -2, 'expired'],
      ['doc_medical', 11, 'soon'],
      ['doc_recurrent', 136, 'safe'],
      ['doc_ppc', 208, 'safe'],
    ]);
    expect(res.summary).toEqual({ expired: 2, soon: 1, safe: 2 });
  });

  it('schedules: flags 97041 and keeps incomplete completed rows incomplete', async () => {
    const service = new SchedulesService(new JsonSchedulesRepository(), today);
    const june = await service.getSchedules('2026-06');
    expect(june.schedules.find((s) => s.id === '97041')).toMatchObject({ color: '#F59E0B', rawColor: '#FBA577', colorMismatch: true });
    expect(june.schedules.every((s) => s.dutyDate.startsWith('2026-06'))).toBe(true);

    const april = await service.getSchedules('2026-04');
    expect(april.schedules.find((s) => s.id === '97005')).toMatchObject({ status: 2, isComplete: false });
    expect(april.schedules.find((s) => s.id === '97010')).toMatchObject({ status: 2, isComplete: false });
  });

  it('schedules: defaults to the month of today and returns an empty list for months without data', async () => {
    const service = new SchedulesService(new JsonSchedulesRepository(), today);
    expect((await service.getSchedules()).month).toBe('2026-05');
    expect((await service.getSchedules('2030-01')).schedules).toEqual([]);
  });

  it('flight-hours summary', async () => {
    const res = await new FlightHoursService(new JsonFlightHoursRepository(), today).getSummary();
    expect(res.pilot).toEqual({ name: 'John Doe', totalFlightHours: 1444.5 });
    expect(res.usage.today).toMatchObject({ hours: 4.3, limit: 8, status: 'normal' });
    expect(res.usage.last7Days).toMatchObject({ hours: 15.4, limit: 40, status: 'normal' });
    expect(res.usage.last30Days).toMatchObject({ hours: 99.3, limit: 100, percentage: 99.3, status: 'warning' });
    expect(res.usage.last365Days).toMatchObject({ hours: 1025.3, limit: 1050, status: 'warning' });
  });

  it('flight-hours summary ignores entries after a "today" override', async () => {
    const res = await new FlightHoursService(new JsonFlightHoursRepository(), today).getSummary('2025-01-01');
    expect(res.pilot.totalFlightHours).toBe(5.7 + 3.4 + 3.2); // 2024-12-27 .. 2025-01-01
    expect(res.usage.today.hours).toBe(3.2);
  });

  it('flight-hours chart honours chartBounds', async () => {
    const service = new FlightHoursService(new JsonFlightHoursRepository(), today);
    const oneMonth = await service.getChart('1m');
    expect(oneMonth).toMatchObject({ limit: 100, max: 125, windowDays: 30, halfSpanDays: 7 });
    expect(oneMonth.series).toHaveLength(15); // today +/- 7 days, today in the middle
    expect(oneMonth.series[0].date).toBe('2026-05-24');
    expect(oneMonth.series[7].date).toBe('2026-05-31');
    expect(oneMonth.series[14].date).toBe('2026-06-07');
    // The point for today equals the rolling 30-day gauge value
    expect(oneMonth.series[7]).toEqual({ date: '2026-05-31', hours: 99.3, partial: false });

    const oneYear = await service.getChart('1y');
    expect(oneYear.series).toHaveLength(15);
    expect(oneYear.series[7]?.hours).toBe(1025.3); // today, rolling 365 days
    // The window for the earliest point (today - 7) starts 2025-05-25, i.e. after the first record,
    // so nothing on this axis reaches before the dataset start.
    expect(oneYear.series.some((p) => p.partial)).toBe(false);
    // Future dates keep returning a value: no data, so each window only loses hours
    expect(oneYear.series[8].hours).toBeLessThanOrEqual(1025.3);
    expect(oneYear.series.slice(8).every((p) => p.hours > 0)).toBe(true);

    // Override "today" near the start of the dataset to exercise the partial branch
    const early = await new FlightHoursService(new JsonFlightHoursRepository(), today).getChart('1y', '2025-01-01');
    expect(early.series[0].partial).toBe(true); // window starts 2023-12-27, before the first record
  });
});

describe('validateEnv', () => {
  it('applies defaults', () => {
    expect(validateEnv({})).toEqual({ PORT: 3001, APP_TODAY: '2026-05-31', CORS_ORIGINS: ['http://localhost:3000'] });
  });
  it('rejects a bad APP_TODAY', () => {
    expect(() => validateEnv({ APP_TODAY: '2026-02-31' })).toThrow(/APP_TODAY/);
  });
});
