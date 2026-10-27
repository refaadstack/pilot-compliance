import { Module } from '@nestjs/common';
import { FLIGHT_HOURS_REPOSITORY } from '../flight-hours/flight-hours.repository';
import { JsonFlightHoursRepository } from '../flight-hours/json-flight-hours.repository';
import { PilotController } from './pilot.controller';
import { PilotService } from './pilot.service';

@Module({
  controllers: [PilotController],
  providers: [
    PilotService,
    // Same in-memory JSON store as the flight-hours module — one data source.
    { provide: FLIGHT_HOURS_REPOSITORY, useClass: JsonFlightHoursRepository },
  ],
})
export class PilotModule {}
