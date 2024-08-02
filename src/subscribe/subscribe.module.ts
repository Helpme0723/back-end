import { Module } from '@nestjs/common';
import { SubscribeService } from './subscribe.service';
import { SubscribeController } from './subscribe.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Subscribe } from './entities/subscribe.entity';
import { Channel } from 'src/channel/entities/channel.entity';
import { Post } from 'src/post/entities/post.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Subscribe, Channel, Post])],
  controllers: [SubscribeController],
  providers: [SubscribeService],
})
export class SubscribeModule {}
