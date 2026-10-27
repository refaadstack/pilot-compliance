import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EnvVars } from '../config/env';

/** The only place that decides what "today" is. The system clock is never consulted. */
@Injectable()
export class TodayService {
  constructor(private readonly config: ConfigService<EnvVars, true>) {}

  resolve(override?: string): string {
    return override ?? this.config.get('APP_TODAY', { infer: true });
  }
}
