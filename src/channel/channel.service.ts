import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Channel } from './entities/channel.entity';
import { FindOptionsWhere, Repository } from 'typeorm';
import { CreateChannelDto } from './dtos/create-channel.dto';
import { UpdateChannelDto } from './dtos/update-channel.dto';
import { VisibilityType } from 'src/post/types/visibility.type';
import { User } from 'src/user/entities/user.entity';
import { Series } from 'src/series/entities/series.entity';
import { Post } from 'src/post/entities/post.entity';
import { TAKE_COUNT } from 'src/constants/page.constant';
import { paginate } from 'nestjs-typeorm-paginate';
import { DailyInsight } from 'src/insight/entities/daily-insight.entity';
import { MonthlyInsight } from 'src/insight/entities/monthly-insight.entity';
import { format, isValid } from 'date-fns';
import { InsightSort } from './types/insight-sort.type';

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
    private readonly monthlyInsightRepository: Repository<MonthlyInsight>
  ) {}

  //채널 생성
  async createChannel(userId: number, createChannelDto: CreateChannelDto) {
    const channel = await this.channelRepository.save({ userId, ...createChannelDto });

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

    const { items, meta } = await paginate<Channel>(this.channelRepository, { page, limit }, { where: { userId } });

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
      take: TAKE_COUNT,
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
      take: TAKE_COUNT,
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
  async updateChannel(userId: number, channelId: number, updateChannelDto: UpdateChannelDto) {
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

    const updatedChannel = await this.channelRepository.save({ id: channel.id, ...updateChannelDto });

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

  // 채널 통계 조회
  async findInsights(userId: number, channelId: number) {
    const channel = await this.channelRepository.findOneBy({ id: channelId, userId });

    if (!channel) {
      throw new NotFoundException('해당 아이디의 내 채널이 존재하지 않습니다.');
    }

    const oneDayAgo = new Date().getTime() - 60 * 60 * 24 * 1000;
    const daily = format(new Date(oneDayAgo), 'yyyy-MM-dd');

    const oneMonthAgo = new Date().getTime() - 60 * 60 * 24 * 30 * 1000;
    const monthly = format(new Date(oneMonthAgo), 'yyyy-MM');

    // 일별 포스트 전체 합산
    const dailyInsights = await this.dailyInsightRepository
      .createQueryBuilder('insight')
      .select('SUM(insight.viewCount)', 'totalViews')
      .addSelect('SUM(insight.likeCount)', 'totalLikes')
      .addSelect('SUM(insight.commentCount)', 'totalComments')
      .addSelect('SUM(insight.salesCount)', 'totalSales')
      .where('insight.channelId = :channelId', { channelId })
      .andWhere('insight.date = :daily', { daily })
      .getRawOne();

    // 월별 포스트 전체 합산
    const monthlyInsights = await this.monthlyInsightRepository
      .createQueryBuilder('insight')
      .select('SUM(insight.viewCount)', 'totalViews')
      .addSelect('SUM(insight.likeCount)', 'totalLikes')
      .addSelect('SUM(insight.commentCount)', 'totalComments')
      .addSelect('SUM(insight.salesCount)', 'totalSales')
      .where('insight.channelId = :channelId', { channelId })
      .andWhere('insight.date LIKE :monthly', { monthly })
      .getRawOne();

    return { dailyInsights, monthlyInsights };
  }

  // 일별 포스트 통계 전체 조회
  async findDailyInsights(userId: number, channelId: number, date?: string, sort?: InsightSort) {
    const oneDayAgo = new Date().getTime() - 60 * 60 * 24 * 1000;
    const dateTime = date ? `${date}` : undefined;

    const validDate = isValid(new Date(dateTime));

    if (date && !validDate) {
      throw new BadRequestException('유효하지 않은 날짜입니다.');
    }

    if (date && new Date(dateTime).getTime() > oneDayAgo) {
      throw new BadRequestException('아직 통계가 계산되지 않은 날짜입니다.');
    }

    const channel = await this.channelRepository.findOneBy({ id: channelId, userId });

    if (!channel) {
      throw new NotFoundException('해당 아이디의 내 채널이 없습니다.');
    }

    const dailyInsights = await this.dailyInsightRepository.find({
      where: {
        channelId,
        date: date ?? format(new Date(oneDayAgo), 'yyyy-MM-dd'),
      },
      order: { [sort]: 'DESC' },
    });

    return dailyInsights;
  }

  // 월별 포스트 통계 전체 조회
  async findMonthlyInsights(userId: number, channelId: number, date?: string, sort?: InsightSort) {
    const oneMonthAgo = new Date().getTime() - 60 * 60 * 24 * 30 * 1000;
    const dateTime = date ? `${date}-01` : undefined;

    const validDate = isValid(new Date(dateTime));

    if (date && !validDate) {
      throw new BadRequestException('유효하지 않은 날짜입니다.');
    }

    if (date && new Date(dateTime).getTime() > oneMonthAgo) {
      throw new BadRequestException('아직 통계가 계산되지 않은 달입니다.');
    }

    const channel = await this.channelRepository.findOneBy({ id: channelId, userId });

    if (!channel) {
      throw new NotFoundException('해당 아이디의 내 채널이 없습니다.');
    }

    const monthlyInsights = await this.monthlyInsightRepository.find({
      where: {
        channelId,
        date: date ?? format(oneMonthAgo, 'yyyy-MM'),
      },
      order: { [sort]: 'DESC' },
    });

    return monthlyInsights;
  }
}
