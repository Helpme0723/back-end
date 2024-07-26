import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotAcceptableException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Channel } from './entities/channel.entity';
import { DataSource, FindOptionsWhere, Repository } from 'typeorm';
import { CreateChannelDto } from './dtos/create-channel.dto';
import { UpdateChannelDto } from './dtos/update-channel.dto';
import { VisibilityType } from 'src/post/types/visibility.type';
import { User } from 'src/user/entities/user.entity';
import { Series } from 'src/series/entities/series.entity';
import { Post } from 'src/post/entities/post.entity';
import { CHANNEL_LIMIT, TAKE_COUNT } from 'src/constants/page.constant';

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
    private readonly postRepository: Repository<Post>
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
  async findAllChannels(userId: number, page: number) {
    // 존재하는 유저인지 확인해주기
    const user = await this.userRepository.findOneBy({ id: userId });

    if (!user) {
      throw new NotFoundException('존재하지 않는 유저입니다.');
    }

    const offset = (page - 1) * CHANNEL_LIMIT;

    const [channels, total] = await this.channelRepository.findAndCount({
      where: { userId },
      skip: offset,
      take: CHANNEL_LIMIT,
    });

    if (page !== 1 && page > Math.ceil(total / CHANNEL_LIMIT)) {
      throw new NotFoundException('존재하지 않는 페이지입니다.');
    }

    return {
      channels: channels.map((channel) => ({
        id: channel.id,
        title: channel.title,
        description: channel.description,
        imageUrl: channel.imageUrl,
        subscribers: channel.subscribers,
      })),
      total,
      page,
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
      throw new NotAcceptableException('해당 아이디의 내 채널이 존재하지 않습니다.');
    }

    if (channel.userId !== userId) {
      throw new ForbiddenException('삭제 권한이 없는 채널입니다.');
    }

    await this.channelRepository.softRemove(channel);

    return true;
  }
}
