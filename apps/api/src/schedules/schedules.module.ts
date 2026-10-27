import { Module } from '@nestjs/common';
import { JsonSchedulesRepository } from './json-schedules.repository';
import { SchedulesController } from './schedules.controller';
import { SCHEDULES_REPOSITORY } from './schedules.repository';
import { SchedulesService } from './schedules.service';

@Module({
  controllers: [SchedulesController],
  providers: [
    SchedulesService,
    { provide: SCHEDULES_REPOSITORY, useClass: JsonSchedulesRepository },
  ],
})
export class SchedulesModule {}
