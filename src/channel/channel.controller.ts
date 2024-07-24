import { Body, Controller, Get } from '@nestjs/common';
import { ChannelService } from './channel.service';
import { FindAllChannelsDto } from './dtos/find-all-channels.dto';

@Controller('channels')
export class ChannelController {
  constructor(private readonly channelService: ChannelService) {}

  // 타 유저의 채널 모두 조회
  @Get()
  async findAllChannels(@Body() findAllChannelsDto: FindAllChannelsDto) {
    const data = await this.channelService.findAllChannels(findAllChannelsDto.userId);

    return data;
  }

  // 내 채널 모두 조회
  @Get()
  async findAllMyChannels() {
    const userId = 9;

    const data = await this.channelService.findAllChannels(userId);

    return data;
  }
}
