import { Controller, Get, UseGuards, HttpStatus } from '@nestjs/common';
import { PointService } from './point.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { UserInfo } from 'src/auth/decorators/user-info.decorator';
import { User } from 'src/user/entities/user.entity';

@ApiTags('10.포인트')
@Controller('point')
export class PointController {
  constructor(private readonly pointService: PointService) {}

  /**
   * 유저 포인트 히스토리
   * @param createPurchaseDto
   * @returns 포인트 증감와 상태 메시지
   * */
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Get('/history')
  async getHistory(@UserInfo() user: User) {
    const userId = user.id; // 인증된 사용자의 ID를 가져옴
    const data = await this.pointService.findPointHistory(userId);
    return {
      status: HttpStatus.OK,
      message: '포인트 히스토리 조회 성공',
      data,
    };
  }
}
