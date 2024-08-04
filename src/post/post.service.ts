import {
  BadRequestException,
  ConflictException,
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

@Injectable()
export class PostService {
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
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache
  ) {}

  async create(userId: number, createPostDto: CreatePostDto) {
    const { channelId, seriesId, ...postData } = createPostDto;
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
    const post = this.postRepository.create({
      userId,
      channelId,
      seriesId,
      ...postData,
    });
    await this.postRepository.save(post);
    return post;
  }

  async findAll(findAllPostDto: FindAllPostDto) {
    const { channelId, page, limit, sort } = findAllPostDto;

    const cacheKey = `posts:${channelId}-${page}-${limit}-${sort}`;

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
          deletedAt: null,
        },
        order: {
          createdAt: sort,
        },
      }
    );

    const posts = items.map((item) => ({
      id: item.id,
      userId: item.userId,
      channelId: item.channelId,
      seriesId: item.seriesId,
      categoryId: item.categoryId,
      title: item.title,
      preview: item.preview,
      price: item.price,
      visibility: item.visibility,
      viewCount: item.viewCount,
      likeCount: item.likeCount,
      commentCount: item.commentCount,
      createdAt: item.createdAt,
    }));

    const returnValue = { posts, meta };

    const ttl = 60 * 5;
    await this.cacheManager.set(cacheKey, returnValue, { ttl });

    return returnValue;
  }

  async findOne(userId: number, id: number) {
    const post = await this.postRepository.findOne({
      relations: { comments: true },
      where: { id },
      withDeleted: true,
    });
    const purchasedPost = await this.purchaseListRepository.findOne({
      where: { postId: id, userId },
    });

    if (!post) {
      throw new NotFoundException('포스트를 찾을수 없습니다.');
    }
    if (
      purchasedPost?.postId !== post.id &&
      post.visibility === VisibilityType.PRIVATE &&
      post.userId !== userId
    ) {
      throw new NotFoundException('비공개 처리된 포스트입니다.');
    }
    if (purchasedPost?.postId !== post.id && post.price > 0) {
      post.content = '구매시 볼수있는 내용입니다';
    }
    if (post.deletedAt && purchasedPost?.postId !== post.id) {
      throw new NotFoundException('삭제된 포스트입니다.');
    }

    post.deletedAt = undefined;
    post.comments = post.comments.splice(0, 5);
    console.log(post.comments);

    return post;
  }

  async readOne(id: number) {
    const post = await this.postRepository.findOne({
      relations: { comments: true },
      where: { id, deletedAt: null, visibility: VisibilityType.PUBLIC },
    });
    if (!post) {
      throw new NotFoundException('포스트를 찾을수 없습니다.');
    }
    if (post.price > 0) {
      post.content = '로그인후 확인하실수 있습니다..';
    }
    console.log(post);
    post.comments = post.comments.splice(0, 5);

    return post;
  }

  async incrementViewCount(id: number) {
    await this.postRepository.increment({ id }, 'viewCount', 1);
  }

  async findMy(userId: number, findAllPostDto: FindAllPostDto) {
    const { channelId, page, limit, sort } = findAllPostDto;

    const channel = await this.channelRepository.findOne({
      where: { id: channelId, userId },
    });

    if (!channel) {
      throw new NotFoundException('존재하지 않은 채널입니다.');
    }

    const { items, meta } = await paginate<Post>(
      this.postRepository,
      { page, limit },
      { where: { userId, channelId }, order: { createdAt: sort } }
    );

    return {
      posts: items.map((item) => ({
        id: item.id,
        userId: item.userId,
        channelId: item.channelId,
        seriesId: item.seriesId,
        categoryId: item.categoryId,
        title: item.title,
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
      })),
      meta,
    };
  }

  async update(userId: number, id: number, updatePostDto: UpdatePostDto) {
    const { channelId, seriesId } = updatePostDto;
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
  }

  async createPostLike(userId: number, id: number) {
    const post = await this.postRepository.findOne({
      where: { id },
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

      await queryRunner.commitTransaction();
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
}
