import { Module } from '@nestjs/common';
import { ScheduleTaskController } from './schedule-task.controller';
import { InsightModule } from 'src/insight/insight.module';
import { SearchModule } from 'src/search/search.module';
import { PaymentsModule } from 'src/payments/payments.module';

@Module({
  controllers: [ScheduleTaskController],
  imports: [InsightModule, SearchModule, PaymentsModule],
})
export class ScheduleTaskModule {}
