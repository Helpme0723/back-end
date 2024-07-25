import { Module } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CommentController } from './comment.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comment } from './entities/comment.entity';
import { CommentLike } from './entities/comment-like.entity';
import { Post } from 'src/post/entities/post.entity';


@Module({
  imports: [TypeOrmModule.forFeature([Comment, CommentLike,Post])],
  controllers: [CommentController],
  providers: [CommentService],
})
export class CommentModule {}