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
import { TAKE_COUNT } from 'src/constants/page.constant';
import { paginate } from 'nestjs-typeorm-paginate';
import { DailyInsight } from 'src/insight/entities/daily-insight.entity';
import { MonthlyInsight } from 'src/insight/entities/monthly-insight.entity';
import { format, isValid, sub } from 'date-fns';
import { FindDailyInsightsDto } from './dtos/find-daily-insights.dto';
import { FindMonthlyInsightsDto } from './dtos/find-monthly-insights.dto';
import { ChannelDailyInsight } from 'src/insight/entities/channel-daily-insight.entity';
import { ChannelMonthlyInsight } from 'src/insight/entities/channel-monthly-insight.entity';

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

  // 채널 통계 조회
  async findInsights(userId: number, channelId: number) {
    const channel = await this.channelRepository.findOneBy({
      id: channelId,
      userId,
    });

    if (!channel) {
      throw new NotFoundException('해당 아이디의 내 채널이 존재하지 않습니다.');
    }

    const oneDayAgo = sub(new Date(), { days: 1 });
    const daily = format(oneDayAgo, 'yyyy-MM-dd');

    const oneMonthAgo = sub(new Date(), { months: 1 });
    const monthly = format(oneMonthAgo, 'yyyy-MM');

    // 일별 포스트 전체 합산
    const dailyInsights = await this.channelDailyInsightRepository.findOneBy({
      channelId,
      date: daily,
    });

    // 월별 포스트 전체 합산
    const monthlyInsights =
      await this.channelMonthlyInsightRepository.findOneBy({
        channelId,
        date: monthly,
      });

    return { dailyInsights, monthlyInsights };
  }

  // 일별 포스트 통계 전체 조회
  async findDailyInsights(
    userId: number,
    channelId: number,
    findDailyInsightsDto: FindDailyInsightsDto
  ) {
    const { sort, page, limit } = findDailyInsightsDto;

    const oneDayAgo = sub(new Date(), { days: 1 });

    const date = findDailyInsightsDto.date ?? format(oneDayAgo, 'yyyy-MM-dd');

    const validDate = isValid(new Date(date));

    if (!validDate) {
      throw new BadRequestException('유효하지 않은 날짜입니다.');
    }

    if (new Date(date) > oneDayAgo) {
      throw new BadRequestException('아직 통계가 계산되지 않은 날짜입니다.');
    }

    const channel = await this.channelRepository.findOneBy({
      id: channelId,
      userId,
    });

    if (!channel) {
      throw new NotFoundException('해당 아이디의 내 채널이 없습니다.');
    }

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

  // 월별 포스트 통계 전체 조회
  async findMonthlyInsights(
    userId: number,
    channelId: number,
    findMonthlyInsightsDto: FindMonthlyInsightsDto
  ) {
    const { sort, page, limit } = findMonthlyInsightsDto;

    const oneMonthAgo = sub(new Date(), { months: 1 });

    const date = findMonthlyInsightsDto.date ?? format(oneMonthAgo, 'yyyy-MM');

    const dateTime = `${date}-01`;

    const validDate = isValid(new Date(dateTime));

    if (!validDate) {
      throw new BadRequestException('유효하지 않은 날짜입니다.');
    }

    if (new Date(dateTime) > oneMonthAgo) {
      throw new BadRequestException('아직 통계가 계산되지 않은 달입니다.');
    }

    const channel = await this.channelRepository.findOneBy({
      id: channelId,
      userId,
    });

    if (!channel) {
      throw new NotFoundException('해당 아이디의 내 채널이 없습니다.');
    }

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
