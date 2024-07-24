import { Body, Controller, Delete, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ChannelService } from './channel.service';
import { FindAllChannelsDto } from './dtos/find-all-channels.dto';
import { ApiTags } from '@nestjs/swagger';
import { ChannelIdDto } from './dtos/channel-id.dto';

@ApiTags('채널')
@Controller('channels')
export class ChannelController {
  constructor(private readonly channelService: ChannelService) {}

  /**
   * 타 유저의 채널 모두 조회
   * @param findAllChannelsDto
   * @returns
   */
  // 타 유저의 채널 모두 조회
  @Get()
  async findAllChannels(@Body() findAllChannelsDto: FindAllChannelsDto) {
    const data = await this.channelService.findAllChannels(findAllChannelsDto.userId);

    return data;
  }

  /**
   * 내 채널 모두 조회
   * @returns
   */
  // 내 채널 모두 조회
  @Get('me')
  async findAllMyChannels() {
    const userId = 9;

    const data = await this.channelService.findAllChannels(userId);

    return data;
  }

  /**
   * 채널 상세 조회
   * @param findOneChannelDto
   * @returns
   */
  //채널 상세 조회
  @Get(':id')
  async findOneChannel(@Param() channelIdDto: ChannelIdDto) {
    const data = await this.channelService.findOneChannel(channelIdDto.id);

    return data;
  }

  /**
   * 채널 삭제
   * @param channelIdDto
   * @returns
   */
  //채널 삭제
  @Delete(':id')
  async deleteChannel(@Param() channelIdDto: ChannelIdDto) {
    const userId = 1;
    await this.channelService.deleteChannel(userId, channelIdDto.id);

    return true;
  }
}
