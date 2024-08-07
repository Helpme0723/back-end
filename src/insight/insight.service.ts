import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DailyInsight } from './entities/daily-insight.entity';
import { Repository } from 'typeorm';
import { MonthlyInsight } from './entities/monthly-insight.entity';
import { Post } from 'src/post/entities/post.entity';
import { format, sub } from 'date-fns';
import { ChannelDailyInsight } from './entities/channel-daily-insight.entity';
import { ChannelMonthlyInsight } from './entities/channel-monthly-insight.entity';

@Injectable()
export class InsightService {
  constructor(
    @InjectRepository(DailyInsight)
    private readonly dailyInsightRepository: Repository<DailyInsight>,
    @InjectRepository(MonthlyInsight)
    private readonly monthlyInsightRepository: Repository<MonthlyInsight>,
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    @InjectRepository(ChannelDailyInsight)
    private readonly channelDailyInsightRepository: Repository<ChannelDailyInsight>,
    @InjectRepository(ChannelMonthlyInsight)
    private readonly channelMonthlyInsightRepository: Repository<ChannelMonthlyInsight>
  ) {}

  // 일별 통계 계산 및 저장
  async calculateDailyInsight() {
    // 전체 포스트 가져오기
    const posts = await this.postRepository.find({
      select: {
        id: true,
        channelId: true,
        viewCount: true,
        likeCount: true,
        commentCount: true,
        salesCount: true,
      },
    });

    // 이미 daily db에 데이터 있는지 확인하고,
    const existingInsights = await this.dailyInsightRepository
      .createQueryBuilder('insight')
      .select('insight.postId', 'postId')
      .addSelect('SUM(insight.viewCount)', 'totalViews')
      .addSelect('SUM(insight.likeCount)', 'totalLikes')
      .addSelect('SUM(insight.commentCount)', 'totalComments')
      .addSelect('SUM(insight.salesCount)', 'totalSales')
      .groupBy('insight.postId')
      .getRawMany();

    //빈 맵 객체
    const existingInsightMap = new Map();

    for (const insight of existingInsights) {
      existingInsightMap.set(insight.postId, insight);
    }

    const dailyInsightData = [];

    const oneDayAgo = sub(new Date(), { days: 1 });
    const date = format(oneDayAgo, 'yyyy-MM-dd');

    for (const post of posts) {
      const existingInsightData = existingInsightMap.get(post.id);

      let viewCount = post.viewCount;
      let likeCount = post.likeCount;
      let commentCount = post.commentCount;
      let salesCount = post.salesCount;

      if (existingInsightData) {
        viewCount -= existingInsightData.totalViews;
        likeCount -= existingInsightData.totalLikes;
        commentCount -= existingInsightData.totalComments;
        salesCount -= existingInsightData.totalSales;
      }

      const dailyInsight = this.dailyInsightRepository.create({
        channelId: post.channelId,
        postId: post.id,
        viewCount,
        likeCount,
        commentCount,
        salesCount,
        date,
      });

      dailyInsightData.push(dailyInsight);
    }

    await this.dailyInsightRepository.upsert(dailyInsightData, [
      'postId',
      'date',
    ]);
  }

  // 월별 통계 계산 및 저장
  async calculateMonthlyInsight() {
    const posts = await this.postRepository.find({
      select: {
        id: true,
        channelId: true,
        viewCount: true,
        likeCount: true,
        commentCount: true,
        salesCount: true,
      },
    });

    const existingInsights = await this.monthlyInsightRepository
      .createQueryBuilder('insight')
      .select('insight.postId', 'postId')
      .addSelect('SUM(insight.viewCount)', 'totalViews')
      .addSelect('SUM(insight.likeCount)', 'totalLikes')
      .addSelect('SUM(insight.commentCount)', 'totalComments')
      .addSelect('SUM(insight.salesCount)', 'totalSales')
      .groupBy('insight.postId')
      .getRawMany();

    const existingInsightMap = new Map();

    for (const insight of existingInsights) {
      existingInsightMap.set(insight.postId, insight);
    }

    const monthlyInsightData = [];

    const oneMonthAgo = sub(new Date(), { months: 1 });
    const date = format(oneMonthAgo, 'yyyy-MM');

    for (const post of posts) {
      const existingInsightData = existingInsightMap.get(post.id);

      let viewCount = post.viewCount;
      let likeCount = post.likeCount;
      let commentCount = post.commentCount;
      let salesCount = post.salesCount;

      if (existingInsightData) {
        viewCount -= existingInsightData.totalViews;
        likeCount -= existingInsightData.totalLikes;
        commentCount -= existingInsightData.totalComments;
        salesCount -= existingInsightData.totalSales;
      }

      const MonthlyInsight = this.monthlyInsightRepository.create({
        channelId: post.channelId,
        postId: post.id,
        viewCount,
        likeCount,
        commentCount,
        salesCount,
        date,
      });

      monthlyInsightData.push(MonthlyInsight);
    }

    await this.monthlyInsightRepository.upsert(monthlyInsightData, [
      'postId',
      'date',
    ]);
  }

  // // 한달 지난 데일리 통계 삭제
  // async deleteDailyInsight() {
  //   const sevenDaysAgo = sub(new Date(), { days: 30 });

  //   const sevenDaysAgoData = format(sevenDaysAgo, 'yyyy-MM-dd');

  //   await this.dailyInsightRepository.delete({
  //     date: LessThan(sevenDaysAgoData),
  //   });
  // }

  // 매일 자정마다 +5분마다 일별 포스트 통합 총 조회수 등 통계 저장
  async calculateChannelDailyInsight() {
    const oneDayAgo = sub(new Date(), { days: 1 });
    const daily = format(oneDayAgo, 'yyyy-MM-dd');

    const existingInsights = await this.dailyInsightRepository
      .createQueryBuilder('insight')
      .select('insight.channelId', 'channelId')
      .addSelect('SUM(insight.viewCount)', 'totalViews')
      .addSelect('SUM(insight.likeCount)', 'totalLikes')
      .addSelect('SUM(insight.commentCount)', 'totalComments')
      .addSelect('SUM(insight.salesCount)', 'totalSales')
      .where('insight.date = :daily', { daily })
      .groupBy('insight.channelId')
      .getRawMany();

    const channelDailyInsightData = [];

    for (const existingInsight of existingInsights) {
      const channelDailyInsight = this.channelDailyInsightRepository.create({
        channelId: existingInsight.channelId,
        viewCount: Number(existingInsight.totalViews),
        likeCount: Number(existingInsight.totalLikes),
        commentCount: Number(existingInsight.totalComments),
        salesCount: Number(existingInsight.totalSales),
        date: daily,
      });

      channelDailyInsightData.push(channelDailyInsight);
    }

    await this.channelDailyInsightRepository.upsert(channelDailyInsightData, [
      'channelId',
      'date',
    ]);
  }

  // 매월 1일 자정 +5분 마다 월별 포스트 통합 총 조회수 등 통계 계산 후 저장
  async calculateChannelMonthlyInsight() {
    const oneMonthAgo = sub(new Date(), { months: 1 });
    const monthly = format(oneMonthAgo, 'yyyy-MM');

    const existingInsights = await this.monthlyInsightRepository
      .createQueryBuilder('insight')
      .select('insight.channelId', 'channelId')
      .addSelect('SUM(insight.viewCount)', 'totalViews')
      .addSelect('SUM(insight.likeCount)', 'totalLikes')
      .addSelect('SUM(insight.commentCount)', 'totalComments')
      .addSelect('SUM(insight.salesCount)', 'totalSales')
      .where('insight.date = :monthly', { monthly })
      .groupBy('insight.channelId')
      .getRawMany();

    const channelMonthlyInsightData = [];

    for (const existingInsight of existingInsights) {
      const channelMonthlyInsight = this.channelMonthlyInsightRepository.create(
        {
          channelId: existingInsight.channelId,
          viewCount: Number(existingInsight.totalViews),
          likeCount: Number(existingInsight.totalLikes),
          commentCount: Number(existingInsight.totalComments),
          salesCount: Number(existingInsight.totalSales),
          date: monthly,
        }
      );

      channelMonthlyInsightData.push(channelMonthlyInsight);
    }

    await this.channelMonthlyInsightRepository.upsert(
      channelMonthlyInsightData,
      ['channelId', 'date']
    );
  }
}
