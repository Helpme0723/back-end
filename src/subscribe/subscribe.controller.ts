import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { SubscribeService } from './subscribe.service';
import { AuthGuard } from '@nestjs/passport';
import { UserInfo } from 'src/auth/decorators/user-info.decorator';
import { User } from 'src/user/entities/user.entity';
import { SubscribeDto } from './dtos/subscribe.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { FindAllSubscribesDto } from './dtos/find-all-subscribes.dto';

@ApiTags('07.구독')
@Controller('subscribes')
export class SubscribeController {
  constructor(private readonly subscribeService: SubscribeService) {}

  /**
   * 채널 구독
   * @param createSubscribeDto
   * @returns
   */
  //채널 구독
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Post()
  async createSubscribe(
    @UserInfo() user: User,
    @Body() { channelId }: SubscribeDto
  ) {
    const data = await this.subscribeService.createSubscribe(
      user.id,
      channelId
    );

    return {
      status: HttpStatus.CREATED,
      message: `${channelId}번 채널을 구독했습니다.`,
      data,
    };
  }

  /**
   * 채널 구독 취소
   * @param subscribeDto
   * @returns
   */
  // 채널 구독 취소
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Delete()
  async deleteSubsCribe(
    @UserInfo() user: User,
    @Body() { channelId }: SubscribeDto
  ) {
    const data = await this.subscribeService.deleteSubscribe(
      user.id,
      channelId
    );

    return {
      status: HttpStatus.OK,
      message: `${channelId}번 채널의 구독을 취소했습니다.`,
      data,
    };
  }

  /**
   * 내 구독 목록 조회
   * @param findAllSubscribesDto
   * @returns
   */
  // 내 구독 목록 조회
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Get()
  async findAllSubscribe(
    @UserInfo() user: User,
    @Query() { page, limit }: FindAllSubscribesDto
  ) {
    const data = await this.subscribeService.findAllSubsCribe(
      user.id,
      page,
      limit
    );

    return {
      status: HttpStatus.OK,
      message: '내 구독 목록을 조회했습니다.',
      data,
    };
  }

  /**
   * 내가 구독한 채널의 포스트 모아보기
   * @param param1
   * @returns
   */
  // 내가 구독한 채널의 포스트 모아보기
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Get('posts')
  async findAllSubscribePosts(
    @UserInfo() user: User,
    @Query() { page, limit }: FindAllSubscribesDto
  ) {
    const data = await this.subscribeService.findAllSubscribePosts(
      user.id,
      page,
      limit
    );

    return {
      status: HttpStatus.OK,
      message: '내가 구독한 채널들의 전체 포스트 조회에 성공했습니다.',
      data,
    };
  }
}
