import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DailyInsight } from './entities/daily-insight.entity';
import { MonthlyInsight } from './entities/monthly-insight.entity';
import { InsightController } from './insight.controller';
import { InsightService } from './insight.service';
import { Post } from 'src/post/entities/post.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DailyInsight, MonthlyInsight, Post])],
  controllers: [InsightController],
  providers: [InsightService],
})
export class InsightModule {}
