import { Body, Controller, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { SubscribeService } from './subscribe.service';
import { AuthGuard } from '@nestjs/passport';
import { UserInfo } from 'src/auth/decorators/user-info.decorator';
import { User } from 'src/user/entities/user.entity';
import { CreateSubscribeDto } from './dtos/create-subscribe.dto';
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
  async createSubscribe(@UserInfo() user: User, @Body() createSubscribeDto: CreateSubscribeDto) {
    const data = await this.subscribeService.createSubscribe(user.id, createSubscribeDto.channelId);

    return {
      status: HttpStatus.CREATED,
      message: `${createSubscribeDto.channelId}번 채널을 구독했습니다.`,
      data,
    };
  }
}
