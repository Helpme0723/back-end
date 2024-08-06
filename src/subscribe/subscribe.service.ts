import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Subscribe } from './entities/subscribe.entity';
import { DataSource, In, Repository } from 'typeorm';
import { Channel } from 'src/channel/entities/channel.entity';
import { paginate } from 'nestjs-typeorm-paginate';
import { Post } from 'src/post/entities/post.entity';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';

@Injectable()
export class SubscribeService {
  constructor(
    @InjectRepository(Subscribe)
    private readonly subscribeRepository: Repository<Subscribe>,
    @InjectRepository(Channel)
    private readonly channelRepository: Repository<Channel>,
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    private readonly dataSource: DataSource,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache
  ) {}

  // 채널 구독
  async createSubscribe(userId: number, channelId: number) {
    // 해당 채널이 있는지 확인
    const channel = await this.channelRepository.findOneBy({ id: channelId });

    // 채널이 없으면 에러
    if (!channel) {
      throw new NotFoundException('해당 아이디의 채널이 없습니다.');
    }

    if (channel.userId === userId) {
      throw new BadRequestException('내 채널은 구독할 수 없습니다.');
    }

    // 해당 유저가 해당 채널을 이미 구독했는지 조회
    const existingSubscribe = await this.subscribeRepository.findOneBy({
      userId,
      channelId,
    });

    // 이미 구독했으면 오류
    if (existingSubscribe) {
      throw new ConflictException('이미 구독한 채널입니다.');
    }

    // 여기서부터 트랜잭션
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 채널의 subscribers에 +1 해서 저장
      await queryRunner.manager.increment(
        Channel,
        { id: channelId },
        'subscribers',
        1
      );

      // subscribe에 구독 정보 저장
      const subscribeData = this.subscribeRepository.create({
        userId,
        channelId,
      });
      await queryRunner.manager.save(Subscribe, subscribeData);

      await queryRunner.commitTransaction();
      await queryRunner.release();

      return true;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();

      throw new InternalServerErrorException('인터넷 서버 에러');
    }
  }

  // 채널 구독 취소
  async deleteSubscribe(userId: number, channelId: number) {
    const subscribe = await this.subscribeRepository.findOneBy({
      userId,
      channelId,
    });

    if (!subscribe) {
      throw new BadRequestException('구독하지 않은 채널입니다.');
    }

    //여기부터 트랜잭션 시작
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 채널의 subscribers에 -1 해서 저장
      await queryRunner.manager.decrement(
        Channel,
        { id: channelId },
        'subscribers',
        1
      );

      // subscribe에서 구독 정보 삭제
      await queryRunner.manager.delete(Subscribe, { id: subscribe.id });

      await queryRunner.commitTransaction();
      await queryRunner.release();

      return true;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();

      throw new InternalServerErrorException('인터넷 서버 에러');
    }
  }

  // 내 구독 목록 조회
  async findAllSubsCribe(userId: number, page: number, limit: number) {
    const { items, meta } = await paginate<Subscribe>(
      this.subscribeRepository,
      { page, limit },
      {
        where: { userId },
        relations: {
          channel: {
            user: true,
          },
        },
      }
    );

    return {
      subscribes: items.map((item) => ({
        id: item.id,
        ownerId: item.channel.user.id,
        ownerNickname: item.channel.user.nickname,
        ownerProfileUrl: item.channel.user.profileUrl,
        channelId: item.channelId,
        title: item.channel.title,
        description: item.channel.description,
        imageUrl: item.channel.imageUrl,
        subscribers: item.channel.subscribers,
      })),
      meta,
    };
  }

  // 내가 구독한 채널의 포스트 모아보기
  async findAllSubscribePosts(userId: number, page: number, limit: number) {
    // 레디스에서 조회 or 저장할 키 지정
    const cacheKey = `subscribePosts:${userId}-${page}-${limit}`;

    // 레디스에서 해당 키의 캐시 데이터가 있는지 확인
    const cachedPosts = await this.cacheManager.get<string>(cacheKey);

    // 해당 데이터가 있으면 해당 데이터 반환
    if (cachedPosts) {
      return cachedPosts;
    }

    const subscribes = await this.subscribeRepository.find({
      where: { userId },
      relations: { channel: true },
    });

    const channelIds = subscribes.map((subscribe) => subscribe.channel.id);

    const { items, meta } = await paginate<Post>(
      this.postRepository,
      { page, limit },
      {
        where: { channelId: In(channelIds) },
        relations: {
          channel: {
            user: true,
          },
        },
        order: { createdAt: 'DESC' },
      }
    );

    const posts = items.map((post) => ({
      channelId: post.channel.id,
      channelTitle: post.channel.title,
      channelImgUrl: post.channel.imageUrl,
      ownerId: post.channel.user.id,
      ownerNickname: post.channel.user.nickname,
      id: post.id,
      title: post.title,
      viewCount: post.viewCount,
      likeCount: post.likeCount,
      commentCount: post.commentCount,
      price: post.price,
      createdAt: post.createdAt,
    }));

    const returnValue = { posts, meta };

    // 레디스에 저장된 데이터 없으면 레디스에 저장
    const ttl = 60 * 5;
    await this.cacheManager.set(cacheKey, returnValue, { ttl });

    return returnValue;
  }
}
