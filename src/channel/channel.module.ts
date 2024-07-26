import { Module } from '@nestjs/common';
import { ChannelService } from './channel.service';
import { ChannelController } from './channel.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Channel } from './entities/channel.entity';
import { AwsModule } from 'src/aws/aws.module';
import { User } from 'src/user/entities/user.entity';
import { Series } from 'src/series/entities/series.entity';
import { Post } from 'src/post/entities/post.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Channel, User, Series, Post]), AwsModule],
  controllers: [ChannelController],
  providers: [ChannelService],
})
export class ChannelModule {}
