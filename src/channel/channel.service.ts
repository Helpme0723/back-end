import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Channel } from './entities/channel.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ChannelService {
  constructor(
    @InjectRepository(Channel)
    private readonly channelRepository: Repository<Channel>
  ) {}

  // 채널 모두 조회
  async findAllChannels(userId: number) {
    console.log(userId);
    const channels = await this.channelRepository.find({ where: { userId } });

    return channels;
  }
}
