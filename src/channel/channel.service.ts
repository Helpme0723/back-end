import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Channel } from './entities/channel.entity';
import { Repository } from 'typeorm';
import { CreateChannelDto } from './dtos/create-channel.dto';

@Injectable()
export class ChannelService {
  constructor(
    @InjectRepository(Channel)
    private readonly channelRepository: Repository<Channel>
  ) {}

  async createChannel(userId: number, createChannelDto: CreateChannelDto, imageUrl?: string) {
    const { title, description } = createChannelDto;
    const channel = await this.channelRepository.save({ userId, title, description, imageUrl });

    return channel;
  }
}
