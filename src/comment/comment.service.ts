import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './entities/comment.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { Post } from 'src/post/entities/post.entity';
import { UpdateCommentDto } from './dto/update-comment.dto';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>
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
}