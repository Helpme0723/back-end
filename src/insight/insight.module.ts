import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DailyInsight } from './entities/daily-insight.entity';
import { MonthlyInsight } from './entities/monthly-insight.entity';
import { InsightController } from './insight.controller';
import { InsightService } from './insight.service';
import { Post } from 'src/post/entities/post.entity';
import { ChannelDailyInsight } from './entities/channel-daily-insight.entity';
import { ChannelMonthlyInsight } from './entities/channel-monthly-insight.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DailyInsight, MonthlyInsight, Post, ChannelDailyInsight, ChannelMonthlyInsight])],
  controllers: [InsightController],
  providers: [InsightService],
})
export class InsightModule {}
