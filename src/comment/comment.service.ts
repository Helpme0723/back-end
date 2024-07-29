import {
  BadRequestException,
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Comment } from './entities/comment.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { Post } from 'src/post/entities/post.entity';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { CommentLike } from './entities/comment-like.entity';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    private readonly dataSource: DataSource
  ) {}

  // 댓글 생성 API
  async createComment(createCommentDto: CreateCommentDto & { userId: number }) {
    const post = await this.postRepository.findOne({
      where: { id: createCommentDto.postId },
    });
    if (!post) {
      throw new NotFoundException('포스트를 찾을 수 없습니다.');
    }

    const comment = this.commentRepository.create(createCommentDto);
    return this.commentRepository.save(comment);
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

    await this.commentRepository.softDelete({ id: comment.id });
    return true;
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
        throw new BadRequestException('이미 이 댓글에 좋아요를 눌렀습니다.');
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
      throw new InternalServerErrorException(`에러: ${error.message}`);
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
        throw new NotFoundException('좋아요를 누르지 않았습니다.');
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
      throw new InternalServerErrorException(`에러: ${error.message}`);
    }
  }
}
