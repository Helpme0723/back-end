import { Module } from '@nestjs/common';
import { SubscribeService } from './subscribe.service';
import { SubscribeController } from './subscribe.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Subscribe } from './entities/subscribe.entity';
import { Channel } from 'src/channel/entities/channel.entity';
import { Post } from 'src/post/entities/post.entity';
import { NotificationsModule } from 'src/notification/notification.module';
import { User } from 'src/user/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Subscribe, Channel, Post, User]),
    NotificationsModule,
  ],
  controllers: [SubscribeController],
  providers: [SubscribeService],
})
export class SubscribeModule {}
