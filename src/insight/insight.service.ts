import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DailyInsight } from './entities/daily-insight.entity';
import { Repository } from 'typeorm';
import { MonthlyInsight } from './entities/monthly-insight.entity';
import { Post } from 'src/post/entities/post.entity';
import { format } from 'date-fns';

@Injectable()
export class InsightService {
  constructor(
    @InjectRepository(DailyInsight)
    private readonly dailyInsightRepository: Repository<DailyInsight>,
    @InjectRepository(MonthlyInsight)
    private readonly monthlyInsightRepository: Repository<MonthlyInsight>,
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>
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

    const existingInsightMap = new Map();

    for (const insight of existingInsights) {
      existingInsightMap.set(insight.postId, insight);
    }

    const dailyInsightData = [];

    const oneDayAgo = new Date().getTime() - 60 * 60 * 24 * 1000;
    const date = format(new Date(oneDayAgo), 'yyyy-MM-dd');

    console.log('date', date);

    for (const post of posts) {
      const existingInsightData = existingInsightMap.get(post.id);

      const viewCount = existingInsightData ? post.viewCount - existingInsightData.totalViews : post.viewCount;
      const likeCount = existingInsightData ? post.likeCount - existingInsightData.totalLikes : post.likeCount;
      const commentCount = existingInsightData
        ? post.commentCount - existingInsightData.totalComments
        : post.commentCount;
      const salesCount = existingInsightData ? post.salesCount - existingInsightData.totalSales : post.salesCount;

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

    await this.dailyInsightRepository.save(dailyInsightData);
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

    const oneMonthAgo = new Date().getTime() - 60 * 60 * 24 * 30 * 1000;
    const date = format(new Date(oneMonthAgo), 'yyyy-MM');

    console.log('date', date);

    for (const post of posts) {
      const existingInsightData = existingInsightMap.get(post.id);

      const viewCount = existingInsightData ? post.viewCount - existingInsightData.totalViews : post.viewCount;
      const likeCount = existingInsightData ? post.likeCount - existingInsightData.totalLikes : post.likeCount;
      const commentCount = existingInsightData
        ? post.commentCount - existingInsightData.totalComments
        : post.commentCount;
      const salesCount = existingInsightData ? post.salesCount - existingInsightData.totalSales : post.salesCount;

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

    await this.monthlyInsightRepository.save(monthlyInsightData);
  }
}
