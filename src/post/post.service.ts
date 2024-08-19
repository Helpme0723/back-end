import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { DataSource, Repository } from 'typeorm';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { VisibilityType } from './types/visibility.type';
import { Channel } from 'src/channel/entities/channel.entity';
import { Series } from 'src/series/entities/series.entity';
import { PostLike } from './entities/post-like.entity';
import { PurchaseList } from 'src/purchase/entities/purchase-list.entity';
import { paginate } from 'nestjs-typeorm-paginate';
import { FindAllPostDto } from './dto/find-all-post-by-channel-id.dto';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { createClient, RedisClientType } from 'redis';
import { ConfigService } from '@nestjs/config';
import { User } from 'src/user/entities/user.entity';
import { NotificationsService } from 'src/notification/notification.service';
import { UserInfo } from 'src/auth/decorators/user-info.decorator';

@Injectable()
export class PostService {
  private redisClient: RedisClientType;
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    @InjectRepository(Channel)
    private readonly channelRepository: Repository<Channel>,
    @InjectRepository(Series)
    private readonly seriesRepository: Repository<Series>,
    @InjectRepository(PostLike)
    private readonly postLikeRepository: Repository<PostLike>,
    @InjectRepository(PurchaseList)
    private readonly purchaseListRepository: Repository<PurchaseList>,
    private readonly dataSource: DataSource,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly configService: ConfigService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly notificationsService: NotificationsService
  ) {
    this.redisClient = createClient({
      socket: {
        host: configService.get<string>('REDIS_HOST'),
        port: configService.get<number>('REDIS_PORT'),
      },
      username: configService.get<string>('REDIS_USERNAME'),
      password: configService.get<string>('REDIS_PASSWORD'),
    });
    this.redisClient.connect().catch(console.error);
  }

  private async purchaseCheck(postId: number) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const post = await this.postRepository.findOne({
      where: { id: postId },
    });
    const purchasedPost = await this.purchaseListRepository.find({
      where: { postId: post.id },
    });
    if (purchasedPost.length > 0) {
      return true;
    } else {
      return false;
    }
  }

  async create(userId: number, createPostDto: CreatePostDto) {
    const { channelId, seriesId, price, ...postData } = createPostDto;
    const channel = await this.channelRepository.findOne({
      where: { userId, id: channelId },
    });
    if (channelId !== channel?.id) {
      throw new UnauthorizedException('채널접근 권한이없습니다');
    }
    const series = await this.seriesRepository.findOne({
      where: { userId, id: seriesId },
    });
    if (seriesId && seriesId !== series?.id) {
      throw new UnauthorizedException('시리즈에 접근 권한이 없습니다');
    }
    if (price > 500000) {
      throw new BadRequestException('가격은 500000포인트를 초과할수 없습니다.');
    }
    const post = this.postRepository.create({
      userId,
      channelId,
      seriesId,
      price,
      ...postData,
    });
    await this.postRepository.save(post);

    const keys = await this.cacheManager.store.keys(`posts:undefined-*`);

    await Promise.all(keys.map((key) => this.cacheManager.del(key)));

    const keys2 = await this.cacheManager.store.keys(`posts:${channelId}-*`);

    await Promise.all(keys2.map((key) => this.cacheManager.del(key)));

    const findAllPostDto = new FindAllPostDto();
    await this.findAll(findAllPostDto);
    findAllPostDto.channelId = channelId;
    await this.findAll(findAllPostDto);

    return post;
  }

  async findAllLogin(userId: number, findAllPostDto: FindAllPostDto) {
    const { channelId, page, limit, sort, categoryId } = findAllPostDto;

    const channel = await this.channelRepository.findOne({
      where: { id: channelId },
    });

    if (channelId && !channel) {
      throw new NotFoundException('존재하지 않은 채널입니다.');
    }

    const { items, meta } = await paginate<Post>(
      this.postRepository,
      { page, limit },
      {
        where: {
          visibility: VisibilityType.PUBLIC,
          ...(channelId && { channelId }),
          ...(categoryId && { categoryId }),
          deletedAt: null,
        },
        order: {
          createdAt: sort,
        },
        relations: { user: true, purchaseLists: true },
      }
    );

    const posts = await Promise.all(
      items.map(async (item) => ({
        id: item.id,
        userId: item.userId,
        channelId: item.channelId,
        seriesId: item.seriesId,
        categoryId: item.categoryId,
        title: item.title,
        thumbNail: item.thumbNail,
        preview: item.preview,
        price: item.price,
        visibility: item.visibility,
        viewCount: item.viewCount,
        likeCount: item.likeCount,
        commentCount: item.commentCount,
        createdAt: item.createdAt,
        userName: item.user.nickname,
        userImage: item.user.profileUrl,
        // isPurchased: await this.purchaseCheck(item.id),
      }))
    );

    const returnValue = { posts, meta };

    return returnValue;
  }

  async findAll(findAllPostDto: FindAllPostDto) {
    const { channelId, page, limit, sort, categoryId } = findAllPostDto;

    const cacheKey = `posts:${channelId}-${page}-${limit}-${sort}-${categoryId}`;

    const cachedPosts = await this.cacheManager.get<string>(cacheKey);

    if (cachedPosts) {
      return cachedPosts;
    }

    const channel = await this.channelRepository.findOne({
      where: { id: channelId },
    });

    if (channelId && !channel) {
      throw new NotFoundException('존재하지 않은 채널입니다.');
    }
    const { items, meta } = await paginate<Post>(
      this.postRepository,
      { page, limit },
      {
        where: {
          visibility: VisibilityType.PUBLIC,
          ...(channelId && { channelId }),
          ...(categoryId && { categoryId }),
          deletedAt: null,
        },
        order: {
          createdAt: sort,
        },
        relations: { user: true },
      }
    );

    const posts = items.map((item) => ({
      id: item.id,
      userId: item.userId,
      channelId: item.channelId,
      seriesId: item.seriesId,
      categoryId: item.categoryId,
      title: item.title,
      thumbNail: item.thumbNail,
      preview: item.preview,
      price: item.price,
      visibility: item.visibility,
      viewCount: item.viewCount,
      likeCount: item.likeCount,
      commentCount: item.commentCount,
      createdAt: item.createdAt,
      userName: item.user.nickname,
      userImage: item.user.profileUrl,
    }));
    const returnValue = { posts, meta };

    const ttl = 60 * 5;
    await this.cacheManager.set(cacheKey, returnValue, { ttl });
    return returnValue;
  }

  // 포스트 상세 조회
  async findOne(userId: number, id: number) {
    // 해당 포스트 찾기
    const post = await this.postRepository.findOne({
      relations: { comments: true, user: true, channel: true, series: true },
      where: { id },
      withDeleted: true,
    });

    // 해당하는 아이디의 포스터가 없으면 오류 반환
    if (!post) {
      throw new NotFoundException('포스트를 찾을수 없습니다.');
    }

    const mappedPost = {
      postId: post.id,
      userId: post.userId,
      userName: post.user.nickname,
      userImage: post.user.profileUrl,
      channelId: post.channelId,
      channelTitle: post.channel ? post.channel.title : null,
      seriesId: post.seriesId,
      seriesTitle: post.series ? post.series.title : null,
      title: post.title,
      thumbNail: post.thumbNail,
      preview: post.preview,
      content: post.content,
      price: post.price,
      viewCount: post.viewCount,
      likeCount: post.likeCount,
      commentCount: post.commentCount,
      createdAt: post.createdAt,
      comments: post.comments.splice(0, 5).map((comment) => ({
        id: comment.id,
        content: comment.content,
        likeCount: comment.likeCount,
        createdAt: comment.createdAt,
      })),
    };

    // 포스트 작성자고, 삭제되지 않은 포스트라면 전체 포스트 반환
    if (!post.deletedAt && post.userId === userId) {
      return mappedPost;
    }

    // 비공개 포스트거나, 삭제된 포스트
    if (post.visibility === VisibilityType.PRIVATE || post.deletedAt) {
      // 구매 이력이 있는지 확인
      const purchasedPost = await this.purchaseListRepository.findOneBy({
        postId: id,
        userId,
      });

      // 구매 이력이 없다면 접근 권한 오류
      if (!purchasedPost) {
        throw new ForbiddenException('삭제 또는 비공개 된 포스트입니다.');
      }

      // 구매 이력이 있다면 전체 내용 반환
      if (purchasedPost) {
        return mappedPost;
      }
    }

    // 유료 포스트일 경우
    if (post?.price !== 0) {
      // 구매 이력이 있는지 확인
      const purchasedPost = await this.purchaseListRepository.findOneBy({
        postId: id,
        userId,
      });

      // 구매 이력이 있다면 전체 포스트 반환
      if (purchasedPost) {
        return mappedPost;
      }

      // 구매 이력이 없다면 전체 내용을 제외하고 반환
      if (!purchasedPost) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { content: _content, ...etc } = mappedPost;

        return etc;
      }
    }

    // 삭제되지 않았고, 내 포스트가 아니며, 무료 포스트일 때 반환
    return mappedPost;
  }

  async readOne(id: number) {
    const post = await this.postRepository.findOne({
      relations: { comments: true, user: true },
      where: { id, deletedAt: null, visibility: VisibilityType.PUBLIC },
    });
    if (!post) {
      throw new NotFoundException('포스트를 찾을수 없습니다.');
    }
    if (post.price > 0) {
      post.content = undefined;
    }
    //TODO:콘솔지우기
    post.comments = post.comments.splice(0, 5);

    return post;
  }

  async incrementViewCount(id: number) {
    await this.postRepository.increment({ id }, 'viewCount', 1);
  }

  async findMy(userId: number, findAllPostDto: FindAllPostDto) {
    const { channelId, page, limit, sort } = findAllPostDto;

    const channel = await this.channelRepository.findOne({
      relations: { user: true },
      where: { id: channelId, userId },
    });

    if (!channel) {
      throw new NotFoundException('존재하지 않은 채널입니다.');
    }

    const { items, meta } = await paginate<Post>(
      this.postRepository,

      { page, limit },
      {
        where: { userId, channelId },
        order: { createdAt: sort },
        relations: { user: true },
      }
    );

    return {
      posts: items.map((item) => ({
        id: item.id,
        userId: item.userId,
        channelId: item.channelId,
        seriesId: item.seriesId,
        categoryId: item.categoryId,
        title: item.title,
        thumbNail: item.thumbNail,
        preview: item.preview,
        content: item.content,
        price: item.price,
        visibility: item.visibility,
        viewCount: item.visibility,
        likeCount: item.likeCount,
        commentCount: item.commentCount,
        salesCount: item.salesCount,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        userName: item.user.nickname,
        userImage: item.user.profileUrl,
      })),
      meta,
    };
  }

  async update(userId: number, id: number, updatePostDto: UpdatePostDto) {
    const { channelId, seriesId, price } = updatePostDto;
    const post = await this.postRepository.findOne({
      where: { id, userId },
    });
    if (!post) {
      throw new NotFoundException('포스트를 찾을수 없습니다.');
    }
    const channel = await this.channelRepository.findOne({
      where: { userId, id: channelId },
    });

    if (channelId && channelId !== channel?.id) {
      throw new UnauthorizedException('채널접근 권한이없습니다');
    }
    const series = await this.seriesRepository.findOne({
      where: { id: seriesId },
    });
    if (!series) {
      throw new NotFoundException('존재하지 않은 시리즈입니다.');
    }
    if (seriesId && series.userId !== userId) {
      throw new UnauthorizedException('접근권한이 없는 시리즈입니다.');
    }
    if (price > 500000) {
      throw new BadRequestException('가격은 500000포인트를 초과할수 없습니다.');
    }
    const newPost = {
      ...post,
      ...updatePostDto,
    };
    const data = await this.postRepository.save(newPost);
    return data;
  }

  async changeSeries(userId: number, id: number, seriesId: number) {
    const post = await this.postRepository.findOne({
      where: { id, userId },
    });
    if (!post) {
      throw new NotFoundException('포스트를 찾을수 없습니다.');
    }
    const newPost = {
      ...post,
      seriesId,
    };
    const data = await this.postRepository.save(newPost);
    return data;
  }

  async delete(userId: number, id: number) {
    const post = await this.postRepository.findOne({
      where: { id, userId },
    });
    if (!post) {
      throw new NotFoundException('포스트 를 찾지못했습니다.');
    }
    await this.postRepository.softDelete({ id });
    const cacheKey = `posts:*`;
    await this.deleteKeysByPattern(cacheKey);
  }

  private async deleteKeysByPattern(pattern: string): Promise<void> {
    // cacheManager의 Redis 클라이언트 접근
    const keys = [];
    for await (const key of this.redisClient.scanIterator({
      MATCH: pattern,
      COUNT: 100, // 한 번에 검색할 키의 수
    })) {
      keys.push(key);
    }
    if (keys.length) {
      await this.redisClient.del(keys);
    }
  }

  // 스캔 이터레이터로 검색하고 매치를 통해 키값을 찾아내고 최대 100개까지 pattern = cachekey
  // scanIterator = 역활 == 레디스에 있는 키를 검색
  //매치에 와일드 카드 posts:*
  //레디스에 저장되어있는 json형태로 저장되어있는 데이터를 찔끔찔끔
  async createPostLike(userId: number, id: number) {
    const post = await this.postRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (post.visibility === VisibilityType.PRIVATE) {
      throw new BadRequestException('비공개처리된 포스트입니다.');
    }
    if (!post) {
      throw new NotFoundException('포스트를 찾을수없습니다');
    }
    if (post.userId === userId) {
      throw new BadRequestException('내 포스트에는 좋아요를 남길수 없습니다');
    }

    //이미 포스트에 좋아요를 했는지 확인하기
    const existPostLike = await this.postLikeRepository.findOne({
      where: { postId: post.id, userId },
    });
    if (existPostLike) {
      throw new ConflictException('이미 좋아요를 등록하였습니다.');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      //post 라이크카운트 1씩 증가해주기
      await queryRunner.manager.increment(Post, { id }, 'likeCount', 1);

      //postLike 테이블에 포스트아이디 유저아이디 저장해주기
      const postLikeData = this.postLikeRepository.create({
        userId,
        postId: id,
      });
      await queryRunner.manager.save(PostLike, postLikeData);

      // 좋아요를 누른 사용자 정보 조회
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user) {
        throw new NotFoundException(
          `사용자를 찾을 수 없습니다. userId: ${userId}`
        );
      }

      await queryRunner.commitTransaction();
      // 알림 전송 로직 추가 (좋아요 알림 설정 확인)
      const notificationSettings =
        await this.notificationsService.getSettingsForUser(post.user.id);
      if (notificationSettings?.postLikeNotifications) {
        // likeNotifications 설정 확인
        this.notificationsService.sendNotification(
          post.user.id,
          `사용자 "${user.nickname}"님이 당신의 포스트 "${post.title}"에 좋아요를 눌렀습니다.`
        );
      }

      await queryRunner.release();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();

      throw new InternalServerErrorException('서버에 에러가발생했습니다.');
    }
  }

  async deletePostLike(userId: number, id: number) {
    const likeData = await this.postLikeRepository.findOne({
      where: { userId, postId: id },
    });
    if (!likeData) {
      throw new NotFoundException('좋아요를 한 포스트가 아닙니다.');
    }
    const post = await this.postRepository.findOne({
      where: { id },
    });
    if (post.visibility === VisibilityType.PRIVATE) {
      throw new BadRequestException('비공개처리된 포스트입니다.');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager.decrement(Post, { id }, 'likeCount', 1);

      await queryRunner.manager.delete(PostLike, { id: likeData.id });

      await queryRunner.commitTransaction();
      await queryRunner.release();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();

      throw new InternalServerErrorException('서버에 에러가 발생햇습니다.');
    }
  }

  // 내가 좋아요한 포스트인지 확인
  async getPostLikeCheck(userId: number, postId: number) {
    const data = await this.postLikeRepository.findOne({
      where: { userId, postId },
    });

    return data ? true : false;
  }
}
