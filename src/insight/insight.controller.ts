import { Controller, Get } from '@nestjs/common';
import { InsightService } from './insight.service';
import { Cron, CronExpression } from '@nestjs/schedule';

@Controller('insights')
export class InsightController {
  constructor(private readonly insightService: InsightService) {}

  // 매일 자정마다 실행
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async dailyHandleCron() {
    console.log('데일리 통계');

    await this.insightService.calculateDailyInsight();
  }

  // 매월 1일 자정마다 실행
  @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT)
  async monthlyHandleCron() {
    console.log('먼슬리 통계');

    await this.insightService.calculateMonthlyInsight();
  }

  // 서비스 로직 테스트용
  @Get('daily')
  async daily() {
    await this.insightService.calculateDailyInsight();
  }

  // 서비스 로직 테스트용
  @Get('monthly')
  async monthly() {
    await this.insightService.calculateMonthlyInsight();
  }
}
