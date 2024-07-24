import { Body, Controller, Delete, Get, HttpStatus, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ChannelService } from './channel.service';
import { FindAllChannelsDto } from './dtos/find-all-channels.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ChannelIdDto } from './dtos/channel-id.dto';
import { CreateChannelDto } from './dtos/create-channel.dto';
import { UpdateChannelDto } from './dtos/update-channel.dto';
import { AuthGuard } from '@nestjs/passport';
import { UserInfo } from 'src/util/user-info.decorator';
import { User } from 'src/user/entities/user.entity';

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
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Post()
  async createChannel(@UserInfo() user: User, @Body() createChannelDto: CreateChannelDto) {
    const data = await this.channelService.createChannel(user.id, createChannelDto);

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
  async findAllChannels(@Query() findAllChannelsDto: FindAllChannelsDto) {
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
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  async findAllMyChannels(@UserInfo() user: User) {
    const data = await this.channelService.findAllChannels(user.id);

    return {
      statusCode: HttpStatus.OK,
      message: '내 채널 목록을 조회했습니다.',
      data,
    };
  }

  /**
   * 타 유저 채널 상세 조회
   * @param findOneChannelDto
   * @returns
   */
  //타 유저 채널 상세 조회
  @Get(':id')
  async findOneChannel(@Param() channelIdDto: ChannelIdDto) {
    const data = await this.channelService.findOneChannel(channelIdDto.id);

    return {
      statusCode: HttpStatus.OK,
      message: `${channelIdDto.id}번 채널을 조회했습니다.`,
      data,
    };
  }

  /**
   * 내 채널 상세 조회
   * @param channelIdDto
   * @returns
   */
  //내 채널 상세 조회
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Get(':id/me')
  async findOneMyChannel(@UserInfo() user: User, @Param() channelIdDto: ChannelIdDto) {
    const data = await this.channelService.findOneMyChannel(user.id, channelIdDto.id);

    return {
      statusCode: HttpStatus.OK,
      message: `내 ${channelIdDto.id}번 채널을 조회했습니다.`,
      data,
    };
  }

  /**
   * 채널 수정
   * @param channelIdDto
   * @param updateChannelDto
   * @returns
   */
  //채널 수정
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Patch(':id')
  async updateChannel(
    @UserInfo() user: User,
    @Param() channelIdDto: ChannelIdDto,
    @Body() updateChannelDto: UpdateChannelDto
  ) {
    const data = await this.channelService.updateChannel(user.id, channelIdDto.id, updateChannelDto);

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
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  async deleteChannel(@UserInfo() user: User, @Param() channelIdDto: ChannelIdDto) {
    await this.channelService.deleteChannel(user.id, channelIdDto.id);

    return {
      statusCode: HttpStatus.OK,
      message: `${channelIdDto.id}번 채널을 삭제했습니다.`,
      data: true,
    };
  }
}
