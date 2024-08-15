import { Module } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CommentController } from './comment.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comment } from './entities/comment.entity';
import { CommentLike } from './entities/comment-like.entity';
import { Post } from 'src/post/entities/post.entity';
import { CacheModule } from '@nestjs/cache-manager';
import { CacheConfigService } from 'src/configs/cache.config';
import { NotificationsModule } from 'src/notification/notification.module';
import { User } from 'src/user/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Comment, CommentLike, Post, User]),
    CacheModule.registerAsync({
      isGlobal: true,
      useClass: CacheConfigService,
    }),
    NotificationsModule,
  ],

  controllers: [CommentController],
  providers: [CommentService],
})
export class CommentModule {}
