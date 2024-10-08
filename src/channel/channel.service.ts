import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Channel } from './entities/channel.entity';
import { FindOptionsWhere, Repository } from 'typeorm';
import { CreateChannelDto } from './dtos/create-channel.dto';
import { UpdateChannelDto } from './dtos/update-channel.dto';
import { VisibilityType } from 'src/post/types/visibility.type';
import { User } from 'src/user/entities/user.entity';
import { Series } from 'src/series/entities/series.entity';
import { Post } from 'src/post/entities/post.entity';
import { paginate } from 'nestjs-typeorm-paginate';
import { DailyInsight } from 'src/insight/entities/daily-insight.entity';
import { MonthlyInsight } from 'src/insight/entities/monthly-insight.entity';
import { format, isValid } from 'date-fns';
import { FindDailyInsightsDto } from './dtos/find-daily-insights.dto';
import { FindMonthlyInsightsDto } from './dtos/find-monthly-insights.dto';
import { ChannelDailyInsight } from 'src/insight/entities/channel-daily-insight.entity';
import { ChannelMonthlyInsight } from 'src/insight/entities/channel-monthly-insight.entity';
import { InsightSort } from './types/insight-sort.type';
import { calculateInsightCount } from 'src/utils/count.util';
import { toZonedTime } from 'date-fns-tz';

@Injectable()
export class ChannelService {
  constructor(
    @InjectRepository(Channel)
    private readonly channelRepository: Repository<Channel>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Series)
    private readonly seriesRepository: Repository<Series>,
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    @InjectRepository(DailyInsight)
    private readonly dailyInsightRepository: Repository<DailyInsight>,
    @InjectRepository(MonthlyInsight)
    private readonly monthlyInsightRepository: Repository<MonthlyInsight>,
    @InjectRepository(ChannelDailyInsight)
    private readonly channelDailyInsightRepository: Repository<ChannelDailyInsight>,
    @InjectRepository(ChannelMonthlyInsight)
    private readonly channelMonthlyInsightRepository: Repository<ChannelMonthlyInsight>
  ) {}

  //채널 생성
  async createChannel(userId: number, createChannelDto: CreateChannelDto) {
    const channel = await this.channelRepository.save({
      userId,
      ...createChannelDto,
    });

    return {
      id: channel.id,
      title: channel.title,
      description: channel.description,
      imageUrl: channel.imageUrl,
    };
  }

  // 채널 모두 조회
  async findAllChannels(userId: number, page: number, limit: number) {
    // 존재하는 유저인지 확인해주기
    const user = await this.userRepository.findOneBy({ id: userId });

    if (!user) {
      throw new NotFoundException('존재하지 않는 유저입니다.');
    }

    const { items, meta } = await paginate<Channel>(
      this.channelRepository,
      { page, limit },
      { where: { userId } }
    );

    return {
      channels: items.map((item) => ({
        id: item.id,
        title: item.title,
        description: item.description,
        imageUrl: item.imageUrl,
        subscribers: item.subscribers,
      })),
      meta,
    };
  }

  // 채널 상세 조회
  async findOneChannel(channelId: number, userId?: number) {
    const whereCondition: FindOptionsWhere<Channel> = { id: channelId };

    // 채널 주인일 때
    if (userId) {
      whereCondition.userId = userId;
    }

    const channel = await this.channelRepository.findOne({
      where: whereCondition,
      relations: {
        user: true,
      },
    });

    if (!channel) {
      throw new NotFoundException('해당 아이디의 채널이 존재하지 않습니다.');
    }

    const series = await this.seriesRepository.find({
      where: { channelId },
      order: { createdAt: 'DESC' },
    });

    const postsWhereCondition: FindOptionsWhere<Post> = { channelId };

    if (!userId || channel.userId !== userId) {
      postsWhereCondition.visibility = VisibilityType.PUBLIC;
    }

    const posts = await this.postRepository.find({
      where: postsWhereCondition,
      relations: {
        category: true,
        tags: true,
      },
      order: { createdAt: 'DESC' },
    });

    return this.mapChannelData(channel, series, posts);
  }

  // 채널 상세 조회 반환값 평탄화
  mapChannelData(channel: Channel, series: Series[], posts: Post[]) {
    const mappedSeries = series.map((series) => ({
      id: series.id,
      title: series.title,
      description: series.description,
      createdAt: series.createdAt,
    }));

    const mappedPosts = posts.map((post) => ({
      id: post.id,
      seriesId: post.seriesId,
      category: post.category.category,
      tags: post.tags,
      title: post.title,
      price: post.price !== 0 ? post.price : '무료',
      visibility: post.visibility,
      viewCount: post.viewCount,
      likeCount: post.likeCount,
      createdAt: post.createdAt,
    }));

    const data = {
      id: channel.id,
      userId: channel.userId,
      nickname: channel.user.nickname,
      title: channel.title,
      description: channel.description,
      imageUrl: channel.imageUrl,
      subscribers: channel.subscribers,
      series: mappedSeries,
      posts: mappedPosts,
    };

    return data;
  }

  // 채널 수정
  async updateChannel(
    userId: number,
    channelId: number,
    updateChannelDto: UpdateChannelDto
  ) {
    const { title, description, imageUrl } = updateChannelDto;

    if (!title && !description && !imageUrl) {
      throw new BadRequestException('수정된 내용이 없습니다.');
    }

    const channel = await this.channelRepository.findOneBy({ id: channelId });

    if (!channel) {
      throw new NotFoundException('해당 아이디의 내 채널이 존재하지 않습니다.');
    }

    if (channel.userId !== userId) {
      throw new ForbiddenException('수정 권한이 없는 채널입니다.');
    }

    const updatedChannel = await this.channelRepository.save({
      id: channel.id,
      ...updateChannelDto,
    });

    return updatedChannel;
  }

  // 채널 삭제
  async deleteChannel(userId: number, channelId: number) {
    const channel = await this.channelRepository.findOne({
      where: { id: channelId },
      relations: {
        series: true,
        posts: true,
      },
    });

    if (!channel) {
      throw new NotFoundException('해당 아이디의 내 채널이 존재하지 않습니다.');
    }

    if (channel.userId !== userId) {
      throw new ForbiddenException('삭제 권한이 없는 채널입니다.');
    }

    await this.channelRepository.softRemove(channel);

    return true;
  }

  // 날짜 유효성 검증
  private validateDate(date: string) {
    if (!isValid(new Date(date))) {
      throw new BadRequestException('유효하지 않은 날짜입니다.');
    }
    if (new Date(date) > new Date()) {
      throw new BadRequestException('아직 통계가 계산되지 않은 날짜입니다.');
    }
  }

  // 채널 존재 유효성 검증
  private async validateChannel(userId: number, channelId: number) {
    const channel = await this.channelRepository.findOneBy({
      id: channelId,
      userId,
    });
    if (!channel) {
      throw new NotFoundException('해당 아이디의 내 채널이 존재하지 않습니다.');
    }
    return channel;
  }

  // 채널 통계 조회
  async findInsights(userId: number, channelId: number) {
    const channel = await this.channelRepository.findOneBy({
      id: channelId,
      userId,
    });

    if (!channel) {
      throw new NotFoundException('해당 아이디의 내 채널이 존재하지 않습니다.');
    }

    const today = toZonedTime(new Date(), 'Asia/Seoul');
    const daily = format(today, 'yyyy-MM-dd');

    const monthly = format(today, 'yyyy-MM');

    const dailyInsights = await this.realTimeChannelInsights(
      channelId,
      daily,
      'daily'
    );

    const monthlyInsights = await this.realTimeChannelInsights(
      channelId,
      monthly,
      'monthly'
    );

    return { dailyInsights, monthlyInsights };
  }

  // 일별 포스트 통계 전체 조회
  async findDailyInsights(
    userId: number,
    channelId: number,
    findDailyInsightsDto: FindDailyInsightsDto
  ) {
    const { sort, page, limit } = findDailyInsightsDto;

    // 오늘 날짜 구하기
    const day = toZonedTime(new Date(), 'Asia/Seoul');
    const today = format(day, 'yyyy-MM-dd');

    // 쿼리로 받은 정보 중에 date가 없다면 오늘 날짜로 설정
    const date = findDailyInsightsDto.date ?? today;

    this.validateDate(date);

    await this.validateChannel(userId, channelId);

    // date가 오늘 날짜라면 realTimeInsights로 계산해서 반환
    if (date === today) {
      const insightData = await this.realTimeInsights(
        channelId,
        date,
        'daily',
        sort
      );

      return insightData;
    } else {
      // 오늘 이전의 날짜라면 db에서 데이터 가져오기
      const { items, meta } = await paginate<DailyInsight>(
        this.dailyInsightRepository,
        { page, limit },
        {
          where: {
            channelId,
            date,
          },
          relations: {
            post: true,
          },
          order: { [sort]: 'DESC' },
        }
      );

      // 아이템에 post가 있을 때만(삭제된 포스트가 아닐 때만) 맵핑해서 반환
      const returnValue = items
        .filter((item) => item.post)
        .map((item) => ({
          id: item.id,
          channelId: item.channelId,
          postId: item.postId,
          title: item.post.title,
          viewCount: item.viewCount,
          likeCount: item.likeCount,
          commentCount: item.commentCount,
          salesCount: item.salesCount,
          date: item.date,
        }));

      return { items: returnValue, meta };
    }
  }

  // 월별 포스트 통계 전체 조회
  async findMonthlyInsights(
    userId: number,
    channelId: number,
    findMonthlyInsightsDto: FindMonthlyInsightsDto
  ) {
    const { sort, page, limit } = findMonthlyInsightsDto;

    const today = toZonedTime(new Date(), 'Asia/Seoul');
    const thisMonth = format(today, 'yyyy-MM');

    const date = findMonthlyInsightsDto.date ?? thisMonth;

    const dateTime = `${date}-01`;

    this.validateDate(dateTime);

    await this.validateChannel(userId, channelId);

    if (date === thisMonth) {
      const insightData = await this.realTimeInsights(
        channelId,
        date,
        'monthly',
        sort
      );

      return insightData;
    } else {
      const { items, meta } = await paginate<MonthlyInsight>(
        this.monthlyInsightRepository,
        { page, limit },
        {
          where: {
            channelId,
            date,
          },
          relations: {
            post: true,
          },
          order: { [sort]: 'DESC' },
        }
      );

      const returnValue = items.map((item) => ({
        id: item.id,
        channelId: item.channelId,
        postId: item.postId,
        title: item.post.title,
        viewCount: item.viewCount,
        likeCount: item.likeCount,
        commentCount: item.commentCount,
        salesCount: item.salesCount,
        date: item.date,
      }));

      return { items: returnValue, meta };
    }
  }

  // 실시간 포스트별 데이터 계산
  async realTimeInsights(
    channelId: number,
    date: string,
    type: string,
    sort: InsightSort
  ) {
    // 모든 포스트를 찾기
    const posts = await this.postRepository.find({ where: { channelId } });

    const insightRepository =
      type === 'daily'
        ? this.dailyInsightRepository
        : this.monthlyInsightRepository;

    const existingInsights = await insightRepository
      .createQueryBuilder('insight')
      .select('insight.postId', 'postId')
      .addSelect('SUM(insight.viewCount)', 'totalViews')
      .addSelect('SUM(insight.likeCount)', 'totalLikes')
      .addSelect('SUM(insight.commentCount)', 'totalComments')
      .addSelect('SUM(insight.salesCount)', 'totalSales')
      .where('insight.channelId = :channelId', { channelId })
      .groupBy('insight.postId')
      .getRawMany();

    const existingInsightMap = new Map();

    for (const insight of existingInsights) {
      existingInsightMap.set(insight.postId, insight);
    }

    const insightData = [];

    for (const post of posts) {
      const existingInsightData = existingInsightMap.get(post.id);

      const counts = calculateInsightCount(post, existingInsightData);

      const data = {
        channelId,
        postId: post.id,
        title: post.title,
        ...counts,
        date,
      };

      insightData.push(data);
    }

    insightData.sort((a, b) => b[sort] - a[sort]);

    return { items: insightData };
  }

  // 일별 포스트 통합 통계 조회
  async findDailyChannelInsights(
    userId: number,
    channelId: number,
    date: string
  ) {
    const day = toZonedTime(new Date(), 'Asia/Seoul');
    const today = format(day, 'yyyy-MM-dd');

    const searchDate = date ?? today;

    this.validateDate(searchDate);

    await this.validateChannel(userId, channelId);

    let dailyInsights;

    if (today === searchDate) {
      dailyInsights = await this.realTimeChannelInsights(
        channelId,
        searchDate,
        'daily'
      );

      return dailyInsights;
    } else {
      dailyInsights = await this.channelDailyInsightRepository.findOneBy({
        channelId,
        date: searchDate,
      });
    }

    return dailyInsights;
  }

  // 월별 포스트 통합 통계 조회
  async findMonthlyChannelInsights(
    userId: number,
    channelId: number,
    date: string
  ) {
    const today = toZonedTime(new Date(), 'Asia/Seoul');
    const thisMonth = format(today, 'yyyy-MM');

    const searchDate = date ?? thisMonth;

    const dateTime = `${searchDate}-01`;

    this.validateDate(dateTime);

    await this.validateChannel(userId, channelId);

    let monthlyInsights;

    if (thisMonth === searchDate) {
      monthlyInsights = await this.realTimeChannelInsights(
        channelId,
        searchDate,
        'monthly'
      );
    } else {
      monthlyInsights = await this.channelMonthlyInsightRepository.findOneBy({
        channelId,
        date: searchDate,
      });
    }

    return monthlyInsights;
  }

  // 실시간 포스트 통합 통계 데이터 계산
  async realTimeChannelInsights(channelId: number, date: string, type: string) {
    const allPostsInsight = await this.postRepository
      .createQueryBuilder('post')
      .select('SUM(post.viewCount)', 'viewCount')
      .addSelect('SUM(post.likeCount)', 'likeCount')
      .addSelect('SUM(post.commentCount)', 'commentCount')
      .addSelect('SUM(post.salesCount)', 'salesCount')
      .where('post.channelId = :channelId', { channelId })
      .groupBy('post.channelId')
      .getRawOne();

    const insightRepository =
      type === 'daily'
        ? this.dailyInsightRepository
        : this.monthlyInsightRepository;

    const existingInsights = await insightRepository
      .createQueryBuilder('insight')
      .select('SUM(insight.viewCount)', 'totalViews')
      .addSelect('SUM(insight.likeCount)', 'totalLikes')
      .addSelect('SUM(insight.commentCount)', 'totalComments')
      .addSelect('SUM(insight.salesCount)', 'totalSales')
      .where('insight.channelId = :channelId', { channelId })
      .groupBy('insight.channelId')
      .getRawOne();

    const counts = calculateInsightCount(allPostsInsight, existingInsights);

    return {
      channelId,
      ...counts,
      date,
    };
  }
}
