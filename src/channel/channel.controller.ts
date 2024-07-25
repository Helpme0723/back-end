import { Body, Controller, Delete, Get, HttpStatus, Param, Patch, Post } from '@nestjs/common';
import { ChannelService } from './channel.service';
import { FindAllChannelsDto } from './dtos/find-all-channels.dto';
import { ApiTags } from '@nestjs/swagger';
import { ChannelIdDto } from './dtos/channel-id.dto';
import { CreateChannelDto } from './dtos/create-channel.dto';
import { UpdateChannelDto } from './dtos/update-channel.dto';

@ApiTags('채널')
@Controller('channels')
export class ChannelController {
  constructor(private readonly channelService: ChannelService) {}

  /**
   * 채널 생성
   * @param createChannelDto
   * @returns
   */
  // 채널 생성
  @Post()
  async createChannel(@Body() createChannelDto: CreateChannelDto) {
    const userId = 1;

    const data = await this.channelService.createChannel(userId, createChannelDto);

    return {
      statusCode: HttpStatus.CREATED,
      message: '채널을 생성했습니다.',
      data,
    };
  }

  /**
   * 타 유저의 채널 모두 조회
   * @param findAllChannelsDto
   * @returns
   */
  // 타 유저의 채널 모두 조회
  @Get()
  async findAllChannels(@Body() findAllChannelsDto: FindAllChannelsDto) {
    const data = await this.channelService.findAllChannels(findAllChannelsDto.userId);

    return {
      statusCode: HttpStatus.OK,
      message: `${findAllChannelsDto.userId}의 채널 목록을 조회했습니다.`,
      data,
    };
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

    return {
      statusCode: HttpStatus.OK,
      message: '내 채널 목록을 조회했습니다.',
      data,
    };
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

    return {
      statusCode: HttpStatus.OK,
      message: `${channelIdDto.id}번 채널을 조회했습니다.`,
      data,
    };
  }

  //채널 수정
  @Patch(':id')
  async updateChannel(@Param() channelIdDto: ChannelIdDto, @Body() updateChannelDto: UpdateChannelDto) {
    const userId = 1;

    const data = this.channelService.updateChannel(userId, channelIdDto.id, updateChannelDto);

    return {
      statusCode: HttpStatus.OK,
      message: `${channelIdDto.id}번 채널을 수정했습니다.`,
      data,
    };
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

    return {
      statusCode: HttpStatus.OK,
      message: `${channelIdDto.id}번 채널을 삭제했습니다.`,
      data: true,
    };
  }
}
