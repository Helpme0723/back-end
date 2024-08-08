import { Controller, Get } from '@nestjs/common';
import { InsightService } from './insight.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('11.인사이트')
@Controller('insights')
export class InsightController {
  constructor(private readonly insightService: InsightService) {}

  // 매일 자정마다 실행
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT, {
    timeZone: 'Asia/Seoul',
  })
  async dailyInsight() {
    console.log('데일리 통계');

    await this.insightService.calculateDailyInsight();
  }

  // 매월 1일 자정마다 실행
  @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT, {
    timeZone: 'Asia/Seoul',
  })
  async monthlyInsight() {
    console.log('먼슬리 통계');

    await this.insightService.calculateMonthlyInsight();
  }

  // // 한달 이상 지난 데일리 통계 삭제
  // @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT)
  // async deleteDailyHandleCron() {
  //   console.log('한달 지난 데일리 통계 삭제');

  //   await this.insightService.deleteDailyInsight();
  // }

  // 매일 자정 5분 후마다 일별 포스트 통합 총 조회수 등 통계 저장
  @Cron('5 0 * * *', {
    timeZone: 'Asia/Seoul',
  })
  async channelDailyInsight() {
    console.log('포스트 통합 총 데일리 통계 저장');

    await this.insightService.calculateChannelDailyInsight();
  }

  // 매월 1일 자정 5분 후마다 월별 포스트 통합 총 조회수 등 통계 계산 후 저장
  @Cron('5 0 1 * *', {
    timeZone: 'Asia/Seoul',
  })
  async channelMonthlyInsight() {
    console.log('포스트 통합 총 먼슬리 통계 저장');

    await this.insightService.calculateChannelMonthlyInsight();
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

  // // 서비스 로직 테스트용
  // @Delete('daily')
  // async delete() {
  //   await this.insightService.deleteDailyInsight();
  // }

  @Get('channel/daily')
  async channelDaily() {
    await this.insightService.calculateChannelDailyInsight();
  }

  @Get('channel/monthly')
  async channelMonthly() {
    await this.insightService.calculateChannelMonthlyInsight();
  }
}
