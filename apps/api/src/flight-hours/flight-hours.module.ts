import { Module } from '@nestjs/common';
import { FlightHoursController } from './flight-hours.controller';
import { FLIGHT_HOURS_REPOSITORY } from './flight-hours.repository';
import { FlightHoursService } from './flight-hours.service';
import { JsonFlightHoursRepository } from './json-flight-hours.repository';

@Module({
  controllers: [FlightHoursController],
  providers: [
    FlightHoursService,
    { provide: FLIGHT_HOURS_REPOSITORY, useClass: JsonFlightHoursRepository },
  ],
})
export class FlightHoursModule {}
