import { Injectable, NotFoundException } from '@nestjs/common';
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
    const channels = await this.channelRepository.find({ where: { userId } });

    return channels;
  }

  // 채널 상세 조회
  async findOneChannel(id: number) {
    const channel = await this.channelRepository.findOneBy({ id });

    if (!channel) {
      throw new NotFoundException('해당 아이디의 채널이 존재하지 않습니다.');
    }

    return channel;
  }
}
