import { Module } from '@nestjs/common';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { PostLike } from './entities/post-like.entity';
import { Post } from './entities/post.entity';
import { Tag } from './entities/tag.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Category, PostLike, Post, Tag])],
  controllers: [PostController],
  providers: [PostService],
})
export class PostModule {}
