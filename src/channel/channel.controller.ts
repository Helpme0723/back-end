import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ChannelService } from './channel.service';
import { FindAllChannelsDto } from './dtos/find-all-channels.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ChannelIdDto } from './dtos/channel-id.dto';
import { CreateChannelDto } from './dtos/create-channel.dto';
import { UpdateChannelDto } from './dtos/update-channel.dto';
import { AuthGuard } from '@nestjs/passport';
import { UserInfo } from 'src/auth/decorators/user-info.decorator';
import { User } from 'src/user/entities/user.entity';
import { FindAllMyChannelsDto } from './dtos/find-all-my-channels.dto';
import { FindDailyInsightsDto } from './dtos/find-daily-insights.dto';
import { FindMonthlyInsightsDto } from './dtos/find-monthly-insights.dto';

@ApiTags('03.채널')
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
  async createChannel(
    @UserInfo() user: User,
    @Body() createChannelDto: CreateChannelDto
  ) {
    const data = await this.channelService.createChannel(
      user.id,
      createChannelDto
    );

    return {
      status: HttpStatus.CREATED,
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
  async findAllChannels(@Query() { userId, page, limit }: FindAllChannelsDto) {
    const data = await this.channelService.findAllChannels(userId, page, limit);

    return {
      status: HttpStatus.OK,
      message: `${userId}의 채널 목록을 조회했습니다.`,
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
  async findAllMyChannels(
    @UserInfo() user: User,
    @Query() { page, limit }: FindAllMyChannelsDto
  ) {
    const data = await this.channelService.findAllChannels(
      user.id,
      page,
      limit
    );

    return {
      status: HttpStatus.OK,
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
  async findOneChannel(@Param() { id }: ChannelIdDto) {
    const data = await this.channelService.findOneChannel(id);

    return {
      status: HttpStatus.OK,
      message: `${id}번 채널을 조회했습니다.`,
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
  async findOneMyChannel(
    @UserInfo() user: User,
    @Param() { id }: ChannelIdDto
  ) {
    const data = await this.channelService.findOneChannel(id, user.id);

    return {
      status: HttpStatus.OK,
      message: `내 ${id}번 채널을 조회했습니다.`,
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
    @Param() { id }: ChannelIdDto,
    @Body() updateChannelDto: UpdateChannelDto
  ) {
    const data = await this.channelService.updateChannel(
      user.id,
      id,
      updateChannelDto
    );

    return {
      status: HttpStatus.OK,
      message: `${id}번 채널을 수정했습니다.`,
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
  async deleteChannel(@UserInfo() user: User, @Param() { id }: ChannelIdDto) {
    await this.channelService.deleteChannel(user.id, id);

    return {
      status: HttpStatus.OK,
      message: `${id}번 채널을 삭제했습니다.`,
      data: true,
    };
  }

  /**
   * 채널 통계 조회
   * @param param1
   * @returns
   */
  // 채널 통계 조회
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Get(':id/insights')
  async findInsights(@UserInfo() user: User, @Param() { id }: ChannelIdDto) {
    const data = await this.channelService.findInsights(user.id, id);

    return {
      status: HttpStatus.OK,
      message: `${id}번 채널의 통계를 조회했습니다.`,
      data,
    };
  }

  /**
   * 일별 포스트 통계 전체 조회
   * @param param1
   * @param findDailyInsightsDto
   * @returns
   */
  // 일별 포스트 통계 전체 조회
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Get(':id/insights/daily')
  async findDailyInsights(
    @UserInfo() user: User,
    @Param() { id }: ChannelIdDto,
    @Query() findDailyInsightsDto: FindDailyInsightsDto
  ) {
    const data = await this.channelService.findDailyInsights(
      user.id,
      id,
      findDailyInsightsDto
    );

    return {
      status: HttpStatus.OK,
      message: `${id}번 채널의 데일리 통계를 조회했습니다.`,
      data,
    };
  }

  /**
   * 월별 포스트 통계 전체 조회
   * @param param1
   * @param findMonthlyInsightsDto
   * @returns
   */
  // 월별 포스트 통계 전체 조회
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Get(':id/insights/monthly')
  async findMonthlyInsights(
    @UserInfo() user: User,
    @Param() { id }: ChannelIdDto,
    @Query() findMonthlyInsightsDto: FindMonthlyInsightsDto
  ) {
    const data = await this.channelService.findMonthlyInsights(
      user.id,
      id,
      findMonthlyInsightsDto
    );

    return {
      status: HttpStatus.OK,
      message: `${id}번 채널의 먼슬리 통계를 조회했습니다.`,
      data,
    };
  }
}
