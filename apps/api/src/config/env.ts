import { isValidIsoDate } from '../common/date.util';

export interface EnvVars {
  PORT: number;
  APP_TODAY: string;
  CORS_ORIGINS: string[];
}

export const DEFAULT_APP_TODAY = '2026-05-31';

/** Validates + normalises process.env. Throws with a readable message on bad config. */
export function validateEnv(raw: Record<string, unknown>): EnvVars {
  const appToday = String(raw.APP_TODAY ?? DEFAULT_APP_TODAY);
  if (!isValidIsoDate(appToday)) {
    throw new Error(`APP_TODAY must be a valid date in YYYY-MM-DD format, got "${appToday}"`);
  }

  const port = Number(raw.PORT ?? 3001);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error(`PORT must be an integer between 1 and 65535, got "${String(raw.PORT)}"`);
  }

  const origins = String(raw.CORS_ORIGINS ?? 'http://localhost:3000')
    .split(',')
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0);

  return { PORT: port, APP_TODAY: appToday, CORS_ORIGINS: origins };
}
