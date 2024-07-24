import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
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
  async findOneChannel(channelId: number) {
    const channel = await this.channelRepository.findOneBy({ id: channelId });

    if (!channel) {
      throw new NotFoundException('해당 아이디의 채널이 존재하지 않습니다.');
    }

    return channel;
  }

  // 채널 삭제
  async deleteChannel(userId: number, channelId: number) {
    const channel = await this.validateChannelOwner(userId, channelId);

    await this.channelRepository.softDelete({ id: channel.id });

    return true;
  }

  // 채널 삭제 or 수정 권한 검사
  async validateChannelOwner(userId: number, channelId: number) {
    const channel = await this.channelRepository.findOneBy({ id: channelId });

    if (!channel) {
      throw new NotFoundException('해당 아이디의 채널이 없습니다.');
    }

    if (channel.userId !== userId) {
      throw new ForbiddenException('권한이 없는 채널입니다.');
    }

    return channel;
  }
}
