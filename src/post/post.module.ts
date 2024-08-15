import { Module } from '@nestjs/common';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { PostLike } from './entities/post-like.entity';
import { Post } from './entities/post.entity';
import { Tag } from './entities/tag.entity';
import { Channel } from 'src/channel/entities/channel.entity';
import { Series } from 'src/series/entities/series.entity';
import { PurchaseList } from 'src/purchase/entities/purchase-list.entity';
import { User } from 'src/user/entities/user.entity';
import { NotificationsModule } from 'src/notification/notification.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Category,
      PostLike,
      Post,
      Tag,
      Channel,
      Series,
      PurchaseList,
      User,
    ]),
    NotificationsModule,
  ],
  controllers: [PostController],
  providers: [PostService],
})
export class PostModule {}
