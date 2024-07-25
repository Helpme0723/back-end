import { Body, Controller, Delete, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { SubscribeService } from './subscribe.service';
import { AuthGuard } from '@nestjs/passport';
import { UserInfo } from 'src/auth/decorators/user-info.decorator';
import { User } from 'src/user/entities/user.entity';
import { SubscribeDto } from './dtos/subscribe.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('구독')
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
  async createSubscribe(@UserInfo() user: User, @Body() subscribeDto: SubscribeDto) {
    const data = await this.subscribeService.createSubscribe(user.id, subscribeDto.channelId);

    return {
      status: HttpStatus.CREATED,
      message: `${subscribeDto.channelId}번 채널을 구독했습니다.`,
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
  async deleteSubsCribe(@UserInfo() user: User, @Body() subscribeDto: SubscribeDto) {
    const data = await this.subscribeService.deleteSubscribe(user.id, subscribeDto.channelId);

    return {
      status: HttpStatus.OK,
      message: `${subscribeDto.channelId}번 채널의 구독을 취소했습니다.`,
      data,
    };
  }
}
