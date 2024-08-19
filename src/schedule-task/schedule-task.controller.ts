import { Controller } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InsightService } from 'src/insight/insight.service';
import { PaymentsService } from 'src/payments/payments.service';
import { SearchService } from 'src/search/search.service';

@Controller('schedule-task')
export class ScheduleTaskController {
  constructor(
    private readonly insightService: InsightService,
    private readonly searchService: SearchService,
    private readonly paymentsService: PaymentsService
  ) {}

  // 매일 자정마다 실행
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT, {
    timeZone: 'Asia/Seoul',
  })
  async dailyInsight() {
    console.log(`데일리 통계 ${new Date()}`);

    await this.insightService.calculateDailyInsight();
  }

  // 매월 1일 자정마다 실행
  @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT, {
    timeZone: 'Asia/Seoul',
  })
  async monthlyInsight() {
    console.log(`먼슬리 통계 ${new Date()}`);

    await this.insightService.calculateMonthlyInsight();
  }

  // 매일 자정 5분 후마다 일별 포스트 통합 총 조회수 등 통계 저장
  @Cron('5 0 * * *', {
    timeZone: 'Asia/Seoul',
  })
  async channelDailyInsight() {
    console.log(`포스트 통합 총 데일리 통계 저장 ${new Date()}`);

    await this.insightService.calculateChannelDailyInsight();
  }

  // 매월 1일 자정 5분 후마다 월별 포스트 통합 총 조회수 등 통계 계산 후 저장
  @Cron('5 0 1 * *', {
    timeZone: 'Asia/Seoul',
  })
  async channelMonthlyInsight() {
    console.log(`포스트 통합 총 먼슬리 통계 저장 ${new Date()}`);

    await this.insightService.calculateChannelMonthlyInsight();
  }

  // 엘라스틱 서치 포스트 인덱싱
  @Cron('*/5 * * * *')
  async postsIndexing() {
    console.log('*****포스트 인덱싱*****');
    await this.searchService.postsIndexing();
  }

  // 엘라스틱 서치 삭제 or 비공개된 포스트 인덱싱 삭체
  @Cron('*/5 * * * *')
  async deleteIndexing() {
    console.log('*****삭제된 포스트, 비공개된 포스트 인덱싱 삭제*****');
    await this.searchService.deleteIndexing();
  }

  // 검색 랭킹 업데이트
  @Cron('*/10 * * * *')
  async addSearchRanking() {
    console.log('*****검색랭킹 데이터 업데이트*****');
    const data = await this.searchService.saveDataAtDateBase();
    return data;
  }

  // 10분마다 실행
  // 주문 정보 삭제
  @Cron(CronExpression.EVERY_10_MINUTES)
  async deletePendingOrderAfterThirty() {
    console.log(`유효기간 지난 주문 정보 삭제`);
    await this.paymentsService.deletePendingOrderAfterThirty();
  }
}
