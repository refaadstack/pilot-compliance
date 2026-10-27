import { Inject, Injectable } from '@nestjs/common';
import { PilotResponse } from '../shared/api-types';
import { FLIGHT_HOURS_REPOSITORY, FlightHoursRepository } from '../flight-hours/flight-hours.repository';

@Injectable()
export class PilotService {
  constructor(
    @Inject(FLIGHT_HOURS_REPOSITORY) private readonly repository: FlightHoursRepository,
  ) {}

  async getMe(username: string | undefined): Promise<PilotResponse> {
    const pilot = await this.repository.getPilot();
    return {
      name: pilot.name,
      totalFlightHours: pilot.totalFlightHours,
      avatarUrl: `https://i.pravatar.cc/150?u=${encodeURIComponent(username ?? pilot.name)}`,
    };
  }
}
