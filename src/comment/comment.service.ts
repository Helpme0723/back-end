import {
  BadRequestException,
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  HttpException,
  ConflictException,
  Inject,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Comment } from './entities/comment.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { Post } from 'src/post/entities/post.entity';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { CommentLike } from './entities/comment-like.entity';
import { paginate } from 'nestjs-typeorm-paginate';
import { VisibilityType } from 'src/post/types/visibility.type';
import { FindAllCommentsDto } from './dto/pagination.dto';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    private readonly dataSource: DataSource,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache
  ) {}

  // 댓글 생성 API
  async createComment(createCommentDto: CreateCommentDto & { userId: number }) {
    const post = await this.postRepository.findOne({
      where: { id: createCommentDto.postId },
    });
    if (!post) {
      throw new NotFoundException('포스트를 찾을 수 없습니다.');
    }

    if (post.visibility === VisibilityType.PRIVATE) {
      throw new BadRequestException(
        '비공개 포스트에는 댓글을 작성 할 수 없습니다.'
      );
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager.increment(
        Post,
        { id: post.id },
        'commentCount',
        1
      );

      const commentData = this.commentRepository.create(createCommentDto);
      const comment = await queryRunner.manager.save(Comment, commentData);

      // 댓글에 대한 유저 정보 포함하여 재조회
      const fullComment = await queryRunner.manager.findOne(Comment, {
        where: { id: comment.id },
        relations: ['user'], // 유저 정보를 포함하여 조회
      });

      await queryRunner.commitTransaction();
      await queryRunner.release();

      if (!fullComment)
        throw new InternalServerErrorException('댓글 로드 실패');

      return {
        ...fullComment
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();

      throw new InternalServerErrorException('인터넷 서버 에러');
    }
  }

  async findAllComments(
    findAllCommentsDto: FindAllCommentsDto
  ) /*: Promise<Pagination<Comment>>*/ {
    const { postId, page, limit } = findAllCommentsDto;
    // //레디스에서 사용할 키
    // const cacheKey = `comments:${postId}-${page}-${limit}`;
    // //레디스에서 데이터가 있는지 확인하깅
    // const cachedComments = await this.cacheManager.get<string>(cacheKey);

    // if (cachedComments) {
    //   return cachedComments;
    // }

    const post = await this.postRepository.findOne({ where: { id: postId } });

    if (!post) {
      throw new NotFoundException('존재하지 않는 포스트입니다.');
    }

    const queryBuilder = this.commentRepository
      .createQueryBuilder('comment')
      .leftJoinAndSelect('comment.user', 'user')
      .where('comment.postId = :postId', { postId })
      .orderBy('comment.createdAt', 'DESC');

    const comments = await paginate<Comment>(queryBuilder, { page, limit });
    // const ttl = 60 * 30;
    // await this.cacheManager.set(cacheKey, comments, { ttl });
    return comments;
  }

  // 댓글 수정 API
  async updateComment(
    userId: number,
    commentId: number,
    updateCommentDto: UpdateCommentDto
  ) {
    const comment = await this.commentRepository.findOne({
      where: { id: commentId, userId },
    });
    if (!comment) {
      throw new NotFoundException('댓글을 찾을 수 없습니다.');
    }

    const post = await this.postRepository.findOne({
      where: { id: comment.postId },
    });
    if (!post) {
      throw new NotFoundException('포스트를 찾을 수 없습니다.');
    }

    if (post.visibility === VisibilityType.PRIVATE) {
      throw new BadRequestException(
        '비공개 포스트에는 댓글을 수정 할 수 없습니다.'
      );
    }

    const updatedComment = await this.commentRepository.save({
      id: comment.id,
      ...updateCommentDto,
    });
    return updatedComment;
  }

  // 댓글 삭제 API
  async deleteComment(userId: number, commentId: number) {
    const comment = await this.commentRepository.findOne({
      where: { id: commentId, userId },
    });
    if (!comment) {
      throw new NotFoundException('댓글을 찾을 수 없습니다.');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager.decrement(
        Post,
        { id: comment.postId },
        'commentCount',
        1
      );

      await queryRunner.manager.softDelete(Comment, { id: comment.id });

      await queryRunner.commitTransaction();
      await queryRunner.release();

      return true;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();

      throw new InternalServerErrorException('인터넷 서버 에러');
    }
  }

  // 댓글 좋아요 등록 API
  async createCommentLike(userId: number, commentId: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const comment = await queryRunner.manager.findOne(Comment, {
        where: { id: commentId },
      });

      if (!comment) {
        throw new NotFoundException(
          `댓글을 찾을 수 없습니다. commentId: ${commentId}`
        );
      }

      if (comment.userId === userId) {
        throw new BadRequestException(
          '본인의 댓글에는 좋아요를 누를 수 없습니다.'
        );
      }

      const existingLike = await queryRunner.manager.findOne(CommentLike, {
        where: { userId, commentId },
      });
      if (existingLike) {
        throw new ConflictException('이미 이 댓글에 좋아요를 눌렀습니다.');
      }

      const commentLike = queryRunner.manager.create(CommentLike, {
        userId,
        commentId,
      });

      // likeCount 증가를 원자적 연산으로 처리
      await queryRunner.manager.increment(
        Comment,
        { id: commentId },
        'likeCount',
        1
      );
      const savedCommentLike = await queryRunner.manager.save(
        CommentLike,
        commentLike
      );

      await queryRunner.commitTransaction();
      await queryRunner.release();
      return savedCommentLike;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
      if (error instanceof HttpException) {
        throw error; // Already has a proper HTTP status
      }
      throw new InternalServerErrorException(`서버 에러: ${error.message}`);
    }
  }

  // 댓글 좋아요 삭제 API
  async deleteCommentLike(userId: number, commentId: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const comment = await queryRunner.manager.findOne(Comment, {
        where: { id: commentId },
      });
      if (!comment) {
        throw new NotFoundException(
          `댓글을 찾을 수 없습니다. commentId: ${commentId}`
        );
      }

      const commentLike = await queryRunner.manager.findOne(CommentLike, {
        where: { userId, commentId },
      });
      if (!commentLike) {
        throw new ConflictException('좋아요를 누르지 않았습니다.');
      }

      // likeCount 감소를 원자적 연산으로 처리
      await queryRunner.manager.decrement(
        Comment,
        { id: commentId },
        'likeCount',
        1
      );
      await queryRunner.manager.remove(CommentLike, commentLike);

      await queryRunner.commitTransaction();
      await queryRunner.release();
      return true;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
      if (error instanceof HttpException) {
        throw error; // Already has a proper HTTP status
      }
      throw new InternalServerErrorException(`서버 에러: ${error.message}`);
    }
  }
}
