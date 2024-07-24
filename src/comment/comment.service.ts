import { Injectable, NotFoundException } from '@nestjs/common';
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
  async create(createCommentDto: CreateCommentDto): Promise<Comment> {
    // 포스트가 존재하는지 확인
    const post = await this.postRepository.findOne({ where: { id: createCommentDto.postId } });
    if (!post) {
      throw new NotFoundException('포스트를 찾을 수 없습니다.');
    }

    const comment = this.commentRepository.create(createCommentDto);
    return this.commentRepository.save(comment);
  }


  //댓글 수정 api
  async update(commentId: number, updateCommentDto: UpdateCommentDto): Promise<Comment> {
    const comment = await this.commentRepository.findOne({ where: { id: commentId } });
    if (!comment) {
      throw new NotFoundException('댓글을 찾을 수 없습니다.');
    }

    Object.assign(comment, updateCommentDto);
    return this.commentRepository.save(comment);
  }
}