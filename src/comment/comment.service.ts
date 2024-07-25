import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './entities/comment.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { Post } from 'src/post/entities/post.entity';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { CommentLike } from './entities/comment-like.entity';
import { CreateCommentLikeDto } from './dto/create-comment-like.dto';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    @InjectRepository(CommentLike)
    private readonly commentLikeRepository: Repository<CommentLike>,
  ) {}

  //댓글 생성 api
  async createComment(createCommentDto: CreateCommentDto) {
    const post = await this.postRepository.findOne({ where: { id: createCommentDto.postId } });
    if (!post) {
      throw new NotFoundException('포스트를 찾을 수 없습니다.');
    }

    const comment = this.commentRepository.create(createCommentDto);
    return this.commentRepository.save(comment);
  }


  //댓글 수정 api
  async updateComment(userId: number, commentId: number, updateCommentDto: UpdateCommentDto){
    const comment = await this.commentRepository.findOne({ where: { id: commentId, userId: userId } });
    if (!comment) {
      throw new NotFoundException('댓글을 찾을 수 없습니다.');
    }

    const { content } = updateCommentDto;
    if (!content) {
      throw new BadRequestException('수정된 내용이 없습니다.');
    }

    const updatedComment = await this.commentRepository.save({ id: comment.id, ...updateCommentDto });
    return updatedComment;
  }

  //댓글 삭제 api
  async deleteComment(userId: number, commentId: number){
    const comment = await this.commentRepository.findOne({ where: { id: commentId, userId: userId } });
    if (!comment) {
      throw new NotFoundException('댓글을 찾을 수 없습니다.');
    }

    await this.commentRepository.softDelete({ id: comment.id });

    return true;
  }

  //댓글 좋아요 등록 api
  async createCommentLike(userId: number, createCommentLikeDto: CreateCommentLikeDto){
    const { commentId } = createCommentLikeDto;
    const comment = await this.commentRepository.findOne({ where: { id: commentId } });

    if (!comment) {
      throw new NotFoundException('댓글을 찾을 수 없습니다.');
    }

    // 본인의 댓글인지 확인
    if (comment.userId === userId) {
      throw new BadRequestException('본인의 댓글에는 좋아요를 누를 수 없습니다.');
    }

    // 이미 좋아요를 눌렀는지 확인
    const existingLike = await this.commentLikeRepository.findOne({ where: { userId, commentId } });
    if (existingLike) {
      throw new BadRequestException('이미 이 댓글에 좋아요를 눌렀습니다.');
    }

    const commentLike = this.commentLikeRepository.create({ userId, commentId });

    // likeCount 증가
    comment.likeCount += 1;
    await this.commentRepository.save(comment);

    return this.commentLikeRepository.save(commentLike);
  }
  

  // 댓글 좋아요 삭제 api
  async deleteCommentLike(userId: number, commentId: number){
    
    const comment = await this.commentRepository.findOne({ where: { id: commentId } });
    if (!comment) {
      throw new NotFoundException('댓글을 찾을 수 없습니다.');
    }
    
    const commentLike = await this.commentLikeRepository.findOne({ where: { userId, commentId } });
    if (!commentLike) {
      throw new NotFoundException('좋아요를 누르지 않았습니다.');
    }

    // likeCount 감소
    comment.likeCount -= 1;
    await this.commentRepository.save(comment);

    await this.commentLikeRepository.remove(commentLike);
  }
}