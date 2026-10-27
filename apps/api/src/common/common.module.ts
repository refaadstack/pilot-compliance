import { Global, Module } from '@nestjs/common';
import { TodayService } from './today.service';

@Global()
@Module({ providers: [TodayService], exports: [TodayService] })
export class CommonModule {}
